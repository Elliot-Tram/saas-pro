"use client";

import { useEffect } from "react";
import posthog from "posthog-js";

export function PostHogIdentify() {
  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return;

    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((session) => {
        if (session?.userId) {
          posthog.identify(session.userId, {
            email: session.email,
            name: session.name,
            role: session.role,
            teamId: session.teamId,
          });
        }
      })
      .catch(() => {});
  }, []);

  return null;
}
