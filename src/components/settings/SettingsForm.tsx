"use client";

import { useActionState, useRef, useState } from "react";
import { updateProfile } from "@/app/actions/settings";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";

interface TeamSettings {
  id: string;
  company: string | null;
  phone: string | null;
  siret: string | null;
  address: string | null;
  city: string | null;
  postalCode: string | null;
  logo: string | null;
  insuranceNumber: string | null;
  insurerName: string | null;
  qualification: string | null;
  googleReviewLink: string | null;
}

interface UserInfo {
  name: string;
  email: string;
}

export function SettingsForm({ team, user }: { team: TeamSettings; user: UserInfo }) {
  const [state, formAction, pending] = useActionState(updateProfile, null);
  const [logoPreview, setLogoPreview] = useState<string | null>(team.logo);
  const [logoBase64, setLogoBase64] = useState<string | null>(team.logo);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setLogoPreview(result);
      setLogoBase64(result);
    };
    reader.readAsDataURL(file);
  }

  return (
    <form action={formAction}>
      <input type="hidden" name="id" value={team.id} />

      <div className="space-y-6 max-w-2xl">
        {state?.success && (
          <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
            Paramètres mis à jour avec succès
          </div>
        )}
        {state?.error && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {state.error}
          </div>
        )}

        <Card>
          <CardHeader>
            <h2 className="font-semibold text-gray-900">Mon profil</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input id="userName" name="userName" label="Nom complet" defaultValue={user.name} required />
              <Input id="userEmail" name="userEmail" type="email" label="Email" defaultValue={user.email} required />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="font-semibold text-gray-900">Entreprise</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input id="company" name="company" label="Raison sociale" defaultValue={team.company || ""} />
              <Input id="siret" name="siret" label="SIRET" defaultValue={team.siret || ""} />
            </div>
            <Input id="phone" name="phone" label="Téléphone" defaultValue={team.phone || ""} />
            <Input id="address" name="address" label="Adresse" defaultValue={team.address || ""} />
            <div className="grid grid-cols-2 gap-4">
              <Input id="city" name="city" label="Ville" defaultValue={team.city || ""} />
              <Input id="postalCode" name="postalCode" label="Code postal" defaultValue={team.postalCode || ""} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="font-semibold text-gray-900">Informations professionnelles</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Logo</label>
              <div className="flex items-center gap-4">
                {logoPreview && (
                  <img
                    src={logoPreview}
                    alt="Logo"
                    className="h-16 w-16 rounded-lg border border-gray-200 object-contain"
                  />
                )}
                <div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
                  >
                    {logoPreview ? "Changer le logo" : "Ajouter un logo"}
                  </button>
                  <p className="mt-1 text-xs text-gray-500">PNG ou JPG, max 500 Ko</p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg"
                  className="hidden"
                  onChange={handleLogoChange}
                />
              </div>
              <input type="hidden" name="logo" value={logoBase64 || ""} />
            </div>
            <Input
              id="qualification"
              name="qualification"
              label="Qualification"
              placeholder="Qualibat RGE, CTM Ramoneur..."
              defaultValue={team.qualification || ""}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                id="insuranceNumber"
                name="insuranceNumber"
                label="N° assurance RC Pro"
                defaultValue={team.insuranceNumber || ""}
              />
              <Input
                id="insurerName"
                name="insurerName"
                label="Nom de l'assureur"
                defaultValue={team.insurerName || ""}
              />
            </div>
            <div>
              <Input
                id="googleReviewLink"
                name="googleReviewLink"
                label="Lien avis Google"
                placeholder="https://g.page/r/votre-lien/review"
                defaultValue={team.googleReviewLink || ""}
              />
              <p className="mt-1 text-xs text-gray-500">
                Trouvez votre lien dans Google My Business &rarr; Accueil &rarr; Demander des avis
              </p>
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
