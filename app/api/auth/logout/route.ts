import { NextResponse } from "next/server";
import { COOKIE_NAME } from "@/lib/auth";

export async function POST() {
  const res = NextResponse.json({ 
    ok: true, 
    message: "Logged out successfully" 
  });
  
  res.cookies.set(COOKIE_NAME, "", {
    maxAge: 0,
    path: "/",
    httpOnly: true,
    secure: true,
    sameSite: "strict",
  });
  
  return res;
}
