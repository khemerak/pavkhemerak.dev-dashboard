import { NextResponse } from "next/server";
import { createSession, COOKIE_NAME } from "@/lib/auth";

export async function POST(request: Request) {
  const { password } = await request.json();
  const expected = process.env.DASHBOARD_PASSWORD ?? "admin";

  if (password !== expected) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const token = await createSession();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24, // 24h
    path: "/",
  });
  return res;
}
