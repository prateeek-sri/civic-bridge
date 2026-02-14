"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useTheme } from "next-themes";
import { LogOut, LogIn, UserPlus, Shield, Sun, Moon, LayoutDashboard, FileText, Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export default function Nav() {
  const pathname = usePathname();
  const { theme, setTheme, resolvedTheme } = useTheme();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const navRef = useRef(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navRef.current && !navRef.current.contains(event.target)) {
        setMobileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const checkSession = async () => {
    try {
      const res = await fetch(`/api/auth/session?_=${Date.now()}`, {
        cache: "no-store",
        credentials: "include",
        headers: { "Cache-Control": "no-cache", Pragma: "no-cache" },
      });
      const data = await res.json();
      setUser(data?.user ?? null);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMobileOpen(false);
    checkSession();
  }, [pathname]);

  async function handleLogout(e) {
    e?.preventDefault?.();
    setLoading(true);
    setUser(null);
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
        headers: { "Cache-Control": "no-cache" },
      });
    } catch (err) {
      console.error("Logout failed", err);
    }
    window.location.href = "/";
  }

  const isDark = resolvedTheme === "dark" || theme === "dark";
  const navLinkClass = (path) =>
    `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
      pathname === path
        ? "text-primary bg-primary/10"
        : "text-muted-foreground hover:text-foreground hover:bg-accent"
    }`;

  if (!mounted) return null;

  return (
    <header className="sticky top-4 z-50 w-full">
      <div className="mx-auto mt-2 max-w-7xl px-4">
        <div className="flex h-14 items-center justify-between rounded-full bg-card/80 dark:bg-card/90 border border-border backdrop-blur-md px-6 shadow-sm">
          <Link
            href="/"
            className="font-extrabold text-lg tracking-tight text-foreground"
          >
            <span className="bg-gradient-to-r from-blue-500 to-emerald-500 bg-clip-text text-transparent">
              CivicBridge
            </span>
          </Link>

          {/* Desktop nav links */}
          {!loading && user && (
            <nav className="hidden md:flex items-center gap-1">
              <Link href="/dashboard" className={navLinkClass("/dashboard")}>
                Dashboard
              </Link>
              {user.role === "resident" && (
                <Link href="/submit" className={navLinkClass("/submit")}>
                  Report Issue
                </Link>
              )}
              {user.role === "official" && (
                <Link href="/official" className={navLinkClass("/official")}>
                  Official Dashboard
                </Link>
              )}
            </nav>
          )}

          <div className="flex items-center gap-3">
            {/* Theme toggle */}
            <button
              type="button"
              onClick={() => setTheme(isDark ? "light" : "dark")}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
              aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

           

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="flex items-center gap-2 border-border rounded-full px-2 sm:px-4 hover:bg-accent"
                >
                  <Avatar className="size-7">
                    <AvatarImage src={user?.image} />
                    <AvatarFallback className="text-xs font-bold">
                      {user?.name ? user.name.charAt(0).toUpperCase() : "G"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:inline text-sm font-medium">
                    {!loading && (user ? user.name?.split(" ")[0] : "Guest")}
                  </span>
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-56">
                {user ? (
                  <>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user.name}</p>
                        <p className="text-xs leading-none text-muted-foreground capitalize">
                          {user.role}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    
                    {user.role === "official" && (
                      <DropdownMenuItem asChild>
                        <Link href="/official" className="cursor-pointer">
                          <Shield className="mr-2 h-4 w-4" />
                          Official Dashboard
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="text-destructive focus:text-destructive cursor-pointer"
                    >
                      <LogOut className="size-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuItem asChild>
                      <Link href="/login" className="cursor-pointer">
                        <LogIn className="size-4 mr-2" /> Login
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/register" className="cursor-pointer">
                        <UserPlus className="size-4 mr-2" /> Register
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
 {/* Mobile hamburger */}
            {!loading && user && (
              <div ref={navRef} className="md:hidden relative">
                <button
                  type="button"
                  onClick={() => setMobileOpen(!mobileOpen)}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-foreground hover:bg-accent transition-colors"
                  aria-label="Menu"
                >
                  <Menu className="h-5 w-5" />
                </button>
                <div
                  className={`absolute right-0 mt-2 w-48 rounded-xl bg-popover border border-border shadow-lg py-2 transition-all duration-200 ${
                    mobileOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
                  }`}
                >
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-foreground hover:bg-accent"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Link>
                  {user.role === "resident" && (
                    <Link
                      href="/submit"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-foreground hover:bg-accent"
                    >
                      <FileText className="h-4 w-4" />
                      Report Issue
                    </Link>
                  )}
                  {user.role === "official" && (
                    <Link
                      href="/official"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-foreground hover:bg-accent"
                    >
                      <Shield className="h-4 w-4" />
                      Official Dashboard
                    </Link>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}