import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Issue from "@/models/Issue";
import { getSessionFromCookie } from "@/lib/auth";

export async function POST(request, { params }) {
  try {
    const session = await getSessionFromCookie();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const id = params.id;
    await connectDB();

    const issue = await Issue.findById(id);
    if (!issue) {
      return NextResponse.json({ error: "Issue not found" }, { status: 404 });
    }

    const isResolvedOrVerified =
      issue.status === "Resolved" || issue.status === "Verified";
    if (!isResolvedOrVerified) {
      return NextResponse.json(
        { error: "Can only mark satisfaction for resolved issues" },
        { status: 400 }
      );
    }

    const satisfiedIds = (issue.satisfiedBy || []).map((oid) => oid.toString());
    const userId = session.userId;

    if (satisfiedIds.includes(userId)) {
      issue.satisfiedBy = (issue.satisfiedBy || []).filter(
        (oid) => oid.toString() !== userId
      );
      await issue.save();
      return NextResponse.json({
        success: true,
        satisfied: false,
        satisfiedBy: issue.satisfiedBy.map((oid) => oid.toString()),
      });
    }

    issue.satisfiedBy = [...(issue.satisfiedBy || []), userId];
    await issue.save();

    return NextResponse.json({
      success: true,
      satisfied: true,
      satisfiedBy: issue.satisfiedBy.map((oid) => oid.toString()),
    });
  } catch (err) {
    console.error("Satisfied toggle error:", err);
    return NextResponse.json(
      { error: "Failed to update satisfaction" },
      { status: 500 }
    );
  }
}
