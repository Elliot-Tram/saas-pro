"use client";

import { deleteCertificate } from "@/app/actions/certificates";
import { Button } from "@/components/ui/Button";
import { Trash2 } from "lucide-react";
import { useState } from "react";

export function DeleteCertificateButton({ id }: { id: string }) {
  const [confirming, setConfirming] = useState(false);

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-500">Confirmer ?</span>
        <Button
          variant="danger"
          size="sm"
          onClick={() => deleteCertificate(id)}
        >
          Supprimer
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setConfirming(false)}
        >
          Annuler
        </Button>
      </div>
    );
  }

  return (
    <Button variant="danger" onClick={() => setConfirming(true)}>
      <Trash2 className="h-4 w-4" />
      Supprimer
    </Button>
  );
}
