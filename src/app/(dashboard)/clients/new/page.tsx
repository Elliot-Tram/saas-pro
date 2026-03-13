"use client";

import { useActionState } from "react";
import { createClient } from "@/app/actions/clients";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

const chimneyTypeOptions = [
  { value: "Insert", label: "Insert" },
  { value: "Foyer ouvert", label: "Foyer ouvert" },
  { value: "Poêle à bois", label: "Poêle à bois" },
  { value: "Poêle à granulés", label: "Poêle à granulés" },
  { value: "Chaudière", label: "Chaudière" },
];

const fuelTypeOptions = [
  { value: "Bois", label: "Bois" },
  { value: "Granulés", label: "Granulés" },
  { value: "Fioul", label: "Fioul" },
  { value: "Gaz", label: "Gaz" },
];

export default function NewClientPage() {
  const [state, formAction, pending] = useActionState(createClient, null);

  return (
    <>
      <div className="mb-8">
        <Link
          href="/clients"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour aux clients
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Nouveau client</h1>
        <p className="mt-1 text-sm text-gray-500">
          Ajoutez un nouveau client à votre fichier
        </p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <h2 className="font-semibold text-gray-900">
            Informations du client
          </h2>
        </CardHeader>
        <CardContent>
          {state?.error && (
            <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {state.error}
            </div>
          )}

          <form action={formAction} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                id="firstName"
                name="firstName"
                label="Prénom"
                placeholder="Jean"
                required
              />
              <Input
                id="lastName"
                name="lastName"
                label="Nom"
                placeholder="Dupont"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                id="email"
                name="email"
                type="email"
                label="Email"
                placeholder="jean.dupont@exemple.fr"
              />
              <Input
                id="phone"
                name="phone"
                type="tel"
                label="Téléphone"
                placeholder="06 12 34 56 78"
              />
            </div>

            <Input
              id="address"
              name="address"
              label="Adresse"
              placeholder="12 rue des Lilas"
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                id="city"
                name="city"
                label="Ville"
                placeholder="Paris"
              />
              <Input
                id="postalCode"
                name="postalCode"
                label="Code postal"
                placeholder="75001"
              />
            </div>

            <Input
              id="sector"
              name="sector"
              label="Secteur"
              placeholder="ex: Annecy Nord, Secteur Thônes..."
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                id="chimneyType"
                name="chimneyType"
                label="Type de cheminée"
                placeholder="Sélectionner..."
                options={chimneyTypeOptions}
                defaultValue=""
              />
              <Select
                id="fuelType"
                name="fuelType"
                label="Type de combustible"
                placeholder="Sélectionner..."
                options={fuelTypeOptions}
                defaultValue=""
              />
            </div>

            <Textarea
              id="notes"
              name="notes"
              label="Notes"
              placeholder="Informations complémentaires..."
            />

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
              <Link href="/clients">
                <Button type="button" variant="secondary">
                  Annuler
                </Button>
              </Link>
              <Button type="submit" loading={pending}>
                Créer le client
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </>
  );
}
