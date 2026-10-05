import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { formatCustomer } from "@/lib/db/formatters";
import { requireAdminAuth } from "@/lib/admin/auth-middleware";

export async function GET() {
  const authError = await requireAdminAuth();
  if (authError) return authError;
  try {
    const customers = await prisma.customer.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ customers: customers.map(formatCustomer) });
  } catch (error) {
    console.error("[admin/customers] GET error:", error);
    return NextResponse.json({ error: "Failed to fetch customers" }, { status: 500 });
  }
}
