"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, FileText, BarChart3, Settings, LogOut, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Custom premium bridge logo icon
function BridgeIcon(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M3 20v-5c0-2 2-3 4-3s4 1 4 3v5" />
      <path d="M13 20v-5c0-2 2-3 4-3s4 1 4 3v5" />
      <path d="M2 12h20" />
      <path d="M3 8c4-3 14-3 18 0" />
    </svg>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((data) => {
        if (data?.user) {
          setUser(data.user);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [pathname]);

  async function handleLogout(e) {
    e.preventDefault();
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (err) {
      console.error("Logout failed:", err);
    }
    window.location.href = "/";
  }

  const isOfficial = user?.role === "official";
  const dashboardLink = isOfficial ? "/official" : "/dashboard";

  const menuItems = [
    {
      label: "Dashboard",
      icon: <LayoutDashboard className="w-5 h-5" />,
      href: dashboardLink,
      active: pathname === "/dashboard" || pathname === "/official",
    },
    {
      label: "Report Issue",
      icon: <FileText className="w-5 h-5" />,
      href: "/submit",
      active: pathname === "/submit",
      hide: isOfficial, // Officials don't submit reports
    },
    {
      label: "Analytics",
      icon: <BarChart3 className="w-5 h-5" />,
      href: isOfficial ? "/official" : "/dashboard",
      active: false,
    },
    {
      label: "Settings",
      icon: <Settings className="w-5 h-5" />,
      href: "#",
      active: false,
    },
  ];

  if (loading) {
    return (
      <aside className="w-60 shrink-0 h-screen bg-slate-950 border-r border-white/5 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
      </aside>
    );
  }

  const initial = user?.name ? user.name.charAt(0).toUpperCase() : "G";
  const roleBadge = isOfficial ? "O" : "R";

  return (
    <aside className="w-60 shrink-0 h-screen bg-slate-950/80 backdrop-blur-xl border-r border-white/5 flex flex-col justify-between p-6 select-none z-30">
      <div className="space-y-8">
        {/* Brand Header */}
        <Link href="/" className="flex items-center gap-2.5 px-2">
          <BridgeIcon className="w-6 h-6 text-blue-500 filter drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
          <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
            CivicBridge
          </span>
        </Link>

        {/* Menu Navigation */}
        <nav className="space-y-1">
          {menuItems
            .filter((item) => !item.hide)
            .map((item, idx) => (
              <Link
                key={idx}
                href={item.href}
                className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition duration-300 ${
                  item.active
                    ? "bg-white/10 text-white border border-white/10 shadow-[0_0_15px_rgba(255,255,255,0.05)]"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
        </nav>
      </div>

      {/* User Footer Account Card */}
      <div className="space-y-4 pt-4 border-t border-white/5">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-3 min-w-0">
            <Avatar className="h-9 w-9 border border-white/10 shadow-inner">
              <AvatarFallback className="bg-slate-800 text-white font-bold text-sm">
                {initial}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate">
                {user?.name || "Guest"}
              </p>
              <p className="text-[10px] text-slate-400 capitalize truncate">
                {user?.role || "Visitor"}
              </p>
            </div>
          </div>

          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] font-bold text-blue-400">
            {roleBadge}
          </span>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/5 transition duration-300"
        >
          <LogOut className="w-4 h-4" />
          Log Out
        </button>
      </div>
    </aside>
  );
}
