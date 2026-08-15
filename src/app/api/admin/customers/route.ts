import { NextResponse } from "next/server";
import { connectDb, CustomerModel } from "@/lib/db/models";
import { requireAdminAuth } from "@/lib/admin/auth-middleware";

export async function GET() {
  const authError = await requireAdminAuth();
  if (authError) return authError;
  try {
    await connectDb();
    const customers = await CustomerModel.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json({ customers: customers.map((c: any) => ({ ...c, id: String(c._id) })) });
  } catch (error) {
    console.error("[admin/customers] GET error:", error);
    return NextResponse.json({ error: "Failed to fetch customers" }, { status: 500 });
  }
}
