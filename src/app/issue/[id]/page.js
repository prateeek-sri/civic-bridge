"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Check, CheckCircle2 } from "lucide-react";
import SlaTimer from "@/components/SlaTimer";

const IssueLocationMap = dynamic(
  () => import("@/components/IssueLocationMap"),
  { ssr: false }
);

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

export default function IssueDetailPage() {
  const params = useParams();
  const [issue, setIssue] = useState(null);
  const [user, setUser] = useState(null);
  const [upvoting, setUpvoting] = useState(false);
  const [satisfiedLoading, setSatisfiedLoading] = useState(false);

  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((data) => setUser(data.user));
  }, []);

  useEffect(() => {
    if (!params.id) return;
    fetch(`/api/issues/${params.id}`)
      .then((r) => r.json())
      .then((data) => setIssue(data))
      .catch(() => setIssue(null));
  }, [params.id]);

  const hasUpvoted = user && issue && (issue.upvotes || []).includes(user.userId);
  const upvoteCount = issue ? (issue.upvoteCount ?? (issue.upvotes || []).length) : 0;
  const isResolvedOrVerified =
    issue?.status === "Resolved" || issue?.status === "Verified";
  const hasMarkedSatisfied =
    user && issue && (issue.satisfiedBy || []).includes(user.userId);

  async function handleSatisfiedToggle() {
    if (!user || !issue || satisfiedLoading || !isResolvedOrVerified) return;
    setSatisfiedLoading(true);
    try {
      const res = await fetch(`/api/issues/${params.id}/satisfied`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        setIssue((prev) => ({
          ...prev,
          satisfiedBy: data.satisfiedBy || [],
        }));
      }
    } finally {
      setSatisfiedLoading(false);
    }
  }

  async function handleUpvote() {
    if (!user || hasUpvoted || upvoting) return;
    setUpvoting(true);
    try {
      const res = await fetch(`/api/issues/${params.id}/upvote`, { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setIssue((prev) => ({
          ...prev,
          upvoteCount: data.upvoteCount,
          upvotes: [...(prev.upvotes || []), user.userId],
        }));
      }
    } finally {
      setUpvoting(false);
    }
  }

  if (!issue) {
    return (
      <div className="text-muted-foreground">
        Loading… or issue not found. <Link href="/dashboard" className="text-primary underline">Back to dashboard</Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <Link href="/dashboard" className="text-primary hover:underline text-sm mb-4 inline-block">
        ← Back to dashboard
      </Link>

      <div className="bg-card rounded-lg shadow border border-border overflow-hidden">
        <div className="p-6 border-b border-border">
          <h1 className="text-2xl font-bold text-foreground">{issue.title}</h1>
          <div className="flex flex-wrap gap-2 mt-2">
            <span className={`text-sm px-2 py-1 rounded ${SEVERITY_COLORS[issue.severity] || ""}`}>
              {issue.severity}
            </span>
            <span className={`text-sm px-2 py-1 rounded ${STATUS_COLORS[issue.status] || ""}`}>
              {issue.status}
            </span>
            <span className="text-sm px-2 py-1 rounded bg-muted text-muted-foreground">
              {issue.category}
            </span>
          </div>
          <p className="mt-3 text-muted-foreground whitespace-pre-wrap">{issue.description}</p>
          {issue.image && (
            <div className="mt-4">
              <img
                src={issue.image}
                alt="Issue"
                className="max-w-full max-h-64 rounded border border-border"
              />
            </div>
          )}
          {issue.location?.lat != null && issue.location?.lng != null && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-foreground mb-2">Reported location</h4>
              <IssueLocationMap lat={issue.location.lat} lng={issue.location.lng} />
            </div>
          )}
          <div className="mt-4 flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <button
                onClick={handleUpvote}
                disabled={!user || hasUpvoted || upvoting}
                className={`px-3 py-1.5 rounded font-medium text-sm transition ${
                  hasUpvoted
                    ? "bg-muted text-muted-foreground cursor-default"
                    : "bg-primary/10 text-primary hover:bg-primary/20"
                }`}
              >
                👍 Upvote {upvoteCount}
              </button>
              {!user && (
                <span className="text-xs text-muted-foreground">Log in to upvote</span>
              )}
            </div>
            <SlaTimer
              createdAt={issue.createdAt}
              resolvedAt={issue.resolvedAt}
              className="text-sm"
            />
            <span className="text-sm text-muted-foreground">
              Reported by {issue.createdBy?.name || "—"} on{" "}
              {new Date(issue.createdAt).toLocaleString()}
            </span>
          </div>
        </div>

        {issue.resolutionImage && (
          <div className="p-6 border-t border-border bg-muted/30">
            <h3 className="font-semibold text-foreground mb-2">Resolution image</h3>
            <img
              src={issue.resolutionImage}
              alt="Resolution"
              className="max-w-full max-h-64 rounded border border-border"
            />
          </div>
        )}

        <div className="p-6 border-t border-border">
          <h3 className="font-semibold text-foreground mb-3">Status timeline</h3>
          <div className="relative pl-6 border-l-2 border-border space-y-4">
            {(issue.statusHistory || []).map((entry, i) => (
              <div key={i} className="relative -left-6">
                <div className="absolute left-0 w-3 h-3 rounded-full bg-primary -translate-x-[7px] mt-1.5" />
                <div className="pl-4">
                  <span className={`text-sm px-2 py-0.5 rounded ${STATUS_COLORS[entry.status] || ""}`}>
                    {entry.status}
                  </span>
                  <p className="text-sm text-muted-foreground mt-1">
                    {entry.updatedBy?.name || "—"} · {new Date(entry.timestamp).toLocaleString()}
                  </p>
                  {entry.note && (
                    <p className="text-sm text-muted-foreground/80 mt-0.5 italic">{entry.note}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {isResolvedOrVerified && (
            <div className="mt-6 pt-4 border-t border-border">
              <label className="flex items-center gap-3 cursor-pointer group">
                <span
                  role="checkbox"
                  tabIndex={0}
                  aria-checked={hasMarkedSatisfied}
                  onClick={(e) => {
                    e.preventDefault();
                    handleSatisfiedToggle();
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleSatisfiedToggle();
                    }
                  }}
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors ${
                    hasMarkedSatisfied
                      ? "bg-primary border-primary text-primary-foreground"
                      : "border-input bg-background group-hover:border-primary/50"
                  } ${satisfiedLoading ? "opacity-60 pointer-events-none" : ""}`}
                >
                  {hasMarkedSatisfied && <Check className="h-3 w-3" strokeWidth={3} />}
                </span>
                <span className="text-sm font-medium text-foreground">
                  {hasMarkedSatisfied ? "I'm satisfied with the resolution" : "Mark as satisfied with the resolution"}
                </span>
                {hasMarkedSatisfied && (
                  <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 shrink-0" />
                )}
              </label>
              {!user && (
                <p className="mt-2 text-xs text-muted-foreground">
                  Log in to mark that you're satisfied with the resolution.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
