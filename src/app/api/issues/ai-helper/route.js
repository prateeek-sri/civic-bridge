import { NextResponse } from "next/server";
import { getAISuggestions, checkDuplicateIssue } from "@/lib/ai";
import { getSessionFromCookie } from "@/lib/auth";

export async function POST(request) {
  try {
    const session = await getSessionFromCookie();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { action, title, description, lat, lng } = body;

    if (action === "suggestions") {
      if (!title || !description) {
        return NextResponse.json({ error: "Title and description are required" }, { status: 400 });
      }
      const suggestions = await getAISuggestions(title, description);
      return NextResponse.json(suggestions);
    }

    if (action === "duplicate") {
      if (!title || !description || lat == null || lng == null) {
        return NextResponse.json({ error: "Title, description, lat, and lng are required" }, { status: 400 });
      }
      const result = await checkDuplicateIssue(title, description, Number(lat), Number(lng));
      return NextResponse.json(result);
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err) {
    console.error("AI helper API error:", err);
    return NextResponse.json({ error: "AI processing failed" }, { status: 500 });
  }
}
