import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, phone, subject, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Name, email, and message are required" }, { status: 400 });
    }

    const inquiry = await prisma.inquiry.create({
      data: {
        name: name.trim(),
        email: email.trim(),
        phone: phone?.trim() || "",
        subject: subject?.trim() || "Website Inquiry",
        message: message.trim(),
        status: "new",
      },
    });

    return NextResponse.json({ inquiry: { id: inquiry.id } }, { status: 201 });
  } catch (error) {
    console.error("[/api/inquiries] POST error:", error);
    return NextResponse.json({ error: "Failed to submit inquiry" }, { status: 500 });
  }
}
