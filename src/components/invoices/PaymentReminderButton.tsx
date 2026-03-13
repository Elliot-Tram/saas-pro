"use client";

import { Button } from "@/components/ui/Button";
import { Bell, Check } from "lucide-react";
import { useState } from "react";
import { sendPaymentReminder } from "@/app/actions/invoice-reminders";

interface PaymentReminderButtonProps {
  invoiceId: string;
  clientEmail: string | null;
}

export function PaymentReminderButton({ invoiceId, clientEmail }: PaymentReminderButtonProps) {
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleClick = async () => {
    setState("loading");
    setErrorMessage("");

    try {
      const result = await sendPaymentReminder(invoiceId);
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
        <Button variant="secondary" disabled>
          <Bell className="h-4 w-4" />
          Relancer par email
        </Button>
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          Pas d&apos;email client
        </div>
      </div>
    );
  }

  if (state === "success") {
    return (
      <Button variant="secondary" disabled>
        <Check className="h-4 w-4 text-green-600" />
        <span className="text-green-600">Relance envoyée</span>
      </Button>
    );
  }

  if (state === "error") {
    return (
      <div className="flex flex-col items-end gap-1">
        <Button variant="secondary" onClick={handleClick}>
          <Bell className="h-4 w-4" />
          Réessayer
        </Button>
        <span className="text-xs text-red-600">{errorMessage}</span>
      </div>
    );
  }

  return (
    <Button variant="secondary" onClick={handleClick} loading={state === "loading"}>
      <Bell className="h-4 w-4" />
      {state === "loading" ? "Envoi..." : "Relancer par email"}
    </Button>
  );
}
