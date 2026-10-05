import crypto from "crypto";
import Razorpay from "razorpay";
import { prisma } from "@/lib/db/prisma";

export function getRazorpayConfig() {
  const keyId = (process.env["RAZORPAY_KEY_ID"] || "").trim();
  const keySecret = (process.env["RAZORPAY_KEY_SECRET"] || "").trim();
  const webhookSecret = (process.env["RAZORPAY_WEBHOOK_SECRET"] || "").trim();

  const isConfigured = Boolean(keyId && keySecret);

  return {
    keyId,
    keySecret,
    webhookSecret,
    isConfigured,
  };
}

export function getRazorpayClient(): Razorpay | null {
  const { keyId, keySecret, isConfigured } = getRazorpayConfig();
  if (!isConfigured) return null;

  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
}

/**
 * Timing-safe signature verification for Razorpay payment callback:
 * HMAC_SHA256(razorpay_order_id + "|" + razorpay_payment_id, secret) === razorpay_signature
 */
export function verifyPaymentSignature(params: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  signature: string;
}): boolean {
  const { keySecret } = getRazorpayConfig();
  if (!keySecret || !params.signature || !params.razorpayOrderId || !params.razorpayPaymentId) {
    return false;
  }

  const payload = `${params.razorpayOrderId}|${params.razorpayPaymentId}`;
  const expectedSignature = crypto
    .createHmac("sha256", keySecret)
    .update(payload)
    .digest("hex");

  if (expectedSignature.length !== params.signature.length) {
    return false;
  }

  try {
    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature, "utf-8"),
      Buffer.from(params.signature, "utf-8")
    );
  } catch {
    return false;
  }
}

/**
 * Timing-safe signature verification for Razorpay Webhook:
 * HMAC_SHA256(rawRequestBody, webhookSecret) === x-razorpay-signature
 */
export function verifyWebhookSignature(rawBody: string, signature: string): boolean {
  const { webhookSecret } = getRazorpayConfig();
  if (!webhookSecret || !signature || !rawBody) {
    return false;
  }

  const expectedSignature = crypto
    .createHmac("sha256", webhookSecret)
    .update(rawBody)
    .digest("hex");

  if (expectedSignature.length !== signature.length) {
    return false;
  }

  try {
    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature, "utf-8"),
      Buffer.from(signature, "utf-8")
    );
  } catch {
    return false;
  }
}

export interface FinalizeOrderResult {
  ok: boolean;
  alreadyPaid?: boolean;
  reviewRequired?: boolean;
  error?: string;
  order?: any;
}

/**
 * Idempotently finalizes a paid online order in a database transaction:
 * 1. Checks if already marked paid (idempotency guard)
 * 2. Checks product stock availability
 * 3. Handles edge cases (if stock was depleted before capture confirmation, marks payment_review)
 * 4. Decrements stock atomically
 * 5. Marks order confirmed and paid
 * 6. Updates customer lifetime spend and order metrics
 */
export async function finalizePaidOrder(params: {
  orderId?: string;
  orderNo?: string;
  razorpayOrderId?: string;
  razorpayPaymentId: string;
}): Promise<FinalizeOrderResult> {
  const { orderId, orderNo, razorpayOrderId, razorpayPaymentId } = params;

  return await prisma.$transaction(async (tx) => {
    const whereClause: any = {};
    if (orderId) whereClause.id = orderId;
    else if (orderNo) whereClause.orderNo = orderNo;
    else if (razorpayOrderId) whereClause.razorpayOrderId = razorpayOrderId;
    else {
      return { ok: false, error: "No order identifier provided." };
    }

    const order = await tx.order.findFirst({
      where: whereClause,
      include: { items: true },
    });

    if (!order) {
      return { ok: false, error: "Order not found." };
    }

    // Idempotency: If order was already fulfilled/paid (e.g., duplicate callback or webhook), return successfully
    if (order.paymentStatus === "paid") {
      return {
        ok: true,
        alreadyPaid: true,
        order,
      };
    }

    // Validate stock for all items
    let hasStockIssue = false;
    const stockItemsToUpdate: Array<{ id: string; qty: number; name: string }> = [];

    for (const item of order.items) {
      if (!item.productId) {
        const prod = await tx.product.findUnique({ where: { slug: item.slug } });
        if (!prod || (prod.stock ?? 0) < item.qty) {
          hasStockIssue = true;
          break;
        }
        stockItemsToUpdate.push({ id: prod.id, qty: item.qty, name: item.name });
      } else {
        const prod = await tx.product.findUnique({ where: { id: item.productId } });
        if (!prod || (prod.stock ?? 0) < item.qty) {
          hasStockIssue = true;
          break;
        }
        stockItemsToUpdate.push({ id: prod.id, qty: item.qty, name: item.name });
      }
    }

    const today = new Date().toISOString().slice(0, 10);

    // PART 9 Edge case: Captured payment succeeded, but stock ran out in the interim
    if (hasStockIssue) {
      const updatedOrder = await tx.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: "paid",
          status: "payment_review",
          paymentProvider: "razorpay",
          razorpayPaymentId,
          paidAt: new Date(),
          updatedOn: today,
          paymentFailureReason:
            "Payment captured but stock became insufficient. Flagged for priority manual fulfillment or refund.",
          notes: `${order.notes || ""}\n[SYSTEM ALERT]: Stock became unavailable after payment. Payment captured with ID: ${razorpayPaymentId}. Requires manual fulfillment or refund.`.trim(),
        },
        include: { items: true },
      });

      return {
        ok: false,
        reviewRequired: true,
        error:
          "Payment was captured, but one or more items went out of stock. Your order has been placed on priority review.",
        order: updatedOrder,
      };
    }

    // Decrement stock atomically
    for (const item of stockItemsToUpdate) {
      const updated = await tx.product.updateMany({
        where: {
          id: item.id,
          stock: { gte: item.qty },
        },
        data: {
          stock: { decrement: item.qty },
        },
      });

      if (updated.count === 0) {
        // Concurrent race condition between check and update
        const flaggedOrder = await tx.order.update({
          where: { id: order.id },
          data: {
            paymentStatus: "paid",
            status: "payment_review",
            paymentProvider: "razorpay",
            razorpayPaymentId,
            paidAt: new Date(),
            updatedOn: today,
            paymentFailureReason:
              "Payment captured but stock contention occurred. Flagged for review/refund.",
            notes: `${order.notes || ""}\n[SYSTEM ALERT]: Stock contention for item ${item.name} after payment capture. Payment ID: ${razorpayPaymentId}.`.trim(),
          },
          include: { items: true },
        });

        return {
          ok: false,
          reviewRequired: true,
          error:
            "Payment was captured, but stock changed before completion. Flagged for priority review.",
          order: flaggedOrder,
        };
      }
    }

    // Mark confirmed and paid
    const finalizedOrder = await tx.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: "paid",
        status: "confirmed",
        paymentProvider: "razorpay",
        razorpayPaymentId,
        paidAt: new Date(),
        updatedOn: today,
        paymentFailureReason: null,
      },
      include: { items: true },
    });

    // Update customer metrics
    const customerEmail = order.email.trim().toLowerCase();
    const existingCustomer = await tx.customer.findUnique({
      where: { email: customerEmail },
    });

    if (existingCustomer) {
      await tx.customer.update({
        where: { email: customerEmail },
        data: {
          orders: { increment: 1 },
          spent: { increment: order.total },
          lastOrder: today,
          status: "active",
        },
      });
    } else {
      await tx.customer.create({
        data: {
          name: order.customer.trim(),
          email: customerEmail,
          phone: order.phone.trim(),
          orders: 1,
          spent: order.total,
          firstOrder: today,
          lastOrder: today,
          status: "active",
        },
      });
    }

    return {
      ok: true,
      order: finalizedOrder,
    };
  });
}

export async function recordFailedPayment(params: {
  razorpayOrderId?: string;
  orderId?: string;
  reason?: string;
}) {
  const { razorpayOrderId, orderId, reason } = params;
  const whereClause: any = {};
  if (orderId) whereClause.id = orderId;
  else if (razorpayOrderId) whereClause.razorpayOrderId = razorpayOrderId;
  else return;

  const order = await prisma.order.findFirst({ where: whereClause });
  if (!order) return;

  if (order.paymentStatus === "paid") return;

  await prisma.order.update({
    where: { id: order.id },
    data: {
      paymentStatus: "failed",
      paymentFailureReason: reason || "Payment failed at gateway",
      updatedOn: new Date().toISOString().slice(0, 10),
    },
  });
}

export async function recordRefundedPayment(params: {
  razorpayPaymentId?: string;
  razorpayOrderId?: string;
  orderId?: string;
}) {
  const { razorpayPaymentId, razorpayOrderId, orderId } = params;
  const whereClause: any = {};
  if (orderId) whereClause.id = orderId;
  else if (razorpayPaymentId) whereClause.razorpayPaymentId = razorpayPaymentId;
  else if (razorpayOrderId) whereClause.razorpayOrderId = razorpayOrderId;
  else return;

  const order = await prisma.order.findFirst({ where: whereClause });
  if (!order) return;

  await prisma.order.update({
    where: { id: order.id },
    data: {
      paymentStatus: "refunded",
      status: "returned",
      updatedOn: new Date().toISOString().slice(0, 10),
    },
  });
}
