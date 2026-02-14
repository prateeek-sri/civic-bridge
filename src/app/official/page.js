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
    if (!newStatus) return;
    const res = await fetch(`/api/issues/${issueId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: newStatus,
        note: note.trim() || undefined,
        resolutionImage: resolutionImage || undefined,
      }),
    });
    if (res.ok) {
      setEditingId(null);
      setNewStatus("");
      setNote("");
      setResolutionImage("");
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
