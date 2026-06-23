import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { getSessionFromCookie } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSessionFromCookie();
    if (!session || session.role !== "official") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    await connectDB();
    const officials = await User.find({ role: "official" }).select("name").lean();
    return NextResponse.json(officials);
  } catch (err) {
    console.error("Fetch officials error:", err);
    return NextResponse.json({ error: "Failed to fetch officials" }, { status: 500 });
  }
}
