import { NextResponse } from "next/server";

export async function GET() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;
  try {
    if (url && key) {
      const res = await fetch(`${url}/rest/v1/risk_metrics?select=id,name,score,trend,factors`, {
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
          Accept: "application/json",
        },
        cache: "no-store",
      });
      if (!res.ok) throw new Error("supabase_error");
      const rows = await res.json();
      const metrics = (Array.isArray(rows) ? rows : []).map((r: any) => ({
        id: String(r.id ?? ""),
        name: String(r.name ?? ""),
        score: Number(r.score ?? 0),
        trend: String(r.trend ?? "stable") as "improving" | "worsening" | "stable",
        factors: Array.isArray(r.factors)
          ? r.factors
          : typeof r.factors === "string"
          ? String(r.factors).split(",").map((s) => s.trim()).filter(Boolean)
          : [],
      }));
      const overallScore = Math.round(metrics.reduce((a, m) => a + m.score, 0) / (metrics.length || 1));
      return NextResponse.json({ metrics, overallScore });
    }
    throw new Error("missing_env");
  } catch {
    const metrics = [
      { id: "1", name: "Supply Chain Risk", score: 28, trend: "improving", factors: ["Supplier diversity", "Lead time variability"] },
      { id: "2", name: "Quality Risk", score: 15, trend: "stable", factors: ["Defect rate", "Process capability"] },
      { id: "3", name: "Delivery Risk", score: 42, trend: "worsening", factors: ["Transit delays", "Capacity constraints"] },
      { id: "4", name: "Production Risk", score: 22, trend: "improving", factors: ["Equipment reliability", "Workforce availability"] },
    ];
    const overallScore = Math.round(metrics.reduce((a, m) => a + m.score, 0) / metrics.length);
    return NextResponse.json({ metrics, overallScore });
  }
}

export const dynamic = "force-dynamic";
