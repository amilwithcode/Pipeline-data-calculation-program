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
    const totals = { total: 0, passed: 0, failed: 0 };
    return NextResponse.json({ tests: [], totals });
  }
}

export const dynamic = "force-dynamic";
