import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { formatOrder } from "@/lib/db/formatters";
import {
  getRazorpayConfig,
  getRazorpayClient,
  verifyPaymentSignature,
  finalizePaidOrder,
} from "@/lib/payments/razorpay";
import { z } from "zod";

export const dynamic = "force-dynamic";

const verifySchema = z.object({
  orderId: z.string().trim().min(1, "Order ID is required."),
  razorpay_payment_id: z.string().trim().min(1, "Razorpay payment ID is required."),
  razorpay_order_id: z.string().trim().min(1, "Razorpay order ID is required."),
  razorpay_signature: z.string().trim().min(1, "Razorpay signature is required."),
});

export async function POST(req: Request) {
  try {
    const config = getRazorpayConfig();
    const razorpay = getRazorpayClient();

    if (!config.isConfigured || !razorpay) {
      return NextResponse.json(
        { error: "Payment verification service is temporarily unavailable." },
        { status: 503 }
      );
    }

    const rawBody = await req.json();
    const parsed = verifySchema.safeParse(rawBody);

    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      return NextResponse.json(
        { error: firstIssue ? firstIssue.message : "Invalid verification payload." },
        { status: 400 }
      );
    }

    const {
      orderId,
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
    } = parsed.data;

    // 1. Retrieve order from database (do NOT trust browser-supplied order details blindly)
    const localOrder = await prisma.order.findFirst({
      where: {
        OR: [
          { id: orderId },
          { orderNo: orderId },
          { razorpayOrderId: razorpay_order_id },
        ],
      },
      include: {
        items: true,
      },
    });

    if (!localOrder) {
      return NextResponse.json(
        { error: "Order record not found." },
        { status: 404 }
      );
    }

    // 2. Validate Razorpay Order ID matches our database record
    if (localOrder.razorpayOrderId !== razorpay_order_id) {
      return NextResponse.json(
        { error: "Payment order identifier mismatch." },
        { status: 400 }
      );
    }

    // 3. Idempotency guard: If order is already fulfilled/paid, return success
    if (localOrder.paymentStatus === "paid") {
      return NextResponse.json({
        ok: true,
        order: formatOrder(localOrder),
        message: "Order already verified and confirmed.",
      });
    }

    // 4. Cryptographic HMAC-SHA256 signature verification (Mandatory)
    const isSignatureValid = verifyPaymentSignature({
      razorpayOrderId: localOrder.razorpayOrderId,
      razorpayPaymentId: razorpay_payment_id,
      signature: razorpay_signature,
    });

    if (!isSignatureValid) {
      console.warn(`[verify] Invalid signature attempt for order ${localOrder.orderNo}`);
      await prisma.order.update({
        where: { id: localOrder.id },
        data: {
          paymentStatus: "failed",
          paymentFailureReason: "Cryptographic signature verification failed.",
        },
      });

      return NextResponse.json(
        { error: "Payment verification failed. Invalid transaction signature." },
        { status: 400 }
      );
    }

    // 5. Verify actual captured payment status using Razorpay REST API (Part 13)
    const payment = await razorpay.payments.fetch(razorpay_payment_id);
    if (!payment) {
      return NextResponse.json(
        { error: "Unable to retrieve payment information from Razorpay." },
        { status: 400 }
      );
    }

    if (payment.order_id !== localOrder.razorpayOrderId) {
      return NextResponse.json(
        { error: "Payment record does not match the referenced order." },
        { status: 400 }
      );
    }

    const expectedPaise = Math.round(localOrder.total * 100);
    if (Number(payment.amount) !== expectedPaise) {
      return NextResponse.json(
        { error: "Captured payment amount does not match authoritative order total." },
        { status: 400 }
      );
    }

    if (payment.currency !== "INR") {
      return NextResponse.json(
        { error: "Currency mismatch. Expected INR." },
        { status: 400 }
      );
    }

    if (payment.status !== "captured") {
      return NextResponse.json(
        { error: `Payment is in '${payment.status}' state and has not been captured.` },
        { status: 400 }
      );
    }

    // 6. Idempotently finalize payment in database transaction (stock deduction + confirmation)
    const finalResult = await finalizePaidOrder({
      orderId: localOrder.id,
      razorpayPaymentId: razorpay_payment_id,
    });

    if (!finalResult.ok) {
      if (finalResult.reviewRequired) {
        return NextResponse.json(
          {
            ok: false,
            reviewRequired: true,
            error: finalResult.error,
            order: formatOrder(finalResult.order),
          },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: finalResult.error || "Failed to finalize order." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      order: formatOrder(finalResult.order),
    });
  } catch (error: any) {
    console.error("[/api/payments/razorpay/verify] Error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal error verifying payment." },
      { status: 500 }
    );
  }
}
