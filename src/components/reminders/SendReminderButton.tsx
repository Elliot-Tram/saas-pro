"use client";

import { Button } from "@/components/ui/Button";
import { Send, Check } from "lucide-react";
import { useState } from "react";
import { sendAnnualReminder } from "@/app/actions/reminders";

interface SendReminderButtonProps {
  clientId: string;
  clientEmail: string | null;
  clientName: string;
}

export function SendReminderButton({ clientId, clientEmail, clientName }: SendReminderButtonProps) {
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleClick = async () => {
    setState("loading");
    setErrorMessage("");

    try {
      const result = await sendAnnualReminder(clientId);
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
      setErrorMessage("Erreur lors de l'envoi");
      setTimeout(() => setState("idle"), 5000);
    }
  };

  if (!clientEmail) {
    return (
      <div className="relative group">
        <Button variant="secondary" size="sm" disabled>
          <Send className="h-4 w-4" />
          Envoyer rappel
        </Button>
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          Pas d&apos;email
        </div>
      </div>
    );
  }

  if (state === "success") {
    return (
      <Button variant="secondary" size="sm" disabled>
        <Check className="h-4 w-4 text-green-600" />
        <span className="text-green-600">Envoyé</span>
      </Button>
    );
  }

  if (state === "error") {
    return (
      <div className="flex flex-col items-end gap-1">
        <Button variant="secondary" size="sm" onClick={handleClick}>
          <Send className="h-4 w-4" />
          Réessayer
        </Button>
        <span className="text-xs text-red-600">{errorMessage}</span>
      </div>
    );
  }

  return (
    <Button variant="secondary" size="sm" onClick={handleClick} loading={state === "loading"}>
      <Send className="h-4 w-4" />
      {state === "loading" ? "Envoi..." : "Envoyer rappel"}
    </Button>
  );
}
