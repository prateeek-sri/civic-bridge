import { NextResponse } from "next/server";
import { getSessionFromCookie } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getSessionFromCookie();
    const res = session
      ? NextResponse.json({
          user: {
            userId: session.userId,
            name: session.name,
            email: session.email,
            role: session.role,
          },
        })
      : NextResponse.json({ user: null });
    res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
    return res;
  } catch (err) {
    console.error("Session error:", err);
    const res = NextResponse.json({ user: null });
    res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
    return res;
  }
}
