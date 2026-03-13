"use client";

import { useActionState } from "react";
import { createAppointment } from "@/app/actions/appointments";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";

interface NewAppointmentModalProps {
  open: boolean;
  onClose: () => void;
  clients: { id: string; name: string }[];
  defaultDate?: string;
}

const durationOptions = [
  { value: "30", label: "30 minutes" },
  { value: "45", label: "45 minutes" },
  { value: "60", label: "1 heure" },
  { value: "90", label: "1h30" },
  { value: "120", label: "2 heures" },
];

export function NewAppointmentModal({
  open,
  onClose,
  clients,
  defaultDate,
}: NewAppointmentModalProps) {
  const [state, formAction, isPending] = useActionState(createAppointment, null);

  const clientOptions = clients.map((c) => ({
    value: c.id,
    label: c.name,
  }));

  return (
    <Modal open={open} onClose={onClose} title="Nouveau rendez-vous">
      <form action={formAction} className="space-y-4">
        {state?.error && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {state.error}
          </div>
        )}

        <Input
          id="title"
          name="title"
          label="Titre"
          placeholder="Ex: Ramonage cheminée"
          required
        />

        <Textarea
          id="description"
          name="description"
          label="Description"
          placeholder="Notes ou détails sur le rendez-vous..."
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            id="date"
            name="date"
            label="Date"
            type="date"
            required
            defaultValue={defaultDate}
          />
          <Input
            id="time"
            name="time"
            label="Heure"
            type="time"
            required
            defaultValue="09:00"
          />
        </div>

        <Select
          id="duration"
          name="duration"
          label="Durée"
          options={durationOptions}
          defaultValue="60"
        />

        <Select
          id="clientId"
          name="clientId"
          label="Client"
          options={clientOptions}
          placeholder="Sélectionnez un client"
          required
        />

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit" loading={isPending}>
            Créer le rendez-vous
          </Button>
        </div>
      </form>
    </Modal>
  );
}
