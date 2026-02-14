import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Issue from "@/models/Issue";
import { getSessionFromCookie } from "@/lib/auth";
import { reverseGeocode } from "@/lib/geocode";

export async function GET(request) {
  try {
    if (!process.env.MONGODB_URI) {
      return NextResponse.json(
        { error: "Database not configured. Set MONGODB_URI in .env.local" },
        { status: 503 }
      );
    }
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const severity = searchParams.get("severity");
    const status = searchParams.get("status");
    const sort = searchParams.get("sort") || "newest";

    await connectDB();

    const filter = {};
    if (category) filter.category = category;
    if (severity) filter.severity = severity;
    if (status) filter.status = status;

    let sortOption = { createdAt: -1 };
    if (sort === "oldest") sortOption = { createdAt: 1 };
    if (sort === "upvotes") sortOption = { upvotes: -1, createdAt: -1 };

    const issues = await Issue.find(filter)
      .sort(sortOption)
      .populate("createdBy", "name")
      .lean();

    let withCounts = issues.map((i) => ({
      ...i,
      _id: i._id.toString(),
      createdBy: i.createdBy ? { _id: i.createdBy._id.toString(), name: i.createdBy.name } : null,
      upvoteCount: (i.upvotes || []).length,
      upvotes: undefined,
    }));

    // Backfill city/state for issues with lat/lng but no city/state (Nominatim: 1 req/sec)
    const needsBackfill = withCounts.filter(
      (i) =>
        i.location?.lat != null &&
        i.location?.lng != null &&
        !i.location?.city &&
        !i.location?.state
    );
    const MAX_BACKFILL_PER_REQUEST = 5;
    for (let idx = 0; idx < Math.min(needsBackfill.length, MAX_BACKFILL_PER_REQUEST); idx++) {
      const issue = needsBackfill[idx];
      const geo = await reverseGeocode(issue.location.lat, issue.location.lng);
      if (geo.city || geo.state) {
        await Issue.updateOne(
          { _id: issue._id },
          { $set: { "location.city": geo.city, "location.state": geo.state } }
        );
        const match = withCounts.find((w) => w._id === issue._id);
        if (match && match.location) {
          match.location.city = geo.city;
          match.location.state = geo.state;
        }
      }
      if (idx < needsBackfill.length - 1) {
        await new Promise((r) => setTimeout(r, 1100));
      }
    }

    return NextResponse.json(withCounts);
  } catch (err) {
    console.error("Issues list error:", err);
    const message =
      err.message?.includes("MONGODB_URI") || err.message?.includes("connect")
        ? "Database not configured. Set MONGODB_URI in .env.local and restart."
        : "Failed to fetch issues";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const session = await getSessionFromCookie();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.role !== "resident") {
      return NextResponse.json(
        { error: "Only residents can submit issues" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { title, description, category, severity, image, lat, lng } = body;

    if (!title || !description || !category || !severity) {
      return NextResponse.json(
        { error: "Title, description, category and severity are required" },
        { status: 400 }
      );
    }

    const validSeverity = ["Low", "Medium", "High"].includes(severity);
    if (!validSeverity) {
      return NextResponse.json({ error: "Invalid severity" }, { status: 400 });
    }

    await connectDB();
    const IssueModel = (await import("@/models/Issue")).default;

    let city = null;
    let state = null;
    if (lat != null && lng != null) {
      const geo = await reverseGeocode(Number(lat), Number(lng));
      city = geo.city;
      state = geo.state;
    }

    const issue = await IssueModel.create({
      title: title.trim(),
      description: description.trim(),
      category: (category || "Other").trim(),
      severity,
      image: image || null,
      location: {
        lat: lat != null ? Number(lat) : null,
        lng: lng != null ? Number(lng) : null,
        city,
        state,
      },
      status: "Submitted",
      upvotes: [],
      createdBy: session.userId,
      statusHistory: [
        {
          status: "Submitted",
          updatedBy: session.userId,
          note: "Issue submitted",
          timestamp: new Date(),
        },
      ],
    });

    return NextResponse.json({
      success: true,
      issue: {
        _id: issue._id.toString(),
        title: issue.title,
        status: issue.status,
        createdAt: issue.createdAt,
      },
    });
  } catch (err) {
    console.error("Issue create error:", err);
    return NextResponse.json(
      { error: "Failed to create issue" },
      { status: 500 }
    );
  }
}
