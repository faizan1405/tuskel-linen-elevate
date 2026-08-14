import { NextResponse } from "next/server";
import { connectDb, InquiryModel } from "@/lib/db/models";

export async function GET() {
  try {
    await connectDb();
    const inquiries = await InquiryModel.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json({ inquiries: inquiries.map((i: any) => ({ ...i, id: String(i._id) })) });
  } catch (error) {
    console.error("[admin/inquiries] GET error:", error);
    return NextResponse.json({ error: "Failed to fetch inquiries" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    await connectDb();
    const doc = await InquiryModel.create(body);
    return NextResponse.json({ inquiry: { ...doc.toObject(), id: String((doc as any)._id) } }, { status: 201 });
  } catch (error) {
    console.error("[admin/inquiries] POST error:", error);
    return NextResponse.json({ error: "Failed to create inquiry" }, { status: 500 });
  }
}
