import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { formatInquiry } from "@/lib/db/formatters";
import { requireAdminAuth } from "@/lib/admin/auth-middleware";

export async function GET() {
  const authError = await requireAdminAuth();
  if (authError) return authError;
  try {
    const inquiries = await prisma.inquiry.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ inquiries: inquiries.map(formatInquiry) });
  } catch (error) {
    console.error("[admin/inquiries] GET error:", error);
    return NextResponse.json({ error: "Failed to fetch inquiries" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const authError = await requireAdminAuth();
  if (authError) return authError;
  try {
    const body = await req.json();
    const doc = await prisma.inquiry.create({
      data: {
        name: body.name,
        email: body.email,
        phone: body.phone ?? "",
        subject: body.subject ?? "Website Inquiry",
        message: body.message,
        status: body.status ?? "new",
      },
    });
    return NextResponse.json({ inquiry: formatInquiry(doc) }, { status: 201 });
  } catch (error) {
    console.error("[admin/inquiries] POST error:", error);
    return NextResponse.json({ error: "Failed to create inquiry" }, { status: 500 });
  }
}
