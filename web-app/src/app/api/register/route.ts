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

    if (role && role !== "supplier") {
      return NextResponse.json({ ok: false, error: "invalid_role" }, { status: 400 });
    }

    // Generate random alphanumeric supplier id
    const rand = (len:number)=>Array.from({length:len},()=>{
      const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
      return chars[Math.floor(Math.random()*chars.length)];
    }).join("");
    const supplierId = `sup_${rand(12)}`;

    // Try to persist in Supabase if env available
    try {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const apikey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      if (url && apikey && role === "supplier") {
        await fetch(`${url}/rest/v1/suppliers`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey,
            Authorization: `Bearer ${apikey}`,
            Prefer: "return=representation",
          },
          body: JSON.stringify({ id: supplierId, email, company: company_name, status: "active" }),
        });
        // ignore response content; even if fails we still return id
      }
    } catch {}

    return NextResponse.json({ ok: true, id: supplierId });
  } catch {
    return NextResponse.json({ ok: false, error: "bad_request" }, { status: 400 });
  }
}

export const dynamic = "force-dynamic";
