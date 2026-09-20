import { NextResponse } from "next/server";
import { connectToDatabase } from "@/services/database";

const ML_SERVICE_URL = process.env.PERFORMANCE_PREDICTOR_API_URL?.trim();
const HEALTH_CHECK_TIMEOUT_MS = 3000;

function isConfiguredUrl(url: string | undefined): boolean {
  if (!url) return false;
  const trimmed = url.trim();
  return (
    trimmed.length > 0 &&
    !trimmed.includes("YOUR_PYTHON_BACKEND_URL") &&
    !trimmed.includes("YOUR_") &&
    trimmed.startsWith("http")
  );
}

async function checkMlService() {
  if (!isConfiguredUrl(ML_SERVICE_URL)) {
    return {
      ok: true,
      status: "embedded_fallback",
      message: "Using integrated TypeScript ML Predictor Engine (no external Python server needed)."
    };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), HEALTH_CHECK_TIMEOUT_MS);

  try {
    const getMlHealthUrl = () => `${ML_SERVICE_URL!.replace(/\/$/, "")}/health`;
    const response = await fetch(getMlHealthUrl(), {
      method: "GET",
      signal: controller.signal,
      cache: "no-store",
    });

    if (!response.ok) {
      return { ok: true, status: "embedded_fallback", note: `External ML returned status ${response.status}. Using embedded fallback.` };
    }

    const body = await response.json();
    return { ok: true, status: "live", data: body };
  } catch (error) {
    return { ok: true, status: "embedded_fallback", note: "External ML endpoint unreachable. Using embedded fallback." };
  } finally {
    clearTimeout(timeout);
  }
}

async function checkDatabase() {
  try {
    const db = await connectToDatabase();
    const ready = db.connection.readyState === 1;
    return { ok: ready, readyState: db.connection.readyState };
  } catch (error) {
    console.error("❌ Database health check failed:", error);
    return { ok: false, error: String(error) };
  }
}

export async function GET() {
  const [dbResult, mlResult] = await Promise.all([
    checkDatabase(),
    checkMlService(),
  ]);
  const allHealthy = dbResult.ok && mlResult.ok;

  return NextResponse.json(
    {
      status: allHealthy ? "ok" : "degraded",
      database: dbResult,
      mlService: mlResult,
      timestamp: new Date().toISOString()
    },
    { status: 200 }
  );
}
