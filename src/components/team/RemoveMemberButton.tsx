"use client";

import { useState } from "react";
import { removeMember } from "@/app/actions/team";
import { Button } from "@/components/ui/Button";
import { Trash2 } from "lucide-react";

export function RemoveMemberButton({ memberId, memberName }: { memberId: string; memberName: string }) {
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRemove() {
    setLoading(true);
    setError(null);
    const result = await removeMember(memberId);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
      setConfirming(false);
    }
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2 justify-end">
        {error && <span className="text-xs text-red-600">{error}</span>}
        <span className="text-xs text-gray-500">Retirer {memberName} ?</span>
        <Button variant="danger" size="sm" onClick={handleRemove} loading={loading}>
          Confirmer
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setConfirming(false)}>
          Annuler
        </Button>
      </div>
    );
  }

  return (
    <Button variant="ghost" size="sm" onClick={() => setConfirming(true)}>
      <Trash2 className="h-4 w-4 text-gray-400" />
    </Button>
  );
}
