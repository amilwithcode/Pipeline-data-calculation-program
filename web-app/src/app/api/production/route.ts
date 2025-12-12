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
    const items = [
      { date: 'Mon', production: 4200, target: 4500, defects: 12 },
      { date: 'Tue', production: 4800, target: 4500, defects: 8 },
      { date: 'Wed', production: 4650, target: 4500, defects: 15 },
      { date: 'Thu', production: 5100, target: 4500, defects: 6 },
      { date: 'Fri', production: 4900, target: 4500, defects: 10 },
      { date: 'Sat', production: 3800, target: 4000, defects: 4 },
      { date: 'Sun', production: 2200, target: 2500, defects: 2 },
    ];
    return NextResponse.json({ items });
  }
}

export const dynamic = "force-dynamic";
