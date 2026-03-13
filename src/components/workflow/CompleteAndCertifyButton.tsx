"use client";

import { useTransition } from "react";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { completeIntervention } from "@/app/actions/workflow";

interface CompleteAndCertifyButtonProps {
  appointmentId: string;
  clientId: string;
}

export function CompleteAndCertifyButton({
  appointmentId,
}: CompleteAndCertifyButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    startTransition(async () => {
      await completeIntervention(appointmentId);
    });
  };

  return (
    <Button
      size="sm"
      onClick={handleClick}
      loading={isPending}
      className="bg-green-600 hover:bg-green-700 text-white"
    >
      <CheckCircle className="h-3.5 w-3.5" />
      Terminé + Certificat
    </Button>
  );
}
