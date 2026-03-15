"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "./Sidebar";

export function SidebarWrapper() {
  const [role, setRole] = useState<string>("admin");

  useEffect(() => {
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((session) => {
        if (session?.role) setRole(session.role);
      })
      .catch(() => {});
  }, []);

  return <Sidebar role={role} />;
}
