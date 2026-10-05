import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { products as staticProducts } from "@/lib/products";
import { z } from "zod";

export const dynamic = "force-dynamic";

const COUPONS: Record<string, number> = {
  TUSKEL10: 0.1,
  SUMMER15: 0.15,
};

const createOrderSchema = z.object({
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

async function generateUniqueOrderNo(tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0]): Promise<string> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const randomDigits = Math.floor(100000 + Math.random() * 900000);
    const candidate = `TSK-${randomDigits}`;
    const exists = await tx.order.findUnique({ where: { orderNo: candidate } });
    if (!exists) return candidate;
  }
  return `TSK-${Date.now().toString().slice(-6)}`;
}

export async function POST(req: Request) {
  try {
    const rawBody = await req.json();
    const parsed = createOrderSchema.safeParse(rawBody);

    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      return NextResponse.json(
        { error: firstIssue ? firstIssue.message : "Invalid order details." },
        { status: 400 }
      );
    }

    const { customer, items, coupon, shippingMethod } = parsed.data;

    const result = await prisma.$transaction(async (tx) => {
      // 1. Authoritative verification of each item from the database
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
        let dbProduct = await tx.product.findUnique({
          where: { slug: item.slug },
        });

        // If not yet in MySQL, check if it's one of the static base products
        if (!dbProduct) {
          const staticP = staticProducts.find((p) => p.slug === item.slug);
          if (staticP) {
            dbProduct = await tx.product.create({
              data: {
                slug: staticP.slug,
                name: staticP.name,
                fabric: staticP.fabric,
                fabricLabel: staticP.fabricLabel,
                colorName: staticP.colorName,
                colorSlug: staticP.colorSlug,
                swatch: staticP.swatch,
                mrp: staticP.mrp,
                price: staticP.price,
                images: staticP.images,
                sizes: staticP.sizes,
                summary: staticP.summary,
                details: staticP.details,
                care: staticP.care,
                fit: staticP.fit,
                modelNote: staticP.modelNote,
                newArrival: staticP.newArrival,
                bestSeller: staticP.bestSeller,
                popularity: staticP.popularity,
                addedOn: staticP.addedOn,
                stock: 100,
                status: "active",
              },
            });
          }
        }

        if (!dbProduct) {
          throw new Error(`Product "${item.slug}" was not found.`);
        }

        if (dbProduct.status && dbProduct.status !== "active") {
          throw new Error(`"${dbProduct.name}" is currently unavailable.`);
        }

        // Check sizes if configured
        const prodSizes = Array.isArray(dbProduct.sizes) ? (dbProduct.sizes as string[]) : [];
        if (prodSizes.length > 0 && !prodSizes.includes(item.size)) {
          throw new Error(`Size "${item.size}" is unavailable for "${dbProduct.name}".`);
        }

        // Stock check
        const currentStock = dbProduct.stock ?? 0;
        if (currentStock < item.qty) {
          throw new Error(`Insufficient stock for "${dbProduct.name}". Only ${currentStock} item(s) available.`);
        }

        // Authoritative price comes from DB only
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

      // 2. Validate and calculate discount
      let discount = 0;
      if (coupon) {
        const normalizedCoupon = coupon.trim().toUpperCase();
        const rate = COUPONS[normalizedCoupon] ?? 0;
        if (rate > 0) {
          discount = Math.round(subtotal * rate);
        }
      }

      // 3. Shipping
      const shipping = shippingMethod === "express" ? 199 : 0;

      // 4. Authoritative Total
      const total = Math.max(0, subtotal - discount + shipping);

      // 5. Atomic Stock Decrement within transaction (rollback on race condition)
      for (const it of validatedItems) {
        const updated = await tx.product.updateMany({
          where: {
            id: it.productRecordId,
            stock: { gte: it.qty },
          },
          data: {
            stock: { decrement: it.qty },
          },
        });

        if (updated.count === 0) {
          throw new Error(`Stock changed for "${it.name}". Please refresh and try again.`);
        }
      }

      // 6. Generate unique order number and create Order + OrderItems
      const orderNo = await generateUniqueOrderNo(tx);
      const today = new Date().toISOString().slice(0, 10);
      const fullShippingAddress = `${customer.address.trim()}, ${customer.city.trim()}, ${customer.state.trim()} - ${customer.pincode.trim()}`;

      const createdOrder = await tx.order.create({
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
          paymentMethod: "Cash on Delivery",
          paymentStatus: "pending",
          status: "pending",
          placedOn: today,
          updatedOn: today,
          notes: `Cash on Delivery order (${shippingMethod === "express" ? "Express Shipping" : "Standard Shipping"})`,
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
        include: {
          items: true,
        },
      });

      // 7. Upsert Customer profile for admin tracking
      const customerEmail = customer.email.trim().toLowerCase();
      const existingCustomer = await tx.customer.findUnique({
        where: { email: customerEmail },
      });

      if (existingCustomer) {
        await tx.customer.update({
          where: { email: customerEmail },
          data: {
            orders: { increment: 1 },
            spent: { increment: total },
            lastOrder: today,
            status: "active",
          },
        });
      } else {
        await tx.customer.create({
          data: {
            name: customer.name.trim(),
            email: customerEmail,
            phone: customer.phone.trim(),
            orders: 1,
            spent: total,
            firstOrder: today,
            lastOrder: today,
            status: "active",
          },
        });
      }

      return {
        order: createdOrder,
        shipping,
      };
    });

    return NextResponse.json(
      {
        ok: true,
        order: {
          id: result.order.id,
          orderNo: result.order.orderNo,
          customer: result.order.customer,
          email: result.order.email,
          phone: result.order.phone,
          shippingAddress: result.order.shippingAddress,
          items: result.order.items.map((it) => ({
            slug: it.slug,
            name: it.name,
            size: it.size,
            qty: it.qty,
            price: it.price,
          })),
          subtotal: result.order.subtotal,
          discount: result.order.discount,
          shipping: result.shipping,
          total: result.order.total,
          paymentMethod: result.order.paymentMethod,
          status: result.order.status,
          placedOn: result.order.placedOn,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[/api/orders] Order creation error:", error);
    const message = error?.message || "Failed to create order. Please try again.";
    const isValidationOrStock =
      message.includes("not found") ||
      message.includes("unavailable") ||
      message.includes("Insufficient stock") ||
      message.includes("Stock changed");

    return NextResponse.json(
      { error: message },
      { status: isValidationOrStock ? 400 : 500 }
    );
  }
}
