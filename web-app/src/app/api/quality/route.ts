import { NextResponse } from "next/server";

export async function GET() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;
  try {
    if (url && key) {
      const res = await fetch(`${url}/rest/v1/quality_tests?select=id,name,pass_rate,total_tests,passed,failed`, {
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
          Accept: "application/json",
        },
        cache: "no-store",
      });
      if (!res.ok) throw new Error("supabase_error");
      const rows = await res.json();
      const tests = (Array.isArray(rows) ? rows : []).map((r: any) => ({
        id: String(r.id ?? ""),
        name: String(r.name ?? ""),
        passRate: Number(r.pass_rate ?? 0),
        totalTests: Number(r.total_tests ?? 0),
        passed: Number(r.passed ?? 0),
        failed: Number(r.failed ?? 0),
      }));
      const totals = tests.reduce(
        (a, t) => ({ total: a.total + t.totalTests, passed: a.passed + t.passed, failed: a.failed + t.failed }),
        { total: 0, passed: 0, failed: 0 }
      );
      return NextResponse.json({ tests, totals });
    }
    throw new Error("missing_env");
  } catch {
    const tests = [
      { id: "1", name: "Tensile Strength", passRate: 98.5, totalTests: 420, passed: 414, failed: 6 },
      { id: "2", name: "Hydrostatic Pressure", passRate: 99.2, totalTests: 380, passed: 377, failed: 3 },
      { id: "3", name: "Dimensional Accuracy", passRate: 97.8, totalTests: 450, passed: 440, failed: 10 },
      { id: "4", name: "Surface Finish", passRate: 96.4, totalTests: 390, passed: 376, failed: 14 },
      { id: "5", name: "Chemical Composition", passRate: 99.7, totalTests: 310, passed: 309, failed: 1 },
    ];
    const totals = tests.reduce(
      (a, t) => ({ total: a.total + t.totalTests, passed: a.passed + t.passed, failed: a.failed + t.failed }),
      { total: 0, passed: 0, failed: 0 }
    );
    return NextResponse.json({ tests, totals });
  }
}

export const dynamic = "force-dynamic";
