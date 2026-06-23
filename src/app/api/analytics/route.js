import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Issue from "@/models/Issue";
import { getSessionFromCookie } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSessionFromCookie();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.role !== "official") {
      return NextResponse.json(
        { error: "Only officials can view analytics" },
        { status: 403 }
      );
    }

    await connectDB();

    const total = await Issue.countDocuments();

    const openStatuses = ["Submitted", "Acknowledged", "Assigned", "In Progress"];
    const openCount = await Issue.countDocuments({ status: { $in: openStatuses } });
    const resolvedCount = await Issue.countDocuments({ status: "Resolved" });
    const verifiedCount = await Issue.countDocuments({ status: "Verified" });
    const resolvedOrVerified = resolvedCount + verifiedCount;

    const resolvedIssues = await Issue.find({
      resolvedAt: { $ne: null },
    })
      .select("createdAt resolvedAt")
      .lean();

    let avgResolutionTimeMs = 0;
    if (resolvedIssues.length > 0) {
      const totalMs = resolvedIssues.reduce(
        (acc, i) => acc + (new Date(i.resolvedAt) - new Date(i.createdAt)),
        0
      );
      avgResolutionTimeMs = totalMs / resolvedIssues.length;
    }

    const categoryCounts = await Issue.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);
    const mostCommonCategory =
      categoryCounts.length > 0 ? categoryCounts[0]._id : "N/A";

    // 6 Months Trends Aggregation
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const monthlyTrends = await Issue.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          reported: { $sum: 1 },
          resolved: {
            $sum: {
              $cond: [{ $in: ["$status", ["Resolved", "Verified"]] }, 1, 0]
            }
          }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const formattedTrends = monthlyTrends.map(t => ({
      name: `${monthNames[t._id.month - 1]} ${t._id.year}`,
      reported: t.reported,
      resolved: t.resolved,
    }));

    const trending = await Issue.find({ status: { $in: openStatuses } })
      .sort({ upvotes: -1 })
      .limit(1)
      .populate("createdBy", "name")
      .lean();

    const trendingIssue =
      trending.length > 0
        ? {
            _id: trending[0]._id.toString(),
            title: trending[0].title,
            upvoteCount: (trending[0].upvotes || []).length,
            createdBy: trending[0].createdBy?.name,
          }
        : null;

    return NextResponse.json({
      totalIssues: total,
      openIssues: openCount,
      resolvedIssues: resolvedOrVerified,
      avgResolutionTimeMs: Math.round(avgResolutionTimeMs),
      mostCommonCategory,
      trendingIssue,
      categoryData: categoryCounts.map(c => ({ name: c._id, count: c.count })),
      monthlyTrends: formattedTrends,
    });
  } catch (err) {
    console.error("Analytics error:", err);
    return NextResponse.json(
      { error: "Failed to load analytics" },
      { status: 500 }
    );
  }
}
