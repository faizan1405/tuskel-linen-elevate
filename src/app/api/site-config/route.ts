import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

const DEFAULT_CONFIG = {
  announcements: ["Summer Sale — Up to 25% Off", "Free Shipping Across India", "Easy 7-Day Returns"],
  coupons: { TUSKEL10: { off: 0.1, label: "10% off your order" }, SUMMER15: { off: 0.15, label: "15% summer sale discount" } },
  freeShippingThreshold: 0,
  shippingFlat: 0,
  returnsWindowDays: 7,
  phone: "8859538859",
  whatsapp: "918859538859",
  email: "care@tuskel.com",
};

export async function GET() {
  try {
    const doc = await prisma.siteConfig.findUnique({ where: { key: "main" } });
    const config = doc && doc.value && typeof doc.value === "object" ? doc.value : DEFAULT_CONFIG;
    return NextResponse.json({ config });
  } catch (error) {
    console.error("[/api/site-config] GET error:", error);
    return NextResponse.json({ config: DEFAULT_CONFIG });
  }
}
