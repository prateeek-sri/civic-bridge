"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { CheckCircle2, ArrowLeft, ThumbsUp, Loader2, CalendarClock } from "lucide-react";
import SlaTimer from "@/components/SlaTimer";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Image from "next/image";

const IssueLocationMap = dynamic(
  () => import("@/components/IssueLocationMap"),
  { ssr: false }
);

const SEVERITY_COLORS = {
  Low: "bg-[#16A34A] text-white",
  Medium: "bg-[#D97706] text-white",
  High: "bg-[#DC2626] text-white",
};

const STATUS_COLORS = {
  Submitted: "bg-[#334155] text-slate-200",
  Acknowledged: "bg-[#2563EB] text-white",
  Assigned: "bg-[#4F46E5] text-white",
  "In Progress": "bg-[#D97706] text-white",
  Resolved: "bg-[#16A34A] text-white",
  Verified: "bg-[#059669] text-white",
};

export default function IssueDetailPage() {
  const params = useParams();
  const [issue, setIssue] = useState(null);
  const [user, setUser] = useState(null);
  const [upvoting, setUpvoting] = useState(false);
  const [satisfiedLoading, setSatisfiedLoading] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [loadingComments, setLoadingComments] = useState(true);

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

  useEffect(() => {
    if (!params.id) return;
    fetch(`/api/issues/${params.id}/comments`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setComments(data);
      })
      .catch(() => {})
      .finally(() => setLoadingComments(false));
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

  async function handleAddComment(e) {
    e.preventDefault();
    if (!newComment.trim() || submittingComment || !user) return;
    setSubmittingComment(true);
    try {
      const res = await fetch(`/api/issues/${params.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: newComment }),
      });
      const data = await res.json();
      if (res.ok) {
        setComments((prev) => [...prev, data.comment]);
        setNewComment("");
      }
    } finally {
      setSubmittingComment(false);
    }
  }

  if (!issue) {
    return (
      <div className="h-[40vh] flex items-center justify-center text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  // Define Timeline track steps based on database history entries
  const inProgressEntry = (issue.statusHistory || []).find((h) => 
    h.status === "In Progress" || h.status === "Assigned" || h.status === "Acknowledged"
  );
  const resolvedEntry = (issue.statusHistory || []).find((h) => 
    h.status === "Resolved" || h.status === "Verified"
  );

  const steps = [
    {
      title: "Submitted",
      active: true,
      actor: issue.createdBy?.name || "Citizen",
      date: new Date(issue.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      text: issue.description,
    },
    {
      title: "In Progress",
      active: !!inProgressEntry,
      actor: inProgressEntry?.updatedBy?.name || issue.assignedTo?.name || "Official Dispatched",
      date: inProgressEntry ? new Date(inProgressEntry.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Pending...",
      text: inProgressEntry?.note || "Awaiting assignment from local public works department.",
    },
    {
      title: "Resolved",
      active: !!resolvedEntry,
      actor: resolvedEntry?.updatedBy?.name || "Resolution Team",
      date: resolvedEntry ? new Date(resolvedEntry.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Pending...",
      text: resolvedEntry?.note || "Work details will be posted upon resolution.",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-16 relative z-10 select-none">
      
      {/* 1. Map Banner at the Top */}
      {issue.location?.lat != null && issue.location?.lng != null && (
        <div className="w-full h-[280px] rounded-2xl overflow-hidden border border-white/10 shadow-2xl relative z-0">
          <IssueLocationMap lat={issue.location.lat} lng={issue.location.lng} />
        </div>
      )}

      {/* 2. Back Link */}
      <div>
        <Link href="/dashboard" className="text-blue-500 hover:text-blue-400 text-sm font-semibold flex items-center gap-1 w-fit">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
      </div>

      {/* 3. Header Section (Title, Badges, Upvote, SLA) */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Impact Statement: {issue.title}
          </h1>
          <button
            onClick={handleUpvote}
            disabled={!user || hasUpvoted || upvoting}
            className={`shrink-0 px-4 py-2 rounded-xl text-sm font-bold transition flex items-center gap-1.5 ${
              hasUpvoted
                ? "bg-[#13131A] border border-white/10 text-slate-500 cursor-default"
                : "bg-[#2563EB] hover:bg-blue-600 text-white"
            }`}
          >
            {upvoting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ThumbsUp className="w-4 h-4" />} 
            {hasUpvoted ? "Upvoted" : "Upvote"} {upvoteCount}
          </button>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex flex-wrap gap-2">
            <span className={`text-xs px-2.5 py-0.5 rounded-md font-medium ${SEVERITY_COLORS[issue.severity]}`}>
              {issue.severity} Severity
            </span>
            <span className={`text-xs px-2.5 py-0.5 rounded-md font-medium ${STATUS_COLORS[issue.status]}`}>
              {issue.status}
            </span>
            <span className="text-xs px-2.5 py-0.5 rounded-md bg-[#334155] text-slate-200 font-medium">
              {issue.category}
            </span>
          </div>
          <div className="text-sm font-medium text-slate-400 flex items-center gap-1">
            <SlaTimer createdAt={issue.createdAt} resolvedAt={issue.resolvedAt} className="text-sm font-medium" />
          </div>
        </div>
      </div>

      {/* 4. 2-Column Grid Body */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4">
        
        {/* Left Column: Image Area */}
        <div className="lg:col-span-2">
          <div className="bg-[#13131A] border border-white/5 rounded-2xl overflow-hidden shadow-lg h-full min-h-[400px] flex items-center justify-center">
            {issue.image ? (
              <Image src={issue.image} alt={issue.title} width={1200} height={800} priority={true} className="w-full h-full object-cover" />
            ) : (
              <div className="text-slate-600 flex flex-col items-center gap-2">
                <span className="font-extrabold text-3xl tracking-tight flex items-center gap-2">
                  <span className="bg-gradient-to-r from-blue-500 to-emerald-500 bg-clip-text text-transparent">
                    CivicBridge
                  </span>
                </span>
                <p className="text-sm">No image provided</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Stacked Cards */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          
          {/* Top Card: Activity Timeline */}
          <div className="bg-[#13131A] border border-white/5 rounded-2xl p-6 shadow-lg">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6">Activity Timeline</h3>
            
            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-[1.2rem] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent">
              {steps.map((step, idx) => (
                <div key={idx} className={`relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active ${step.active ? "opacity-100" : "opacity-40"}`}>
                  {/* Icon */}
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 bg-[#13131A] shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow transition-all duration-300 ${
                    step.active ? "border-blue-500 text-blue-500" : "border-slate-700 text-slate-600"
                  }`}>
                    {step.active ? <CheckCircle2 className="w-5 h-5" /> : <CalendarClock className="w-5 h-5" />}
                  </div>
                  
                  {/* Content */}
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] text-left md:group-odd:text-right">
                    <div className="flex flex-col space-y-1">
                      <span className="font-bold text-white text-sm">{step.title}</span>
                      <span className="text-xs text-slate-400 font-medium">{step.actor} &middot; {step.date}</span>
                      <p className="text-xs text-slate-500 pt-1 leading-snug">{step.text}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Satisfaction Toggle */}
            {isResolvedOrVerified && (
              <div className="mt-8 pt-6 border-t border-white/5">
                <button
                  onClick={handleSatisfiedToggle}
                  disabled={!user || satisfiedLoading}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    hasMarkedSatisfied
                      ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
                      : "bg-[#0B0B0F] border border-white/10 text-slate-300 hover:bg-white/5"
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {hasMarkedSatisfied ? "Satisfied with Resolution" : "Mark as Satisfied"}
                </button>
              </div>
            )}
          </div>

          {/* Bottom Card: Discussion & Comments */}
          <div className="bg-[#13131A] border border-white/5 rounded-2xl p-6 shadow-lg flex-1 flex flex-col">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Discussion & Comments</h3>
            
            {user ? (
              <form onSubmit={handleAddComment} className="space-y-3">
                <textarea
                  placeholder="Post a comment or share local updates..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="w-full min-h-[100px] border border-white/10 bg-[#0B0B0F] rounded-xl p-3 text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition resize-none placeholder:text-slate-600"
                  required
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={submittingComment || !newComment.trim()}
                    className="bg-[#2563EB] hover:bg-blue-600 disabled:opacity-50 text-white px-5 py-2 rounded-xl text-xs font-bold tracking-wide transition"
                  >
                    {submittingComment ? "Posting..." : "Post Comment"}
                  </button>
                </div>
              </form>
            ) : (
              <p className="text-xs text-slate-400 border border-white/5 bg-[#0B0B0F] p-4 rounded-xl text-center">
                Please <Link href="/login" className="text-blue-500 hover:underline font-semibold">log in</Link> to participate in the conversation.
              </p>
            )}

            {/* Comments List */}
            <div className="mt-6 flex-1 overflow-y-auto max-h-[300px] pr-2 space-y-4 custom-scrollbar">
              {loadingComments ? (
                <p className="text-xs text-slate-500 text-center py-4">Loading comments...</p>
              ) : comments.length === 0 ? (
                <p className="text-xs text-slate-500 italic text-center py-4">No comments yet. Start the conversation!</p>
              ) : (
                comments.map((comment) => {
                  const initials = comment.user?.name ? comment.user.name.charAt(0).toUpperCase() : "?";
                  return (
                    <div key={comment._id} className="flex gap-3 text-xs items-start border-t border-white/5 pt-4 first:border-0 first:pt-0">
                      <Avatar className="h-8 w-8 border border-white/10">
                        <AvatarFallback className="text-[10px] font-bold bg-[#0B0B0F] text-white">{initials}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white">{comment.user?.name || "Anonymous"}</span>
                          {comment.user?.role === "official" && (
                            <span className="text-[9px] bg-blue-500/10 border border-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded font-extrabold tracking-wider uppercase">
                              Official
                            </span>
                          )}
                          <span className="text-[9px] text-slate-500">
                            {new Date(comment.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-slate-400 mt-1 whitespace-pre-wrap leading-relaxed">
                          {comment.text}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
