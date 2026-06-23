"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("resident");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Registration failed");
        return;
      }
      router.push("/login");
      router.refresh();
    } catch (err) {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const inputClass = "w-full border border-input bg-background rounded-lg px-3 py-2 focus:ring-2 focus:ring-ring focus:border-primary";
  return (
    <div className="fixed inset-0 flex flex-col md:flex-row bg-background z-50 overflow-hidden">
      {/* Brand Logo in Top Right */}
      <div className="absolute top-6 right-8 z-10 flex items-center gap-1.5">
        <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-blue-500 to-emerald-500 bg-clip-text text-transparent">
          CivicBridge
        </span>
      </div>

      {/* LEFT SIDE: Image panel */}
      <div className="relative hidden md:flex md:w-[45%] lg:w-[50%] h-full overflow-hidden select-none bg-slate-950 items-center justify-center">
        <Image
          src="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=2000"
          alt="Community park"
          width={2000}
          height={1200}
          className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-lighten pointer-events-none"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-blue-950/60 via-transparent to-transparent" />
        <div className="relative z-10 text-center">
          <h1 className="text-6xl lg:text-7xl font-extrabold text-white tracking-widest uppercase drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
            Community
          </h1>
        </div>
      </div>

      {/* RIGHT SIDE: Register form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 md:p-16 bg-white dark:bg-slate-950 overflow-y-auto">
        <div className="w-full max-w-md space-y-6">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Join CivicBridge <br />
              <span className="text-blue-600 dark:text-blue-500 font-extrabold">Create Account</span>
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Start making an impact in your neighborhood.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                FullName
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Prateek"
                className="w-full border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 shadow-[0_2px_8px_rgba(59,130,246,0.05)] focus:shadow-[0_0_15px_rgba(59,130,246,0.15)] transition text-slate-900 dark:text-white"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="prateek@example.com"
                className="w-full border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 shadow-[0_2px_8px_rgba(59,130,246,0.05)] focus:shadow-[0_0_15px_rgba(59,130,246,0.15)] transition text-slate-900 dark:text-white"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 6 characters"
                className="w-full border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 shadow-[0_2px_8px_rgba(59,130,246,0.05)] focus:shadow-[0_0_15px_rgba(59,130,246,0.15)] transition text-slate-900 dark:text-white"
                minLength={6}
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Register As
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition text-slate-900 dark:text-white"
              >
                <option value="resident">Resident / Citizen</option>
                <option value="official">Official / Authority</option>
              </select>
            </div>

            {error && (
              <p className="text-sm font-semibold text-red-500 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 px-3 py-2 rounded-lg">
                ⚠️ {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-3 rounded-xl font-bold tracking-wide transition shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <p className="text-sm text-center text-slate-500 dark:text-slate-400">
            Don&apos;t have an account?{" "}
            <Link href="/login" className="font-semibold text-blue-600 dark:text-blue-500 hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
