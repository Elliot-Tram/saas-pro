"use client";

import { useActionState } from "react";
import { submitBookingRequest } from "@/app/actions/booking";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { CheckCircle2 } from "lucide-react";

const chimneyOptions = [
  { value: "Insert", label: "Insert" },
  { value: "Foyer ouvert", label: "Foyer ouvert" },
  { value: "Poele a bois", label: "Poele a bois" },
  { value: "Poele a granules", label: "Poele a granules" },
  { value: "Chaudiere", label: "Chaudiere" },
];

interface BookingFormProps {
  teamId: string;
  companyName: string;
}

export function BookingForm({ teamId, companyName }: BookingFormProps) {
  const [state, formAction, isPending] = useActionState(submitBookingRequest, null);

  if (state?.success) {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-6 text-center">
        <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-green-800 mb-2">
          Demande envoyee !
        </h3>
        <p className="text-sm text-green-700">
          Votre demande a bien ete envoyee ! {state.companyName} vous recontactera rapidement.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="teamId" value={teamId} />

      {state?.error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          id="firstName"
          name="firstName"
          label="Prenom"
          required
          placeholder="Jean"
          autoComplete="given-name"
        />
        <Input
          id="lastName"
          name="lastName"
          label="Nom"
          required
          placeholder="Dupont"
          autoComplete="family-name"
        />
      </div>

      <Input
        id="phone"
        name="phone"
        label="Telephone"
        type="tel"
        required
        placeholder="06 12 34 56 78"
        autoComplete="tel"
      />

      <Input
        id="email"
        name="email"
        label="Email"
        type="email"
        placeholder="jean@exemple.fr"
        autoComplete="email"
      />

      <Input
        id="address"
        name="address"
        label="Adresse"
        required
        placeholder="12 rue de la Paix"
        autoComplete="street-address"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          id="city"
          name="city"
          label="Ville"
          placeholder="Paris"
          autoComplete="address-level2"
        />
        <Input
          id="postalCode"
          name="postalCode"
          label="Code postal"
          placeholder="75001"
          autoComplete="postal-code"
        />
      </div>

      <Select
        id="chimneyType"
        name="chimneyType"
        label="Type de cheminee"
        options={chimneyOptions}
        placeholder="Selectionnez un type"
        defaultValue=""
      />

      <Textarea
        id="message"
        name="message"
        label="Message / precisions"
        placeholder="Decrivez votre besoin, le nombre de conduits, vos disponibilites..."
      />

      <Button
        type="submit"
        size="lg"
        loading={isPending}
        className="w-full"
      >
        Demander un devis gratuit
      </Button>
    </form>
  );
}
