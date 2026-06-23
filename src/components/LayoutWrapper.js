"use client";

import { usePathname } from "next/navigation";
import Nav from "@/components/Nav";

export default function LayoutWrapper({ children }) {
  const pathname = usePathname();

  const isAuthRoute = pathname === "/login" || pathname === "/register";

  if (isAuthRoute) {
    return <div className="min-h-screen bg-background text-white">{children}</div>;
  }

  // Use top navigation header for all non-auth routes
  return (
    <div className="min-h-screen transition-colors duration-300 bg-background text-white dark">
      <Nav />
      <div className="relative overflow-hidden min-h-[calc(100vh-64px)]">
        
        <main className={`relative z-10 ${pathname === '/' ? "w-full" : "max-w-7xl mx-auto px-4 sm:px-6 py-8"}`}>
          {children}
        </main>
      </div>
    </div>
  );
}
