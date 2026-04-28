import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const BACKEND = process.env.BACKEND_URL ?? process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:3001";
const API_KEY = process.env.ADMIN_API_KEY ?? "change-me-in-production";

// GET /api/blog-proxy?page=1&per_page=20
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.toString();
    const res = await fetch(`${BACKEND}/api/blog/posts?${query}`, { cache: "no-store" });
    
    if (!res.ok) {
      return NextResponse.json({ error: "Backend error" }, { status: res.status });
    }
    
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("PROXY_ERROR: GET /api/blog-proxy", error);
    return NextResponse.json({ error: "Connection to backend failed" }, { status: 502 });
  }
}

// POST /api/blog-proxy (create)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const res = await fetch(`${BACKEND}/api/blog/posts`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": API_KEY },
      body: JSON.stringify(body),
    });
    
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("PROXY_ERROR: POST /api/blog-proxy", error);
    return NextResponse.json({ error: "Connection to backend failed" }, { status: 502 });
  }
}
