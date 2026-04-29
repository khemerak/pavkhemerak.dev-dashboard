import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const BACKEND = process.env.BACKEND_URL ?? process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:3001";
const API_KEY = process.env.ADMIN_API_KEY ?? "change-me-in-production";

export async function GET() {
  try {
    const res = await fetch(`${BACKEND}/api/portfolio/content`, { cache: "no-store" });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("PROXY_ERROR: GET /api/portfolio-proxy", error);
    return NextResponse.json({ error: "Connection to backend failed" }, { status: 502 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const res = await fetch(`${BACKEND}/api/portfolio/content`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", "x-api-key": API_KEY },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("PROXY_ERROR: PUT /api/portfolio-proxy", error);
    return NextResponse.json({ error: "Connection to backend failed" }, { status: 502 });
  }
}
