import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Issue from "@/models/Issue";
import { getSessionFromCookie } from "@/lib/auth";
import { uploadImage } from "@/lib/upload";

const VALID_STATUSES = ["Submitted", "Acknowledged", "Assigned", "In Progress", "Resolved", "Verified"];

export async function GET(request, { params }) {
  try {
    const id = params.id;
    await connectDB();

    const issue = await Issue.findById(id)
      .populate("createdBy", "name email")
      .populate("assignedTo", "name email")
      .populate("statusHistory.updatedBy", "name")
      .lean();

    if (!issue) {
      return NextResponse.json({ error: "Issue not found" }, { status: 404 });
    }

    const upvoteIds = (issue.upvotes || []).map((id) => id.toString());
    const satisfiedIds = (issue.satisfiedBy || []).map((id) => id.toString());
    const serialized = {
      ...issue,
      _id: issue._id.toString(),
      createdBy: issue.createdBy
        ? {
            _id: issue.createdBy._id.toString(),
            name: issue.createdBy.name,
            email: issue.createdBy.email,
          }
        : null,
      assignedTo: issue.assignedTo
        ? {
            _id: issue.assignedTo._id.toString(),
            name: issue.assignedTo.name,
            email: issue.assignedTo.email,
          }
        : null,
      upvoteCount: upvoteIds.length,
      upvotes: upvoteIds,
      satisfiedBy: satisfiedIds,
      statusHistory: (issue.statusHistory || []).map((h) => ({
        ...h,
        updatedBy: h.updatedBy
          ? { _id: h.updatedBy._id.toString(), name: h.updatedBy.name }
          : null,
      })),
    };

    return NextResponse.json(serialized);
  } catch (err) {
    console.error("Issue get error:", err);
    return NextResponse.json(
      { error: "Failed to fetch issue" },
      { status: 500 }
    );
  }
}

export async function PATCH(request, { params }) {
  try {
    const session = await getSessionFromCookie();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.role !== "official") {
      return NextResponse.json(
        { error: "Only officials can update issue status" },
        { status: 403 }
      );
    }

    const id = params.id;
    const body = await request.json();
    const { status, note, resolutionImage, assignedTo, department } = body;

    if (status && !VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: "Valid status is required" },
        { status: 400 }
      );
    }

    await connectDB();

    const issue = await Issue.findById(id);
    if (!issue) {
      return NextResponse.json({ error: "Issue not found" }, { status: 404 });
    }

    const oldStatus = issue.status;
    let statusChanged = false;
    if (status && status !== issue.status) {
      issue.status = status;
      issue.statusHistory.push({
        status,
        updatedBy: session.userId,
        note: (note || "").trim(),
        timestamp: new Date(),
      });
      if (status === "Resolved" && !issue.resolvedAt) {
        issue.resolvedAt = new Date();
      }
      statusChanged = true;
    }

    if (resolutionImage) {
      const uploadedUrl = await uploadImage(resolutionImage);
      issue.resolutionImage = uploadedUrl;
    }

    let assignmentChanged = false;
    if (assignedTo !== undefined) {
      issue.assignedTo = assignedTo || null;
      assignmentChanged = true;
    }
    if (department !== undefined) {
      issue.department = department || null;
      assignmentChanged = true;
    }

    await issue.save();

    // Trigger emails asynchronously
    try {
      const User = (await import("@/models/User")).default;
      const creator = await User.findById(issue.createdBy).select("name email");
      if (creator && creator.email) {
        if (statusChanged) {
          const { sendStatusChangeEmail } = await import("@/lib/email");
          sendStatusChangeEmail(creator.email, creator.name, issue.title, oldStatus, issue.status).catch(err => {
            console.error("Async email status error:", err);
          });
        }
        if (assignmentChanged && issue.assignedTo) {
          const assignee = await User.findById(issue.assignedTo).select("name");
          const assigneeName = assignee ? assignee.name : "Assigned Official";
          const { sendAssigneeEmail } = await import("@/lib/email");
          sendAssigneeEmail(creator.email, creator.name, issue.title, assigneeName, issue.department).catch(err => {
            console.error("Async assignment email error:", err);
          });
        }
      }
    } catch (emailErr) {
      console.error("Notification trigger failed:", emailErr);
    }

    return NextResponse.json({
      success: true,
      issue: {
        _id: issue._id.toString(),
        status: issue.status,
        resolvedAt: issue.resolvedAt,
        statusHistory: issue.statusHistory,
        assignedTo: issue.assignedTo,
        department: issue.department,
      },
    });
  } catch (err) {
    console.error("Issue update error:", err);
    return NextResponse.json(
      { error: "Failed to update issue" },
      { status: 500 }
    );
  }
}
