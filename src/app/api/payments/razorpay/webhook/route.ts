import { NextResponse } from "next/server";
import {
  getRazorpayConfig,
  verifyWebhookSignature,
  finalizePaidOrder,
  recordFailedPayment,
  recordRefundedPayment,
} from "@/lib/payments/razorpay";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { webhookSecret } = getRazorpayConfig();

    if (!webhookSecret) {
      console.warn("[razorpay/webhook] Webhook received but RAZORPAY_WEBHOOK_SECRET is not configured.");
      return NextResponse.json(
        { error: "Webhook secret is not configured." },
        { status: 503 }
      );
    }

    const signature = req.headers.get("x-razorpay-signature");
    if (!signature) {
      return NextResponse.json(
        { error: "Missing x-razorpay-signature header." },
        { status: 400 }
      );
    }

    // 1. Read RAW request body as text (MANDATORY: Never re-serialize JSON before HMAC check)
    const rawBody = await req.text();

    // 2. Cryptographic HMAC-SHA256 signature verification
    const isValid = verifyWebhookSignature(rawBody, signature);
    if (!isValid) {
      console.warn("[razorpay/webhook] Webhook signature verification failed.");
      return NextResponse.json(
        { error: "Invalid webhook signature." },
        { status: 400 }
      );
    }

    // 3. Parse JSON only AFTER signature has been verified
    let payload: any;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: "Malformed JSON payload." }, { status: 400 });
    }

    const event = payload.event;
    console.info(`[razorpay/webhook] Processing event: ${event}`);

    switch (event) {
      case "payment.captured":
      case "order.paid": {
        const paymentEntity = payload.payload?.payment?.entity;
        const orderEntity = payload.payload?.order?.entity;

        const razorpayOrderId = orderEntity?.id || paymentEntity?.order_id;
        const razorpayPaymentId = paymentEntity?.id;

        if (razorpayOrderId && razorpayPaymentId) {
          const result = await finalizePaidOrder({
            razorpayOrderId,
            razorpayPaymentId,
          });

          if (!result.ok && result.reviewRequired) {
            console.warn(`[razorpay/webhook] Order ${razorpayOrderId} flagged for review: ${result.error}`);
          }
        }
        break;
      }

      case "payment.failed": {
        const paymentEntity = payload.payload?.payment?.entity;
        const razorpayOrderId = paymentEntity?.order_id;
        const errorDescription =
          paymentEntity?.error_description || paymentEntity?.error_reason || "Payment failed";

        if (razorpayOrderId) {
          await recordFailedPayment({
            razorpayOrderId,
            reason: errorDescription,
          });
        }
        break;
      }

      case "refund.processed": {
        const refundEntity = payload.payload?.refund?.entity;
        const paymentEntity = payload.payload?.payment?.entity;

        const razorpayPaymentId = refundEntity?.payment_id || paymentEntity?.id;
        const razorpayOrderId = paymentEntity?.order_id;

        if (razorpayPaymentId || razorpayOrderId) {
          await recordRefundedPayment({
            razorpayPaymentId,
            razorpayOrderId,
          });
        }
        break;
      }

      default:
        // Ignore unhandled events with a 200 OK as per webhook convention
        break;
    }

    return NextResponse.json({ status: "ok" });
  } catch (error: any) {
    console.error("[razorpay/webhook] Unhandled error:", error);
    return NextResponse.json(
      { error: error?.message || "Webhook processing error" },
      { status: 500 }
    );
  }
}
