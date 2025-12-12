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

    // Try to fetch supplier id from Supabase if role is supplier
    if (role === "supplier") {
      try {
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const apikey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        if (url && apikey) {
          const resp = await fetch(`${url}/rest/v1/suppliers?select=id,email&email=eq.${encodeURIComponent(email)}`, {
            headers: { apikey, Authorization: `Bearer ${apikey}` },
          });
          const data = await resp.json();
          const found = Array.isArray(data) ? data[0] : null;
          if (found?.id) {
            return NextResponse.json({ ok: true, id: String(found.id) });
          }
        }
      } catch {}
      // Fallback: generate id so UI can navigate
      const rand = (len:number)=>Array.from({length:len},()=>{
        const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
        return chars[Math.floor(Math.random()*chars.length)];
      }).join("");
      return NextResponse.json({ ok: true, id: `sup_${rand(12)}` });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "bad_request" }, { status: 400 });
  }
}

export const dynamic = "force-dynamic";
