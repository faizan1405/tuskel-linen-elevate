import { NextResponse } from "next/server";
import { connectDb, SiteConfigModel } from "@/lib/db/models";

export async function GET() {
  try {
    await connectDb();
    const doc = await SiteConfigModel.findOne({ key: "main" }).lean();
    const value = doc ? (doc as any).value : {
      announcements: ["Summer Sale — Up to 25% Off", "Free Shipping Across India", "Easy 7-Day Returns"],
      coupons: { TUSKEL10: { off: 0.1, label: "10% off your order" }, SUMMER15: { off: 0.15, label: "15% summer sale discount" } },
      freeShippingThreshold: 0, shippingFlat: 0, returnsWindowDays: 7,
      phone: "8859538859", whatsapp: "918859538859", email: "care@tuskel.com",
    };
    return NextResponse.json({ config: value });
  } catch (error) {
    console.error("[admin/site-config] GET error:", error);
    return NextResponse.json({ error: "Failed to fetch site config" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const value = body.value;
    if (!value || typeof value !== "object") {
      return NextResponse.json({ error: "Invalid config payload" }, { status: 400 });
    }
    await connectDb();
    const doc = await SiteConfigModel.findOneAndUpdate(
      { key: "main" }, { $set: { value } }, { upsert: true, new: true }
    ).lean();
    return NextResponse.json({ ok: true, config: (doc as any).value });
  } catch (error) {
    console.error("[admin/site-config] POST error:", error);
    return NextResponse.json({ error: "Failed to save site config" }, { status: 500 });
  }
}
