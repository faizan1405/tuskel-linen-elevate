import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getRazorpayConfig, getRazorpayClient } from "@/lib/payments/razorpay";
import { z } from "zod";

export const dynamic = "force-dynamic";

const COUPONS: Record<string, number> = {
  TUSKEL10: 0.1,
  SUMMER15: 0.15,
};

const createPaymentOrderSchema = z.object({
  customer: z.object({
    name: z.string().trim().min(2, "Full name must be at least 2 characters."),
    email: z.string().trim().email("Enter a valid email address."),
    phone: z.string().trim().regex(/^[0-9]{10}$/, "Mobile number must be exactly 10 digits."),
    address: z.string().trim().min(5, "Street address must be at least 5 characters."),
    city: z.string().trim().min(2, "City is required."),
    state: z.string().trim().min(2, "State is required."),
    pincode: z.string().trim().regex(/^[0-9]{6}$/, "Postcode must be exactly 6 digits."),
  }),
  items: z.array(
    z.object({
      slug: z.string().trim().min(1, "Product slug is required."),
      size: z.string().trim().min(1, "Size is required."),
      qty: z.number().int().min(1, "Quantity must be at least 1."),
    })
  ).min(1, "Cart cannot be empty."),
  coupon: z.string().trim().optional(),
  shippingMethod: z.enum(["standard", "express"]).default("standard"),
});

async function generateUniqueOrderNo(): Promise<string> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const randomDigits = Math.floor(100000 + Math.random() * 900000);
    const candidate = `TSK-${randomDigits}`;
    const exists = await prisma.order.findUnique({ where: { orderNo: candidate } });
    if (!exists) return candidate;
  }
  return `TSK-${Date.now().toString().slice(-6)}`;
}

export async function POST(req: Request) {
  try {
    const config = getRazorpayConfig();
    const razorpay = getRazorpayClient();

    if (!config.isConfigured || !razorpay) {
      return NextResponse.json(
        { error: "Online payments are temporarily unavailable. Please choose Cash on Delivery." },
        { status: 503 }
      );
    }

    const rawBody = await req.json();
    const parsed = createPaymentOrderSchema.safeParse(rawBody);

    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      return NextResponse.json(
        { error: firstIssue ? firstIssue.message : "Invalid order details." },
        { status: 400 }
      );
    }

    const { customer, items, coupon, shippingMethod } = parsed.data;

    // 1. Authoritative verification of each item against MySQL database
    const validatedItems: Array<{
      productRecordId: string;
      slug: string;
      name: string;
      size: string;
      qty: number;
      price: number;
    }> = [];

    let subtotal = 0;

    for (const item of items) {
      const dbProduct = await prisma.product.findUnique({
        where: { slug: item.slug },
      });

      if (!dbProduct) {
        return NextResponse.json(
          { error: `Product "${item.slug}" was not found.` },
          { status: 400 }
        );
      }

      if (dbProduct.status && dbProduct.status !== "active") {
        return NextResponse.json(
          { error: `"${dbProduct.name}" is currently unavailable.` },
          { status: 400 }
        );
      }

      const prodSizes = Array.isArray(dbProduct.sizes) ? (dbProduct.sizes as string[]) : [];
      if (prodSizes.length > 0 && !prodSizes.includes(item.size)) {
        return NextResponse.json(
          { error: `Size "${item.size}" is unavailable for "${dbProduct.name}".` },
          { status: 400 }
        );
      }

      // Check stock availability
      const currentStock = dbProduct.stock ?? 0;
      if (currentStock < item.qty) {
        return NextResponse.json(
          { error: `Insufficient stock for "${dbProduct.name}". Only ${currentStock} item(s) available.` },
          { status: 400 }
        );
      }

      // Authoritative price comes strictly from DB
      const unitPrice = Number(dbProduct.price);
      subtotal += unitPrice * item.qty;

      validatedItems.push({
        productRecordId: dbProduct.id,
        slug: dbProduct.slug,
        name: dbProduct.name,
        size: item.size,
        qty: item.qty,
        price: unitPrice,
      });
    }

    // 2. Authoritative discount calculation
    let discount = 0;
    if (coupon) {
      const normalizedCoupon = coupon.trim().toUpperCase();
      const rate = COUPONS[normalizedCoupon] ?? 0;
      if (rate > 0) {
        discount = Math.round(subtotal * rate);
      }
    }

    // 3. Shipping calculation
    const shipping = shippingMethod === "express" ? 199 : 0;

    // 4. Authoritative Total
    const total = Math.max(0, subtotal - discount + shipping);
    const amountInPaise = Math.round(total * 100);

    if (amountInPaise <= 0) {
      return NextResponse.json(
        { error: "Order total must be greater than zero for online payment." },
        { status: 400 }
      );
    }

    const orderNo = await generateUniqueOrderNo();
    const today = new Date().toISOString().slice(0, 10);
    const fullShippingAddress = `${customer.address.trim()}, ${customer.city.trim()}, ${customer.state.trim()} - ${customer.pincode.trim()}`;

    // 5. Create Razorpay Order server-side
    const rzpOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: orderNo,
      notes: {
        orderNo,
        customerName: customer.name.trim(),
        customerEmail: customer.email.trim().toLowerCase(),
      },
    });

    if (!rzpOrder || !rzpOrder.id) {
      throw new Error("Failed to initialize order with Razorpay.");
    }

    // 6. Create local Tuskel order with status "payment_pending"
    // Note: Stock is NOT decremented yet. It will be decremented upon payment verification.
    const createdOrder = await prisma.order.create({
      data: {
        orderNo,
        customer: customer.name.trim(),
        email: customer.email.trim().toLowerCase(),
        phone: customer.phone.trim(),
        shippingAddress: fullShippingAddress,
        subtotal,
        discount,
        shipping,
        total,
        paymentMethod: "Razorpay",
        paymentStatus: "pending",
        status: "payment_pending",
        paymentProvider: "razorpay",
        razorpayOrderId: rzpOrder.id,
        placedOn: today,
        updatedOn: today,
        notes: `Online Payment (Razorpay) order (${shippingMethod === "express" ? "Express Shipping" : "Standard Shipping"})`,
        items: {
          create: validatedItems.map((it) => ({
            productId: it.productRecordId,
            slug: it.slug,
            name: it.name,
            size: it.size,
            qty: it.qty,
            price: it.price,
          })),
        },
      },
    });

    return NextResponse.json(
      {
        ok: true,
        orderId: createdOrder.id,
        orderNo: createdOrder.orderNo,
        razorpayOrderId: rzpOrder.id,
        amount: rzpOrder.amount, // in paise
        currency: "INR",
        keyId: config.keyId,
        customer: {
          name: customer.name.trim(),
          email: customer.email.trim(),
          phone: customer.phone.trim(),
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[/api/payments/razorpay/create-order] Error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to initialize payment. Please try again." },
      { status: 500 }
    );
  }
}
