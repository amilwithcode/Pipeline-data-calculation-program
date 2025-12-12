import { NextResponse } from "next/server";

export async function GET() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;
  try {
    if (url && key) {
      const res = await fetch(`${url}/rest/v1/production_weekly?select=date,production,target,defects`, {
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
          Accept: "application/json",
        },
        cache: "no-store",
      });
      if (!res.ok) throw new Error("supabase_error");
      const rows = await res.json();
      const items = (Array.isArray(rows) ? rows : []).map((r: any) => ({
        date: String(r.date ?? ""),
        production: Number(r.production ?? 0),
        target: Number(r.target ?? 0),
        defects: Number(r.defects ?? 0),
      }));
      return NextResponse.json({ items });
    }
    throw new Error("missing_env");
  } catch {
    return NextResponse.json({ items: [] });
  }
}

export const dynamic = "force-dynamic";
