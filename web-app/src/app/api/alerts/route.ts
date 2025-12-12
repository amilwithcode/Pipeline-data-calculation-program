import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ alerts: [], counts: { critical: 0, warning: 0, info: 0 } });
}

export const dynamic = "force-dynamic";
