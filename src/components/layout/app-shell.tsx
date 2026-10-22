"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NavLinks, navigationItems } from "./nav-links";
import {
  Menu,
  X,
  Building2,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AppShellProps {
  children: React.ReactNode;
  user?: {
    name: string;
    email: string;
    workspaceName: string;
  };
}

export const AppShell: React.FC<AppShellProps> = ({
  children,
  user = {
    name: "Pengguna",
    email: "pemilik@usaha.id",
    workspaceName: "Usaha Saya",
  },
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const currentItem = navigationItems.find((item) =>
    item.href === "/ringkasan"
      ? pathname === "/ringkasan" || pathname === "/"
      : pathname.startsWith(item.href)
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 bg-white border-r border-slate-200 z-30">
        {/* Brand Header */}
        <div className="h-16 flex items-center px-6 border-b border-slate-100">
          <Link href="/ringkasan" className="flex items-center gap-2.5 no-underline">
            <div className="w-8 h-8 rounded-md bg-blue-700 flex items-center justify-center text-white font-bold text-base shadow-xs">
              R
            </div>
            <div>
              <span className="text-base font-bold text-slate-900 tracking-tight">Relasy</span>
              <span className="block text-[10px] text-slate-500 font-medium -mt-1">CRM Bisnis</span>
            </div>
          </Link>
        </div>

        {/* Workspace indicator */}
        <div className="px-4 py-3 mx-2 my-2 bg-slate-50 rounded-md border border-slate-200/60 flex items-center gap-2.5">
          <Building2 className="w-4 h-4 text-slate-500 shrink-0" />
          <div className="truncate">
            <p className="text-xs font-semibold text-slate-800 truncate">{user.workspaceName}</p>
            <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
          </div>
        </div>

        {/* Navigation links */}
        <div className="flex-1 px-3 py-2 overflow-y-auto">
          <NavLinks />
        </div>

        {/* Footer with logout */}
        <div className="p-3 border-t border-slate-100">
          <form action="/api/auth/logout" method="POST">
            <button
              type="submit"
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Keluar akun</span>
            </button>
          </form>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <header className="md:hidden sticky top-0 z-40 bg-white border-b border-slate-200 px-4 h-14 flex items-center justify-between">
        <Link href="/ringkasan" className="flex items-center gap-2 no-underline">
          <div className="w-7 h-7 rounded-md bg-blue-700 flex items-center justify-center text-white font-bold text-sm">
            R
          </div>
          <span className="text-base font-bold text-slate-900">Relasy</span>
        </Link>

        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? "Tutup menu" : "Buka menu navigasi"}
          aria-expanded={mobileMenuOpen}
          className="p-2 rounded-md text-slate-600 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex flex-col justify-start"
          onClick={(e) => {
            if (e.target === e.currentTarget) setMobileMenuOpen(false);
          }}
        >
          <div className="bg-white w-4/5 max-w-sm h-full shadow-xl flex flex-col">
            <div className="h-14 px-4 flex items-center justify-between border-b border-slate-100">
              <span className="font-bold text-slate-900">Menu Utama</span>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 text-slate-500 hover:bg-slate-100 rounded-md min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Tutup menu navigasi"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-slate-50 border-b border-slate-100">
              <p className="text-xs font-semibold text-slate-800">{user.workspaceName}</p>
              <p className="text-xs text-slate-500">{user.email}</p>
            </div>

            <div className="flex-1 p-3 overflow-y-auto">
              <NavLinks onItemClick={() => setMobileMenuOpen(false)} />
            </div>

            <div className="p-4 border-t border-slate-100">
              <form action="/api/auth/logout" method="POST">
                <button
                  type="submit"
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md min-h-[44px]"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Keluar akun</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 md:pl-64 flex flex-col min-h-screen">
        {/* Breadcrumb / Top Bar */}
        <div className="hidden md:flex h-16 items-center px-8 border-b border-slate-200 bg-white justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Relasy</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-semibold text-slate-800">
              {currentItem ? currentItem.name : "Halaman"}
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="text-slate-500">
              Status: <span className="font-medium text-emerald-700">Tersambung</span>
            </span>
          </div>
        </div>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto pb-20 md:pb-8">
          {children}
        </main>

        {/* Mobile Bottom Navigation Bar (R-03: Quick mobile thumb navigation) */}
        <nav
          className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-slate-200 z-30 flex items-center justify-around h-16 px-2 shadow-lg"
          aria-label="Navigasi Bawah"
        >
          {navigationItems.slice(0, 4).map((item) => {
            const isActive =
              item.href === "/ringkasan"
                ? pathname === "/ringkasan" || pathname === "/"
                : pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center flex-1 h-full py-1 text-[11px] font-medium transition-colors touch-target",
                  isActive ? "text-blue-700 font-bold" : "text-slate-500 hover:text-slate-900"
                )}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon className={cn("w-5 h-5 mb-0.5", isActive ? "text-blue-700" : "text-slate-400")} />
                <span className="truncate max-w-[70px]">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
