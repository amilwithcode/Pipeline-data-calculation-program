import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, role, company_name } = body || {};

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ ok: false, error: "invalid_email" }, { status: 400 });
    }
    if (!password || typeof password !== "string" || password.length < 6) {
      return NextResponse.json({ ok: false, error: "invalid_password" }, { status: 400 });
    }
    if (role === "supplier" && (!company_name || typeof company_name !== "string")) {
      return NextResponse.json({ ok: false, error: "missing_company" }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "bad_request" }, { status: 400 });
  }
}

export const dynamic = "force-dynamic";
