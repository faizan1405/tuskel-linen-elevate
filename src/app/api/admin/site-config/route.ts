import { NextResponse } from "next/server";
import { connectDb, SiteConfigModel } from "@/lib/db/models";
import { requireAdminAuth } from "@/lib/admin/auth-middleware";

function deepMerge(target: Record<string, unknown>, source: Record<string, unknown>): Record<string, unknown> {
  const result = { ...target };
  for (const key of Object.keys(source)) {
    const sVal = source[key];
    const tVal = result[key];
    if (sVal && typeof sVal === "object" && !Array.isArray(sVal) && tVal && typeof tVal === "object" && !Array.isArray(tVal)) {
      result[key] = deepMerge(tVal as Record<string, unknown>, sVal as Record<string, unknown>);
    } else {
      result[key] = sVal;
    }
  }
  return result;
}

export async function GET() {
  const authError = await requireAdminAuth();
  if (authError) return authError;
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
  const authError = await requireAdminAuth();
  if (authError) return authError;
  try {
    const body = await req.json();
    const incoming = body.value;
    if (!incoming || typeof incoming !== "object") {
      return NextResponse.json({ error: "Invalid config payload" }, { status: 400 });
    }
    await connectDb();
    const existing = await SiteConfigModel.findOne({ key: "main" }).lean();
    const merged = deepMerge(existing ? (existing as any).value : {}, incoming);
    const doc = await SiteConfigModel.findOneAndUpdate(
      { key: "main" }, { $set: { value: merged } }, { upsert: true, new: true }
    ).lean();
    return NextResponse.json({ ok: true, config: (doc as any).value });
  } catch (error) {
    console.error("[admin/site-config] POST error:", error);
    return NextResponse.json({ error: "Failed to save site config" }, { status: 500 });
  }
}
