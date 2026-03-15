"use client";

import { useEffect } from "react";
import posthog from "posthog-js";

interface PostHogIdentifyProps {
  userId: string;
  email: string;
  name: string;
  role: string;
  teamId: string;
}

export function PostHogIdentify({ userId, email, name, role, teamId }: PostHogIdentifyProps) {
  useEffect(() => {
    if (typeof window !== "undefined" && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
      posthog.identify(userId, {
        email,
        name,
        role,
        teamId,
      });
    }
  }, [userId, email, name, role, teamId]);

  return null;
}
