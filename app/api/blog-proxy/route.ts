import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const BACKEND = process.env.BACKEND_URL ?? "http://localhost:3001";
const API_KEY = process.env.ADMIN_API_KEY ?? "change-me-in-production";

// GET /api/blog-proxy?page=1&per_page=20
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.toString();
  const res = await fetch(`${BACKEND}/api/blog/posts?${query}`, { cache: "no-store" });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

// POST /api/blog-proxy (create)
export async function POST(request: NextRequest) {
  const body = await request.json();
  const res = await fetch(`${BACKEND}/api/blog/posts`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": API_KEY },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
