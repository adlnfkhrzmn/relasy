"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { NavLinks, navigationItems } from "./nav-links";
import { RelasyLogo } from "@/components/ui/relasy-logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import {
  MarkWorkspace,
  MarkSignOut,
  MarkClose,
  MarkGithub,
} from "@/components/ui/marks";
import { SOURCE_REPO_URL } from "@/components/ui/demo-notice";
import { cn } from "@/lib/utils";

interface AppShellProps {
  children: React.ReactNode;
  user?: {
    name: string;
    email: string;
    workspaceName: string;
  };
}

const SIDEBAR_STORAGE_KEY = "relasy_sidebar_hidden";

export const AppShell: React.FC<AppShellProps> = ({
  children,
  user = {
    name: "Pengguna",
    email: "pemilik@usaha.id",
    workspaceName: "Usaha Saya",
  },
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarHidden, setSidebarHidden] = useState(false);
  const [liveUser, setLiveUser] = useState(user);
  const pathname = usePathname();

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(SIDEBAR_STORAGE_KEY);
      if (saved === "true") {
        setSidebarHidden(true);
      }
    } catch {
      // Ignore storage access errors
    }
  }, []);

  useEffect(() => {
    let active = true;
    async function syncUser() {
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" });
        if (res.ok && active) {
          const data = await res.json();
          if (data?.user) {
            setLiveUser({
              name: data.user.name || "Pengguna",
              email: data.user.email || "pemilik@usaha.id",
              workspaceName: data.user.workspaceName || "Usaha Saya",
            });
          }
        }
      } catch {
        // Fallback to default prop when offline or unauthenticated in tests
      }
    }
    syncUser();

    const handleProfileUpdated = (event: Event) => {
      const customEvent = event as CustomEvent<{
        name?: string;
        email?: string;
        workspaceName?: string;
      }>;
      if (customEvent.detail) {
        setLiveUser((prev) => ({
          name: customEvent.detail.name || prev.name,
          email: customEvent.detail.email || prev.email,
          workspaceName: customEvent.detail.workspaceName || prev.workspaceName,
        }));
      } else {
        syncUser();
      }
    };

    window.addEventListener("relasy:profile-updated", handleProfileUpdated);
    return () => {
      active = false;
      window.removeEventListener("relasy:profile-updated", handleProfileUpdated);
    };
  }, []);

  const toggleSidebar = () => {
    setSidebarHidden((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem(SIDEBAR_STORAGE_KEY, String(next));
      } catch {
        // Ignore storage errors
      }
      return next;
    });
  };

  const currentItem = navigationItems.find((item) =>
    item.href === "/dashboard"
      ? pathname === "/dashboard" || pathname === "/ringkasan"
      : pathname.startsWith(item.href)
  );

  return (
    <div className="min-h-screen bg-[#F7F6F1] flex flex-col md:flex-row min-w-0">
      {/* Desktop Sidebar */}
      <aside
        aria-label="Menu Samping Desktop"
        data-sidebar-hidden={sidebarHidden ? "true" : "false"}
        className={cn(
          "hidden md:flex md:flex-col md:fixed md:inset-y-0 bg-[#FFFFFF] border-r border-[#E5E4DE] z-30 transition-[width,transform,opacity] duration-200 ease-out",
          sidebarHidden
            ? "md:w-0 md:-translate-x-full md:opacity-0 md:pointer-events-none overflow-hidden border-r-0"
            : "md:w-60 md:translate-x-0 md:opacity-100"
        )}
      >
        {/* Brand Header: Click Logo to Toggle/Hide Sidebar */}
        <div className="h-14 flex items-center justify-between px-6 border-b border-[#E5E4DE] shrink-0">
          <button
            type="button"
            onClick={toggleSidebar}
            aria-label="Sembunyikan menu samping"
            title="Klik logo untuk menyembunyikan menu samping"
            className="inline-flex items-center gap-2.5 text-left bg-transparent hover:bg-transparent active:bg-transparent border-0 shadow-none p-0 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#635BCE] focus-visible:ring-offset-2 transition-opacity hover:opacity-85 cursor-pointer [-webkit-tap-highlight-color:transparent]"
          >
            <RelasyLogo size="sm" />
          </button>
        </div>

        {/* Workspace indicator */}
        <div className="px-3 py-2.5 mx-3 my-2.5 bg-[#F7F6F1] rounded-md border border-[#E5E4DE] flex items-center gap-2.5 shrink-0">
          <MarkWorkspace className="w-4 h-4 text-[#635BCE] shrink-0" />
          <div className="truncate">
            <p className="text-xs font-semibold text-[#252927] truncate">
              {liveUser.workspaceName}
            </p>
            <p className="text-[11px] text-[#6F716D] truncate">
              {liveUser.email}
            </p>
          </div>
        </div>

        {/* Navigation links */}
        <div className="flex-1 px-3 py-1 overflow-y-auto">
          <NavLinks />
        </div>

        {/* Footer with Logout */}
        <div className="p-3 border-t border-[#E5E4DE] shrink-0 space-y-2">
          <form action="/api/auth/logout" method="POST">
            <button
              type="submit"
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-[#6F716D] hover:text-red-700 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
            >
              <MarkSignOut className="w-4 h-4" />
              <span>Keluar akun</span>
            </button>
          </form>
          <div className="px-3 flex items-center gap-2 text-[10px] text-[#A8AAA4]">
            <span className="inline-flex items-center rounded-sm border border-[#E5E4DE] px-1 py-0.5 font-semibold uppercase tracking-[0.08em]">
              Demo
            </span>
            <a
              href={SOURCE_REPO_URL}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-1 hover:text-[#252927] underline decoration-[#E5E4DE] underline-offset-2 hover:decoration-[#635BCE] transition-colors rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#635BCE] focus-visible:ring-offset-2"
            >
              <MarkGithub className="w-3 h-3 shrink-0" />
              <span>Source</span>
            </a>
          </div>
        </div>
      </aside>

      {/* Mobile Top Header: Click Logo to Open Navigation Menu */}
      <header className="md:hidden sticky top-0 z-40 bg-[#FFFFFF] border-b border-[#E5E4DE] px-4 h-14 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? "Tutup menu" : "Buka menu navigasi"}
          aria-expanded={mobileMenuOpen}
          title="Klik logo untuk membuka menu"
          className="inline-flex items-center bg-transparent hover:bg-transparent active:bg-transparent border-0 shadow-none p-0 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#635BCE] focus-visible:ring-offset-2 min-h-[44px] transition-opacity hover:opacity-85 cursor-pointer [-webkit-tap-highlight-color:transparent]"
        >
          <RelasyLogo size="sm" subtitle="Klik untuk menu" />
        </button>

        <div className="flex items-center gap-2">
          <ThemeToggle />
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 z-50 bg-[#252927]/50 flex flex-col justify-start"
          onClick={(e) => {
            if (e.target === e.currentTarget) setMobileMenuOpen(false);
          }}
        >
          <div className="bg-[#FFFFFF] w-4/5 max-w-sm h-full shadow-lg flex flex-col">
            <div className="h-14 px-4 flex items-center justify-between border-b border-[#E5E4DE]">
              <div className="flex items-center gap-2">
                <RelasyLogo size="sm" showText={false} />
                <span className="font-bold text-[#252927] text-sm">
                  Menu Utama
                </span>
              </div>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 text-[#6F716D] hover:bg-[#F7F6F1] rounded-md min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Tutup menu navigasi"
              >
                <MarkClose className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-[#F7F6F1] border-b border-[#E5E4DE]">
              <p className="text-xs font-semibold text-[#252927]">
                {liveUser.workspaceName}
              </p>
              <p className="text-xs text-[#6F716D] mt-0.5">{liveUser.email}</p>
            </div>

            <div className="flex-1 p-3 overflow-y-auto">
              <NavLinks onItemClick={() => setMobileMenuOpen(false)} />
            </div>

            <div className="p-4 border-t border-[#E5E4DE]">
              <form action="/api/auth/logout" method="POST">
                <button
                  type="submit"
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md min-h-[44px]"
                >
                  <MarkSignOut className="w-4 h-4" />
                  <span>Keluar akun</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div
        className={cn(
          "flex-1 flex flex-col min-h-screen min-w-0 transition-[padding] duration-200 ease-out",
          sidebarHidden ? "md:pl-0" : "md:pl-60"
        )}
      >
        {/* Top Bar: Click Logo to Open Sidebar when Hidden + Theme Toggle */}
        <div className="hidden md:flex h-14 items-center px-8 border-b border-[#E5E4DE] bg-[#FFFFFF] justify-between sticky top-0 z-20">
          <div className="flex items-center gap-5 text-xs text-[#6F716D]">
            {sidebarHidden && (
              <button
                type="button"
                onClick={toggleSidebar}
                aria-label="Tampilkan menu samping"
                title="Klik logo untuk menampilkan menu samping"
                className="inline-flex items-center ml-1.5 bg-transparent hover:bg-transparent active:bg-transparent border-0 shadow-none p-0 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#635BCE] focus-visible:ring-offset-2 transition-opacity hover:opacity-85 cursor-pointer [-webkit-tap-highlight-color:transparent]"
              >
                <RelasyLogo size="sm" showText={false} subtitle="" />
              </button>
            )}
            <span className="font-semibold text-sm text-[#252927]">
              {currentItem ? currentItem.name : "Dashboard"}
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs text-[#6F716D]">
            <ThemeToggle />
            <span className="hidden sm:inline">
              Workspace:{" "}
              <strong className="font-medium text-[#252927]">
                {liveUser.workspaceName}
              </strong>
            </span>
          </div>
        </div>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto pb-20 md:pb-8 animate-page-in">
          {children}
        </main>

        {/* Mobile Bottom Navigation Bar */}
        <nav
          className="md:hidden fixed bottom-0 inset-x-0 bg-[#FFFFFF] border-t border-[#E5E4DE] z-30 flex items-center justify-around h-16 px-1"
          aria-label="Navigasi Bawah"
        >
          {navigationItems.slice(0, 4).map((item) => {
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard" || pathname === "/ringkasan"
                : pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative flex flex-col items-center justify-center flex-1 h-full py-1 text-[11px] font-medium transition-colors touch-target no-underline",
                  isActive
                    ? "text-[#635BCE] font-bold"
                    : "text-[#6F716D] hover:text-[#252927]"
                )}
                aria-current={isActive ? "page" : undefined}
              >
                {isActive && (
                  <motion.span
                    layoutId="mobile-nav-pill"
                    transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute top-1 w-8 h-0.5 rounded-full bg-[#635BCE]"
                  />
                )}
                <Icon
                  className={cn(
                    "w-5 h-5 mb-0.5",
                    isActive ? "text-[#635BCE]" : "text-[#6F716D]"
                  )}
                />
                <span className="truncate max-w-[72px]">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
