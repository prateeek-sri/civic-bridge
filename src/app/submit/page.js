"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import { 
  Wrench, 
  Droplet, 
  Lightbulb, 
  Trees, 
  Trash2, 
  ShieldAlert, 
  Volume2, 
  HelpCircle,
  Upload,
  ArrowRight,
  Smile,
  AlertTriangle,
  Flame,
  Loader2
} from "lucide-react";

const LocationPickerMap = dynamic(
  () => import("@/components/LocationPickerMap"),
  { ssr: false }
);

const CATEGORY_MAP = [
  { name: "Roads & Streets", icon: <Wrench className="w-5 h-5" /> },
  { name: "Water & Sewage", icon: <Droplet className="w-5 h-5" /> },
  { name: "Lighting", icon: <Lightbulb className="w-5 h-5" /> },
  { name: "Parks & Recreation", icon: <Trees className="w-5 h-5" /> },
  { name: "Waste Management", icon: <Trash2 className="w-5 h-5" /> },
  { name: "Safety", icon: <ShieldAlert className="w-5 h-5" /> },
  { name: "Noise", icon: <Volume2 className="w-5 h-5" /> },
  { name: "Other", icon: <HelpCircle className="w-5 h-5" /> },
];

export default function SubmitPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [severity, setSeverity] = useState("Medium");
  const [image, setImage] = useState("");
  const [lat, setLat] = useState(null);
  const [lng, setLng] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiReason, setAiReason] = useState("");
  const [duplicateWarning, setDuplicateWarning] = useState(null);
  const [forceSubmit, setForceSubmit] = useState(false);

  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((data) => {
        setUser(data.user);
        if (data.user && data.user.role !== "resident") {
          router.push("/dashboard");
        }
      });
  }, [router]);

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImage(reader.result);
    reader.readAsDataURL(file);
  }

  async function handleAiAnalyze() {
    if (!title.trim() || !description.trim()) {
      alert("Please provide both a Title and Description first.");
      return;
    }
    setAiLoading(true);
    setAiReason("");
    try {
      const res = await fetch("/api/issues/ai-helper", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "suggestions",
          title: title.trim(),
          description: description.trim(),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        if (data.category) setCategory(data.category);
        if (data.severity) setSeverity(data.severity);
        if (data.reason) setAiReason(data.reason);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAiLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!category) {
      setError("Please select a category.");
      return;
    }

    if (lat == null || lng == null) {
      setError("Please select a location on the map.");
      return;
    }

    if (!duplicateWarning && !forceSubmit) {
      setLoading(true);
      try {
        const dupRes = await fetch("/api/issues/ai-helper", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "duplicate",
            title: title.trim(),
            description: description.trim(),
            lat,
            lng,
          }),
        });
        const dupData = await dupRes.json();
        if (dupRes.ok && dupData.isDuplicate) {
          setDuplicateWarning({
            id: dupData.duplicateIssueId,
            reason: dupData.reason,
          });
          setLoading(false);
          return;
        }
      } catch (err) {
        console.error("Duplicate check failed:", err);
      }
    }

    setLoading(true);
    try {
      const res = await fetch("/api/issues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          category,
          severity,
          image: image || null,
          lat: lat != null ? Number(lat) : null,
          lng: lng != null ? Number(lng) : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to submit");
        return;
      }
      router.push(`/issue/${data.issue._id}`);
      router.refresh();
    } catch (err) {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (user === null) {
    return (
      <div className="h-[40vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto text-center py-20">
        <p className="text-slate-400 mb-4">You must be logged in as a resident to report an issue.</p>
        <Link href="/login" className="text-blue-500 hover:underline">Log in</Link>
        {" · "}
        <Link href="/register" className="text-blue-500 hover:underline">Register</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 select-none relative z-10 pb-16">
      {/* HEADER / PROGRESS BAR */}
      <div className="text-center space-y-3 mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-white">CivicBridge</h1>
        <p className="text-sm font-medium text-slate-400">
          {category ? (lat && lng ? "Step 3 of 3: Severity & Details" : "Step 2 of 3: Pinpoint Location") : "Step 1 of 3: Categorize Issue"}
        </p>
        <div className="h-1.5 w-full bg-slate-850 rounded-full max-w-xl mx-auto overflow-hidden">
          <div 
            className="h-full bg-blue-500 rounded-full transition-all duration-500"
            style={{ width: category ? (lat && lng ? "100%" : "66%") : "33%" }}
          />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        {/* PANEL 1: WHAT'S THE ISSUE */}
        <div className="bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-2xl p-6 flex flex-col justify-between shadow-xl min-h-[500px]">
          <div className="space-y-6">
            <div>
              <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider block mb-1">1. What&apos;s the issue?</span>
              <h2 className="text-xl font-bold text-white">Let&apos;s categorize the problem!</h2>
            </div>

            {/* Title & Description Input */}
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400">Title *</label>
                <input 
                  type="text" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  placeholder="E.g., Large pothole in lane"
                  className="w-full border border-white/10 bg-slate-950/80 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition"
                  required 
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400">Description *</label>
                <textarea 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)} 
                  placeholder="Tell us more about the issue..."
                  rows={3} 
                  className="w-full border border-white/10 bg-slate-950/80 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition resize-none"
                  required 
                />
                
                {/* AI Helper trigger */}
                <div className="flex justify-between items-center mt-1 text-[11px]">
                  <span className="text-slate-500 italic max-w-[160px] truncate" title={aiReason}>
                    {aiReason ? `✨ ${aiReason}` : "Need help classifying?"}
                  </span>
                  <button
                    type="button"
                    onClick={handleAiAnalyze}
                    disabled={aiLoading || !title.trim() || !description.trim()}
                    className="text-blue-400 font-semibold hover:underline flex items-center gap-1 disabled:opacity-50"
                  >
                    {aiLoading ? "Analyzing..." : "✨ Auto-suggest details"}
                  </button>
                </div>
              </div>
            </div>

            {/* Category selection Grid */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400">Select Category *</label>
              <div className="grid grid-cols-2 gap-2.5">
                {CATEGORY_MAP.map((item) => {
                  const isSelected = category === item.name;
                  return (
                    <button
                      key={item.name}
                      type="button"
                      onClick={() => setCategory(item.name)}
                      className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition duration-300 gap-1.5 ${
                        isSelected
                          ? "bg-blue-500/10 border-blue-500 text-blue-400 shadow-[0_0_12px_rgba(59,130,246,0.2)]"
                          : "bg-slate-950/40 border-white/5 text-slate-400 hover:bg-slate-950/80 hover:text-white"
                      }`}
                    >
                      {item.icon}
                      <span className="text-[10px] font-semibold tracking-wide truncate w-full">{item.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* PANEL 2: WHERE IS IT */}
        <div className="bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-2xl p-6 flex flex-col justify-between shadow-xl min-h-[500px]">
          <div className="space-y-6 flex-1 flex flex-col">
            <div>
              <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider block mb-1">2. Where is it?</span>
              <h2 className="text-xl font-bold text-white">Pinpoint the location!</h2>
            </div>

            <div className="flex-1 flex flex-col justify-center">
              <LocationPickerMap
                lat={lat}
                lng={lng}
                onLocationSelect={(newLat, newLng) => {
                  setLat(newLat);
                  setLng(newLng);
                }}
              />
            </div>
          </div>
        </div>

        {/* PANEL 3: DETAILS & SEVERITY */}
        <div className="bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-2xl p-6 flex flex-col justify-between shadow-xl min-h-[500px]">
          <div className="space-y-6">
            <div>
              <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider block mb-1">3. How bad is it? & Details</span>
              <h2 className="text-xl font-bold text-white">Severity & Description</h2>
            </div>

            {/* Severity selection neon buttons */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400">Severity Level *</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { name: "Low", color: "border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/5", activeColor: "bg-emerald-500/10 border-emerald-500 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.2)]", icon: <Smile className="w-4.5 h-4.5" /> },
                  { name: "Medium", color: "border-amber-500/30 text-amber-400 hover:bg-amber-500/5", activeColor: "bg-amber-500/10 border-amber-500 text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.2)]", icon: <AlertTriangle className="w-4.5 h-4.5" /> },
                  { name: "High", color: "border-red-500/30 text-red-400 hover:bg-red-500/5", activeColor: "bg-red-500/10 border-red-500 text-red-400 shadow-[0_0_12px_rgba(239,68,68,0.2)]", icon: <Flame className="w-4.5 h-4.5" /> },
                ].map((s) => {
                  const isSelected = severity === s.name;
                  return (
                    <button
                      key={s.name}
                      type="button"
                      onClick={() => setSeverity(s.name)}
                      className={`flex items-center justify-center gap-1.5 py-3 rounded-xl border text-xs font-bold transition duration-300 ${
                        isSelected ? s.activeColor : `bg-slate-950/40 ${s.color} text-slate-400`
                      }`}
                    >
                      {s.icon}
                      {s.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Image upload box */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400">Image Upload (optional)</label>
              <div className="relative group border border-dashed border-white/10 hover:border-blue-500/50 bg-slate-950/40 hover:bg-slate-950/80 rounded-xl p-5 transition duration-300 flex flex-col items-center justify-center text-center cursor-pointer">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileChange} 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Upload className="w-6 h-6 text-slate-500 group-hover:text-blue-400 mb-2 transition" />
                <p className="text-xs font-semibold text-slate-300 group-hover:text-white transition">
                  Drag and drop or <span className="text-blue-400 group-hover:underline">Browse</span>
                </p>
                <p className="text-[10px] text-slate-500 mt-1">Supports JPG, PNG, WEBP</p>
              </div>
              {image && (
                <div className="relative rounded-xl overflow-hidden border border-white/10 max-h-24">
                  <Image src={image} alt="Upload preview" width={600} height={400} className="w-full h-full object-cover" />
                  <button 
                    type="button" 
                    onClick={() => setImage("")}
                    className="absolute top-1 right-1 bg-black/60 hover:bg-black text-white p-1 rounded-full text-[10px]"
                  >
                    ✕ Remove
                  </button>
                </div>
              )}
            </div>

            {/* Errors / Warnings overlay */}
            {error && (
              <p className="text-xs font-semibold text-red-400 bg-red-950/10 border border-red-500/20 px-3 py-2 rounded-lg">
                ⚠️ {error}
              </p>
            )}

            {duplicateWarning && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 space-y-3">
                <h4 className="font-bold text-red-400 text-xs flex items-center gap-1.5">
                  ⚠️ Possible Duplicate Detected
                </h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {duplicateWarning.reason}
                </p>
                <div className="flex gap-2">
                  <Link
                    href={`/issue/${duplicateWarning.id}`}
                    target="_blank"
                    className="bg-slate-900 border border-white/5 hover:bg-slate-800 text-white px-3 py-1.5 rounded-lg text-[10px] font-semibold flex items-center gap-1"
                  >
                    View Report
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setForceSubmit(true);
                      setDuplicateWarning(null);
                    }}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg text-[10px] font-semibold"
                  >
                    Submit Anyway
                  </button>
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || (duplicateWarning && !forceSubmit)}
            className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white py-3.5 rounded-xl font-bold tracking-wide transition shadow-lg shadow-red-600/20 mt-6 flex items-center justify-center gap-2"
          >
            {loading ? "Submitting…" : "Submit Issue"} <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
