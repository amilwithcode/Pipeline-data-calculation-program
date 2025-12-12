import { NextResponse } from "next/server";

export async function GET() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;
  try {
    if (url && key) {
      const res = await fetch(`${url}/rest/v1/suppliers?select=id,name,rating,delivery_score,quality_score,active_orders,trend,status`, {
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
          Accept: "application/json",
        },
        cache: "no-store",
      });
      if (!res.ok) throw new Error("supabase_error");
      const rows = await res.json();
      const suppliers = (Array.isArray(rows) ? rows : []).map((r: any) => ({
        id: String(r.id ?? ""),
        name: String(r.name ?? ""),
        rating: Number(r.rating ?? 0),
        deliveryScore: Number(r.delivery_score ?? 0),
        qualityScore: Number(r.quality_score ?? 0),
        activeOrders: Number(r.active_orders ?? 0),
        trend: (r.trend ?? "stable") as "up" | "down" | "stable",
        status: (r.status ?? "pending") as "active" | "pending" | "issue",
      }));
      return NextResponse.json({ suppliers });
    }
    throw new Error("missing_env");
  } catch {
    return NextResponse.json({ suppliers: [] });
  }
}

export const dynamic = "force-dynamic";
