import { NextResponse } from "next/server";
import { destroySession, getSessionIdFromCookie, COOKIE_NAME } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const sessionId = await getSessionIdFromCookie();
    if (sessionId) {
      await destroySession(sessionId);
    }

    const res = NextResponse.json({ success: true });
    res.cookies.delete(COOKIE_NAME);
    res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
    return res;
  } catch (err) {
    console.error("Logout error:", err);
    const res = NextResponse.json({ success: true });
    res.cookies.delete(COOKIE_NAME);
    return res;
  }
}
