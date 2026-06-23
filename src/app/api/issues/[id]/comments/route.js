import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Comment from "@/models/Comment";
import User from "@/models/User";
import { getSessionFromCookie } from "@/lib/auth";

export async function GET(request, { params }) {
  try {
    const { id } = params;
    await connectDB();
    const comments = await Comment.find({ issueId: id })
      .populate("userId", "name role")
      .sort({ createdAt: 1 })
      .lean();

    const formatted = comments.map(c => ({
      _id: c._id.toString(),
      text: c.text,
      createdAt: c.createdAt,
      user: c.userId ? {
        _id: c.userId._id.toString(),
        name: c.userId.name,
        role: c.userId.role,
      } : { _id: "deleted", name: "Deleted User", role: "resident" }
    }));

    return NextResponse.json(formatted);
  } catch (err) {
    console.error("Fetch comments error:", err);
    return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  try {
    const session = await getSessionFromCookie();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();
    const { text } = body;

    if (!text || !text.trim()) {
      return NextResponse.json({ error: "Comment text is required" }, { status: 400 });
    }

    await connectDB();
    const comment = await Comment.create({
      issueId: id,
      userId: session.userId,
      text: text.trim(),
    });

    return NextResponse.json({
      success: true,
      comment: {
        _id: comment._id.toString(),
        text: comment.text,
        createdAt: comment.createdAt,
        user: {
          _id: session.userId,
          name: session.name,
          role: session.role,
        }
      }
    });
  } catch (err) {
    console.error("Create comment error:", err);
    return NextResponse.json({ error: "Failed to create comment" }, { status: 500 });
  }
}
