"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";

const LocationPickerMap = dynamic(
  () => import("@/components/LocationPickerMap"),
  { ssr: false }
);

const CATEGORIES = [
  "Roads & Streets",
  "Water & Sewage",
  "Lighting",
  "Parks & Recreation",
  "Waste Management",
  "Safety",
  "Noise",
  "Other",
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

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/issues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          category: category || "Other",
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

  const inputClass = "w-full border border-input bg-background rounded-lg px-3 py-2 focus:ring-2 focus:ring-ring focus:border-primary";

  if (user === null) {
    return (
      <p className="text-muted-foreground">
        Loading… or <Link href="/login" className="text-primary underline">log in</Link> as a resident to report an issue.
      </p>
    );
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto text-center">
        <p className="text-muted-foreground mb-4">You must be logged in as a resident to report an issue.</p>
        <Link href="/login" className="text-primary hover:underline">Log in</Link>
        {" · "}
        <Link href="/register" className="text-primary hover:underline">Register</Link>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-foreground mb-6">Report an issue</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Title *</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} required />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Description *</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className={inputClass} required />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Category *</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputClass} required>
            <option value="">Select…</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Severity *</label>
          <select value={severity} onChange={(e) => setSeverity(e.target.value)} className={inputClass}>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Image (optional)</label>
          <input type="file" accept="image/*" onChange={handleFileChange} className="w-full border border-input bg-background rounded-lg px-3 py-2" />
          {image && (
            <img src={image} alt="Preview" className="mt-2 max-h-32 rounded border border-border" />
          )}
        </div>
        <LocationPickerMap
          lat={lat}
          lng={lng}
          onLocationSelect={(newLat, newLng) => {
            setLat(newLat);
            setLng(newLng);
          }}
        />
        {error && <p className="text-destructive text-sm">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground py-2 rounded-lg font-medium transition"
        >
          {loading ? "Submitting…" : "Submit issue"}
        </button>
      </form>
    </div>
  );
}
