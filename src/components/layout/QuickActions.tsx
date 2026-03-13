"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Plus, ClipboardCheck, Calendar, UserPlus } from "lucide-react";

const actions = [
  {
    label: "Nouveau certificat",
    href: "/certificates/new",
    icon: ClipboardCheck,
  },
  {
    label: "Nouveau RDV",
    href: "/calendar",
    icon: Calendar,
  },
  {
    label: "Nouveau client",
    href: "/clients/new",
    icon: UserPlus,
  },
];

export function QuickActions() {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div ref={containerRef} className="fixed bottom-6 right-6 z-50 lg:hidden">
      {/* Action buttons */}
      <div className="flex flex-col items-end gap-3 mb-3">
        {actions.map((action, index) => (
          <Link
            key={action.href}
            href={action.href}
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 rounded-full bg-white px-4 py-3 shadow-lg transition-all duration-200"
            style={{
              opacity: open ? 1 : 0,
              transform: open ? "translateY(0)" : "translateY(12px)",
              transitionDelay: open ? `${(actions.length - 1 - index) * 50}ms` : "0ms",
              pointerEvents: open ? "auto" : "none",
            }}
          >
            <action.icon className="h-5 w-5 text-blue-600 shrink-0" />
            <span className="text-sm font-medium text-gray-900 whitespace-nowrap">
              {action.label}
            </span>
          </Link>
        ))}
      </div>

      {/* FAB toggle */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="ml-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg transition-transform duration-200 hover:bg-blue-700 active:scale-95"
        aria-label="Actions rapides"
      >
        <Plus
          className="h-6 w-6 transition-transform duration-200"
          style={{ transform: open ? "rotate(45deg)" : "rotate(0deg)" }}
        />
      </button>
    </div>
  );
}
