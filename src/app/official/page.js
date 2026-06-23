"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import SlaTimer from "@/components/SlaTimer";

const SEVERITY_COLORS = {
  Low: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  Medium: "bg-yellow-100 text-yellow-800 dark:bg-amber-900/30 dark:text-amber-400",
  High: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

const STATUS_COLORS = {
  Submitted: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300",
  Acknowledged: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  Assigned: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400",
  "In Progress": "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  Resolved: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  Verified: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
};

const STATUS_OPTIONS = ["Submitted", "Acknowledged", "Assigned", "In Progress", "Resolved", "Verified"];

function MonthlyTrendsChart({ trends }) {
  if (!trends || trends.length === 0) return (
    <div className="h-48 flex items-center justify-center text-xs text-muted-foreground">
      No historical trend data available.
    </div>
  );
  const maxVal = Math.max(...trends.map(t => Math.max(t.reported, t.resolved, 1)), 5);
  return (
    <div className="space-y-4">
      <div className="flex gap-4 text-[10px] font-semibold tracking-wide uppercase text-muted-foreground">
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-blue-500 rounded-sm" /> Reported</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-emerald-500 rounded-sm" /> Resolved</span>
      </div>
      <div className="h-48 flex items-end gap-3 border-b border-l border-border pl-2 pb-2">
        {trends.map((item, idx) => {
          const reportedHeight = (item.reported / maxVal) * 100;
          const resolvedHeight = (item.resolved / maxVal) * 100;
          return (
            <div key={idx} className="flex-1 flex flex-col items-center gap-1 h-full justify-end group">
              <div className="w-full flex gap-1 items-end h-[85%] px-1">
                <div 
                  className="flex-1 bg-blue-500 hover:bg-blue-600 rounded-t transition-all duration-300"
                  style={{ height: `${reportedHeight}%` }}
                  title={`Reported: ${item.reported}`}
                />
                <div 
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 rounded-t transition-all duration-300"
                  style={{ height: `${resolvedHeight}%` }}
                  title={`Resolved: ${item.resolved}`}
                />
              </div>
              <span className="text-[9px] text-muted-foreground text-center truncate w-full" title={item.name}>{item.name}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function OfficialDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [issues, setIssues] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [note, setNote] = useState("");
  const [resolutionImage, setResolutionImage] = useState("");
  const [loading, setLoading] = useState(true);
  const [officials, setOfficials] = useState([]);
  const [assignedTo, setAssignedTo] = useState("");
  const [department, setDepartment] = useState("");

  useEffect(() => {
    if (!user || user.role !== "official") return;
    fetch("/api/officials")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setOfficials(data);
      })
      .catch(() => {});
  }, [user]);

  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((data) => {
        setUser(data.user);
        if (data.user && data.user.role !== "official") {
          router.push("/dashboard");
        }
      });
  }, [router]);

  const loadIssues = useCallback(() => {
    const params = statusFilter ? `?status=${encodeURIComponent(statusFilter)}` : "";
    return fetch(`/api/issues${params}`)
      .then((r) => r.json())
      .then(setIssues)
      .catch(() => setIssues([]));
  }, [statusFilter]);

  const loadAnalytics = useCallback(() => {
    return fetch("/api/analytics")
      .then((r) => r.json())
      .then(setAnalytics)
      .catch(() => setAnalytics(null));
  }, []);

  useEffect(() => {
    if (!user || user.role !== "official") return;
    setLoading(true);
    Promise.all([loadIssues(), loadAnalytics()]).finally(() => setLoading(false));
  }, [user, statusFilter, loadIssues, loadAnalytics]);

  function handleResolutionFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setResolutionImage(reader.result);
    reader.readAsDataURL(file);
  }

  async function handleUpdateStatus(issueId) {
    if (!newStatus && !assignedTo && !department) return;
    const res = await fetch(`/api/issues/${issueId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: newStatus || undefined,
        note: note.trim() || undefined,
        resolutionImage: resolutionImage || undefined,
        assignedTo: assignedTo || null,
        department: department.trim() || null,
      }),
    });
    if (res.ok) {
      setEditingId(null);
      setNewStatus("");
      setNote("");
      setResolutionImage("");
      setAssignedTo("");
      setDepartment("");
      loadIssues();
      loadAnalytics();
    }
  }

  if (user === null || (user && user.role !== "official")) {
    return (
      <p className="text-muted-foreground">
        Loading… or <Link href="/login" className="text-primary underline">log in</Link> as an official.
      </p>
    );
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto text-center">
        <p className="text-muted-foreground mb-4">Officials only. Please log in.</p>
        <Link href="/login" className="text-primary hover:underline">Log in</Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">Official Dashboard</h1>

      {analytics && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-card rounded-lg shadow border border-border p-4">
            <p className="text-xs font-medium text-muted-foreground uppercase">Total issues</p>
            <p className="text-2xl font-bold text-foreground">{analytics.totalIssues}</p>
          </div>
          <div className="bg-card rounded-lg shadow border border-border p-4">
            <p className="text-xs font-medium text-muted-foreground uppercase">Open</p>
            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{analytics.openIssues}</p>
          </div>
          <div className="bg-card rounded-lg shadow border border-border p-4">
            <p className="text-xs font-medium text-muted-foreground uppercase">Resolved</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{analytics.resolvedIssues}</p>
          </div>
          <div className="bg-card rounded-lg shadow border border-border p-4">
            <p className="text-xs font-medium text-muted-foreground uppercase">Avg resolution</p>
            <p className="text-lg font-bold text-foreground">
              {analytics.avgResolutionTimeMs
                ? `${Math.round(analytics.avgResolutionTimeMs / (1000 * 60 * 60))}h`
                : "—"}
            </p>
          </div>
          <div className="bg-card rounded-lg shadow border border-border p-4">
            <p className="text-xs font-medium text-muted-foreground uppercase">Top category</p>
            <p className="text-sm font-bold text-foreground truncate" title={analytics.mostCommonCategory}>
              {analytics.mostCommonCategory}
            </p>
          </div>
          <div className="bg-card rounded-lg shadow border border-border p-4">
            <p className="text-xs font-medium text-muted-foreground uppercase">Trending</p>
            {analytics.trendingIssue ? (
              <Link
                href={`/issue/${analytics.trendingIssue._id}`}
                className="text-sm font-medium text-primary hover:underline truncate block"
                title={analytics.trendingIssue.title}
              >
                🔥 {analytics.trendingIssue.title}
              </Link>
            ) : (
              <p className="text-sm text-muted-foreground">—</p>
            )}
          </div>
        </div>
      )}

      {analytics && (
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
            <h3 className="text-sm font-bold text-foreground mb-4">Monthly Activity Trends</h3>
            <MonthlyTrendsChart trends={analytics.monthlyTrends} />
          </div>
          <div className="bg-card rounded-xl border border-border p-6 shadow-sm flex flex-col">
            <h3 className="text-sm font-bold text-foreground mb-4">Issue Breakdown by Category</h3>
            <div className="space-y-4 max-h-[192px] overflow-y-auto pr-1 flex-1">
              {analytics.categoryData && analytics.categoryData.length > 0 ? (
                (() => {
                  const maxCount = Math.max(...analytics.categoryData.map(d => d.count), 1);
                  return analytics.categoryData.map((item, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs font-medium text-foreground">
                        <span>{item.name}</span>
                        <span className="text-muted-foreground">{item.count}</span>
                      </div>
                      <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500 rounded-full transition-all duration-500" 
                          style={{ width: `${(item.count / maxCount) * 100}%` }} 
                        />
                      </div>
                    </div>
                  ));
                })()
              ) : (
                <div className="h-48 flex items-center justify-center text-xs text-muted-foreground">
                  No category data available.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="mb-4 flex items-center gap-4">
        <label className="text-sm font-medium text-foreground">Filter by status</label>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-input bg-background rounded-lg px-3 py-2 text-sm"
        >
          <option value="">All</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : issues.length === 0 ? (
        <p className="text-muted-foreground">No issues.</p>
      ) : (
        <div className="space-y-4">
          {issues.map((issue) => (
            <div
              key={issue._id}
              className="bg-card rounded-lg shadow border border-border overflow-hidden"
            >
              <div className="p-4 flex flex-wrap items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/issue/${issue._id}`}
                    className="font-semibold text-foreground hover:text-primary"
                  >
                    {issue.title}
                  </Link>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    <span className={`text-xs px-2 py-0.5 rounded ${SEVERITY_COLORS[issue.severity] || ""}`}>
                      {issue.severity}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded ${STATUS_COLORS[issue.status] || ""}`}>
                      {issue.status}
                    </span>
                    <span className="text-xs text-muted-foreground">👍 {issue.upvoteCount || 0}</span>
                    {issue.department && (
                      <span className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded">
                        🏢 {issue.department}
                      </span>
                    )}
                    {issue.assignedTo && (
                      <span className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded">
                        👤 Assigned: {issue.assignedTo.name || issue.assignedTo}
                      </span>
                    )}
                  </div>
                  <SlaTimer createdAt={issue.createdAt} resolvedAt={issue.resolvedAt} className="text-sm mt-1" />
                </div>
                <div>
                  {editingId === issue._id ? (
                    <div className="flex flex-col gap-2 w-64">
                      <select
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value)}
                        className="border border-input bg-background rounded px-2 py-1.5 text-sm"
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                      <select
                        value={assignedTo}
                        onChange={(e) => setAssignedTo(e.target.value)}
                        className="border border-input bg-background rounded px-2 py-1.5 text-sm"
                      >
                        <option value="">Unassigned</option>
                        {officials.map((o) => (
                          <option key={o._id} value={o._id}>{o.name}</option>
                        ))}
                      </select>
                      <input
                        type="text"
                        placeholder="Department (e.g. Roads)"
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        className="border border-input bg-background rounded px-2 py-1.5 text-sm"
                      />
                      <input
                        type="text"
                        placeholder="Note (optional)"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        className="border border-input bg-background rounded px-2 py-1.5 text-sm"
                      />
                      <label className="text-xs text-muted-foreground">
                        Resolution image (optional)
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleResolutionFile}
                          className="block mt-1 text-sm"
                        />
                      </label>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleUpdateStatus(issue._id)}
                          className="bg-primary text-primary-foreground px-3 py-1.5 rounded text-sm font-medium hover:bg-primary/90"
                        >
                          Update
                        </button>
                        <button
                          onClick={() => {
                            setEditingId(null);
                            setNewStatus("");
                            setNote("");
                            setResolutionImage("");
                          }}
                          className="bg-muted text-muted-foreground px-3 py-1.5 rounded text-sm font-medium hover:bg-muted/80"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setEditingId(issue._id);
                        setNewStatus(issue.status);
                        setNote("");
                        setResolutionImage("");
                        setAssignedTo(issue.assignedTo?._id || issue.assignedTo || "");
                        setDepartment(issue.department || "");
                      }}
                      className="bg-primary text-primary-foreground px-3 py-1.5 rounded text-sm font-medium hover:bg-primary/90"
                    >
                      Update status
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
