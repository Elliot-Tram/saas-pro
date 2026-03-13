"use client";

import { Button } from "@/components/ui/Button";
import { Star, Check } from "lucide-react";
import { useState } from "react";
import { sendGoogleReviewRequest } from "@/app/actions/google-review";

interface RequestReviewButtonProps {
  clientId: string;
  clientEmail: string | null;
  certificateNumber: string;
}

export function RequestReviewButton({
  clientId,
  clientEmail,
  certificateNumber,
}: RequestReviewButtonProps) {
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleClick = async () => {
    setState("loading");
    setErrorMessage("");

    try {
      const result = await sendGoogleReviewRequest(clientId, certificateNumber);
      if (result.success) {
        setState("success");
        setTimeout(() => setState("idle"), 3000);
      } else {
        setState("error");
        setErrorMessage(result.error || "Erreur inconnue");
        setTimeout(() => setState("idle"), 5000);
      }
    } catch {
      setState("error");
      setErrorMessage("Erreur lors de l\u2019envoi");
      setTimeout(() => setState("idle"), 5000);
    }
  };

  if (!clientEmail) {
    return (
      <div className="relative group">
        <Button variant="secondary" disabled className="!text-amber-600 !border-amber-300">
          <Star className="h-4 w-4" />
          Demander un avis
        </Button>
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          Pas d&apos;email client
        </div>
      </div>
    );
  }

  if (state === "success") {
    return (
      <Button variant="secondary" disabled className="!text-green-600 !border-green-300">
        <Check className="h-4 w-4" />
        Demande envoy\u00e9e
      </Button>
    );
  }

  if (state === "error") {
    return (
      <div className="flex flex-col items-end gap-1">
        <Button
          variant="secondary"
          onClick={handleClick}
          className="!text-amber-600 !border-amber-300 hover:!bg-amber-50"
        >
          <Star className="h-4 w-4" />
          R\u00e9essayer
        </Button>
        <span className="text-xs text-red-600">{errorMessage}</span>
      </div>
    );
  }

  return (
    <Button
      variant="secondary"
      onClick={handleClick}
      loading={state === "loading"}
      className="!text-amber-600 !border-amber-300 hover:!bg-amber-50"
    >
      <Star className="h-4 w-4" />
      {state === "loading" ? "Envoi..." : "Demander un avis \u2605"}
    </Button>
  );
}
