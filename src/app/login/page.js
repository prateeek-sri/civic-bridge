"use client";

import { useState, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

// 2. Move all logic into a separate component
function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/dashboard";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Login failed");
        return;
      }
      window.location.href = redirect;
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
          src="https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&q=80&w=1200"
          alt="Future connected community"
          width={1200}
          height={800}
          className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-lighten pointer-events-none"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-blue-950/60 via-transparent to-transparent" />
        <div className="relative z-10 text-center">
          <h1 className="text-6xl lg:text-7xl font-extrabold text-white tracking-widest uppercase drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
            Community
          </h1>
        </div>
      </div>

      {/* RIGHT SIDE: Login form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 md:p-16 bg-white dark:bg-slate-950 overflow-y-auto">
        <div className="w-full max-w-md space-y-8">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              CivicBridge <br />
              <span className="text-blue-600 dark:text-blue-500 font-extrabold">Professional Login</span>
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Welcome back. Enter your credentials to manage community reports.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 shadow-[0_2px_8px_rgba(59,130,246,0.05)] focus:shadow-[0_0_15px_rgba(59,130,246,0.15)] transition text-slate-900 dark:text-white"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 shadow-[0_2px_8px_rgba(59,130,246,0.05)] focus:shadow-[0_0_15px_rgba(59,130,246,0.15)] transition text-slate-900 dark:text-white"
                required
              />
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
              {loading ? "Logging In..." : "Log In"}
            </button>
          </form>

          <p className="text-sm text-center text-slate-500 dark:text-slate-400">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-semibold text-blue-600 dark:text-blue-500 hover:underline">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

// 3. Export the main page wrapped in Suspense
export default function LoginPage() {
  return (
    <Suspense fallback={<div className="text-center mt-10">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
