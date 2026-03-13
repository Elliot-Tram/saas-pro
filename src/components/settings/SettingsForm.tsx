"use client";

import { useActionState } from "react";
import { updateProfile } from "@/app/actions/settings";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";

interface User {
  id: string;
  name: string;
  email: string;
  company: string | null;
  phone: string | null;
  siret: string | null;
  address: string | null;
  city: string | null;
  postalCode: string | null;
}

export function SettingsForm({ user }: { user: User }) {
  const [state, formAction, pending] = useActionState(updateProfile, null);

  return (
    <form action={formAction}>
      <input type="hidden" name="id" value={user.id} />

      <div className="space-y-6 max-w-2xl">
        {state?.success && (
          <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
            Profil mis à jour avec succès
          </div>
        )}
        {state?.error && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {state.error}
          </div>
        )}

        <Card>
          <CardHeader>
            <h2 className="font-semibold text-gray-900">Informations personnelles</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input id="name" name="name" label="Nom complet" defaultValue={user.name} required />
              <Input id="email" name="email" type="email" label="Email" defaultValue={user.email} required />
            </div>
            <Input id="phone" name="phone" label="Téléphone" defaultValue={user.phone || ""} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="font-semibold text-gray-900">Entreprise</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input id="company" name="company" label="Raison sociale" defaultValue={user.company || ""} />
              <Input id="siret" name="siret" label="SIRET" defaultValue={user.siret || ""} />
            </div>
            <Input id="address" name="address" label="Adresse" defaultValue={user.address || ""} />
            <div className="grid grid-cols-2 gap-4">
              <Input id="city" name="city" label="Ville" defaultValue={user.city || ""} />
              <Input id="postalCode" name="postalCode" label="Code postal" defaultValue={user.postalCode || ""} />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" loading={pending}>
            Enregistrer
          </Button>
        </div>
      </div>
    </form>
  );
}
