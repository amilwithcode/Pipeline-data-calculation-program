import { NextResponse } from "next/server";

export async function GET() {
  try {
    return NextResponse.json({ shipments: [] });
  } catch {
    return NextResponse.json({ shipments: [] });
  }
}

export const dynamic = "force-dynamic";

