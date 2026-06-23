"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { getSlaInfo } from "@/lib/sla";
import { ThumbsUp, MapPin, Flame, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function IssueCard({ issue, maxUpvotes = 0 }) {
  const [upvoteCount, setUpvoteCount] = useState(issue.upvoteCount || 0);
  const [isUpvoting, setIsUpvoting] = useState(false);
  const [hasUpvoted, setHasUpvoted] = useState(false);
  const isTrending = 
    maxUpvotes > 0 && 
    upvoteCount === maxUpvotes && 
    upvoteCount > 0;
    
  const creatorName = issue.createdBy?.name || issue.creator?.name || "Anonymous";

  // Badges flat styling matching mockup but dark mode compatible
  const categoryBadge = "bg-[#2563EB] text-white text-[11px] font-medium px-2.5 py-0.5 rounded";
  
  const severityBadge = issue.severity === "High"
    ? "bg-[#DC2626] text-white text-[11px] font-medium px-2.5 py-0.5 rounded"
    : issue.severity === "Medium"
      ? "bg-[#D97706] text-white text-[11px] font-medium px-2.5 py-0.5 rounded"
      : "bg-[#16A34A] text-white text-[11px] font-medium px-2.5 py-0.5 rounded";

  const statusBadge = "bg-[#334155] text-slate-200 text-[11px] font-medium px-2.5 py-0.5 rounded";

  const handleUpvote = async (e) => {
    e.preventDefault(); // prevent navigation if wrapped in link
    if (isUpvoting || hasUpvoted) return;
    setIsUpvoting(true);
    try {
      const res = await fetch(`/api/issues/${issue._id}/upvote`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setUpvoteCount(data.upvoteCount);
        setHasUpvoted(true);
      }
    } catch (error) {
      console.error("Failed to upvote", error);
    } finally {
      setIsUpvoting(false);
    }
  };

  return (
    <div className="group flex flex-col bg-[#13131A] rounded-xl border border-white/5 overflow-hidden shadow-lg hover:border-white/20 hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300">
      {/* Top: Image */}
      <div className="relative w-full h-40 bg-slate-900 overflow-hidden shrink-0">
        {issue.image ? (
          <Image
            src={issue.image}
            alt={issue.title}
            fill
            priority={true}
            className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-slate-600">
            <MapPin className="h-8 w-8 opacity-30" />
            <span className="text-xs ml-2 text-slate-600">Map data ©2021 Google</span>
          </div>
        )}
        
        {isTrending && (
          <div className="absolute top-2 left-2 z-10">
            <span className="flex items-center gap-1 bg-red-500 text-white text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-md tracking-wider shadow">
              <Flame className="h-3.5 w-3.5" />
              Hot
            </span>
          </div>
        )}
      </div>

      {/* Middle: Content */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="line-clamp-1 text-base font-bold text-white mb-1 leading-tight">
          {issue.title}
        </h3>
        
        <p className="line-clamp-2 text-xs text-slate-400 mb-3 leading-relaxed">
          {issue.description || "Significant road damage and large potholes reported near the main intersection."}
        </p>

        <div className="flex flex-wrap items-center gap-1.5 mb-3">
          <span className={categoryBadge}>{issue.category || "Roads & Streets"}</span>
          <span className={severityBadge}>{issue.severity || "High"}</span>
          <span className={statusBadge}>{issue.status || "Submitted"}</span>
        </div>

        {/* Location pin */}
        <div className="flex items-center gap-1 text-xs text-slate-500 mb-2 truncate">
          <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-500" />
          <span>{[issue.location?.city || "Jaunpur", issue.location?.state || "Uttar Pradesh"].filter(Boolean).join(", ")}</span>
        </div>

        {/* Reporter Meta */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 mb-4">
          <span className="truncate">
            Reported by <span className="font-semibold text-slate-300">{creatorName}</span>
          </span>
          <span className="shrink-0 text-slate-500">
            {new Date(issue.createdAt || Date.now()).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </span>
        </div>

        {/* Bottom: Buttons */}
        <div className="grid grid-cols-2 gap-3 mt-auto">
          <Button asChild className="w-full bg-[#2563EB] hover:bg-blue-600 active:scale-95 text-white rounded-lg font-medium text-sm h-9 transition-all">
            <Link href={`/issue/${issue._id || ''}`}>
              View Details
            </Link>
          </Button>
          <Button 
            variant="outline" 
            onClick={handleUpvote}
            disabled={isUpvoting || hasUpvoted}
            className="w-full bg-transparent border-[#2563EB] text-[#3B82F6] hover:bg-blue-900/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-medium text-sm h-9 flex items-center justify-center gap-1 transition-all"
          >
            {isUpvoting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ThumbsUp className="w-4 h-4" />}
            {hasUpvoted ? "Upvoted" : "Upvote"} ({upvoteCount})
          </Button>
        </div>
      </div>
    </div>
  );
}