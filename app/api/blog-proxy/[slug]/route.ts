import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const BACKEND = process.env.BACKEND_URL ?? "http://localhost:3001";
const API_KEY = process.env.ADMIN_API_KEY ?? "change-me-in-production";

// GET /api/blog-proxy/[slug]
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const res = await fetch(`${BACKEND}/api/blog/posts/${slug}`, { cache: "no-store" });
    
    if (!res.ok) {
      return NextResponse.json({ error: "Post not found" }, { status: res.status });
    }
    
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("PROXY_ERROR: GET /api/blog-proxy/[slug]", error);
    return NextResponse.json({ error: "Connection to backend failed" }, { status: 502 });
  }
}

// PUT /api/blog-proxy/[slug]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await request.json();
    const res = await fetch(`${BACKEND}/api/blog/posts/${slug}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", "x-api-key": API_KEY },
      body: JSON.stringify(body),
    });
    
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("PROXY_ERROR: PUT /api/blog-proxy/[slug]", error);
    return NextResponse.json({ error: "Connection to backend failed" }, { status: 502 });
  }
}

// DELETE /api/blog-proxy/[slug]
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const res = await fetch(`${BACKEND}/api/blog/posts/${slug}`, {
      method: "DELETE",
      headers: { "x-api-key": API_KEY },
    });
    
    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ error: err }, { status: res.status });
    }
    
    return NextResponse.json({ deleted: slug });
  } catch (error) {
    console.error("PROXY_ERROR: DELETE /api/blog-proxy/[slug]", error);
    return NextResponse.json({ error: "Connection to backend failed" }, { status: 502 });
  }
}
