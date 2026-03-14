"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Calendar,
  FileText,
  ClipboardCheck,
  FileSignature,
  Bell,
  BarChart3,
  Settings,
  Menu,
  X,
  MapPin,
  UsersRound,
} from "lucide-react";

const mainNavItems = [
  { name: "Accueil", href: "/", icon: LayoutDashboard },
  { name: "Mes clients", href: "/clients", icon: Users },
  { name: "Planning", href: "/calendar", icon: Calendar },
  { name: "Certificats", href: "/certificates", icon: ClipboardCheck },
  { name: "Facturation", href: "/invoices", icon: FileText },
  { name: "Mes zones", href: "/sectors", icon: MapPin },
];

const secondaryNavItems = [
  { name: "Rappels", href: "/reminders", icon: Bell },
  { name: "Contrats", href: "/contracts", icon: FileSignature },
  { name: "Mon chiffre", href: "/stats", icon: BarChart3 },
  { name: "Équipe", href: "/team", icon: UsersRound },
  { name: "Mon entreprise", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="flex items-center justify-between gap-2.5 px-6 py-5 border-b border-gray-100">
        <Link href="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
          <img src="/logo-concept-2.svg" alt="Bistry" className="h-9 w-9 rounded-lg" />
          <span className="text-lg font-bold text-gray-900">Bistry</span>
        </Link>
        {/* Close button on mobile */}
        <button
          onClick={() => setMobileOpen(false)}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 lg:hidden"
          aria-label="Fermer le menu"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        {/* Main items */}
        <div className="space-y-1">
          {mainNavItems.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <item.icon className="h-4.5 w-4.5 shrink-0" />
                {item.name}
              </Link>
            );
          })}
        </div>

        {/* Separator */}
        <div className="mx-3 my-3 h-px bg-gray-200" />

        {/* Secondary items */}
        <div className="space-y-0.5">
          {secondaryNavItems.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                  isActive
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-400 hover:bg-gray-50 hover:text-gray-700"
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {item.name}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Bottom spacer */}
      <div className="border-t border-gray-100 px-4 py-3">
        <p className="text-xs text-gray-400">Bistry v1.0</p>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile header with hamburger */}
      <div className="fixed top-0 left-0 right-0 z-30 flex h-14 items-center gap-3 border-b border-gray-200 bg-white px-4 lg:hidden">
        <button
          onClick={() => setMobileOpen(true)}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100"
          aria-label="Ouvrir le menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <Link href="/" className="flex items-center gap-2">
          <img src="/logo-concept-2.svg" alt="Bistry" className="h-8 w-8 rounded-md" />
          <span className="text-base font-bold text-gray-900">Bistry</span>
        </Link>
      </div>

      {/* Desktop sidebar - always visible */}
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 flex-col border-r border-gray-200 bg-white lg:flex">
        {sidebarContent}
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          {/* Sidebar panel */}
          <aside className="fixed left-0 top-0 z-50 flex h-screen w-64 flex-col bg-white shadow-xl lg:hidden animate-slide-in">
            {sidebarContent}
          </aside>
        </>
      )}
    </>
  );
}
