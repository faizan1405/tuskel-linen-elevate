import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST() {
  return NextResponse.json(
    { error: "Seed endpoint is permanently disabled. Please manage products through the Admin Panel." },
    { status: 403 }
  );
}

export async function GET() {
  return NextResponse.json(
    { error: "Seed endpoint is permanently disabled." },
    { status: 403 }
  );
}
