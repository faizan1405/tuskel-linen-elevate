import { NextResponse } from "next/server";
import { getRazorpayConfig } from "@/lib/payments/razorpay";

export const dynamic = "force-dynamic";

export async function GET() {
  const { isConfigured } = getRazorpayConfig();
  return NextResponse.json({
    enabled: isConfigured,
  });
}
