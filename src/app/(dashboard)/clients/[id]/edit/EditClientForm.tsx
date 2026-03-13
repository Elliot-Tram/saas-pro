"use client";

import { useActionState } from "react";
import { updateClient } from "@/app/actions/clients";
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

interface EditClientFormProps {
  client: {
    id: string;
    firstName: string;
    lastName: string;
    email: string | null;
    phone: string | null;
    address: string;
    city: string | null;
    postalCode: string | null;
    chimneyType: string | null;
    fuelType: string | null;
    notes: string | null;
  };
}

export function EditClientForm({ client }: EditClientFormProps) {
  const [state, formAction, pending] = useActionState(updateClient, null);

  return (
    <>
      <div className="mb-8">
        <Link
          href={`/clients/${client.id}`}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour à la fiche client
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Modifier le client</h1>
        <p className="mt-1 text-sm text-gray-500">
          Mettez à jour les informations de {client.firstName} {client.lastName}
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
            <input type="hidden" name="id" value={client.id} />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                id="firstName"
                name="firstName"
                label="Prénom"
                placeholder="Jean"
                defaultValue={client.firstName}
                required
              />
              <Input
                id="lastName"
                name="lastName"
                label="Nom"
                placeholder="Dupont"
                defaultValue={client.lastName}
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
                defaultValue={client.email || ""}
              />
              <Input
                id="phone"
                name="phone"
                type="tel"
                label="Téléphone"
                placeholder="06 12 34 56 78"
                defaultValue={client.phone || ""}
              />
            </div>

            <Input
              id="address"
              name="address"
              label="Adresse"
              placeholder="12 rue des Lilas"
              defaultValue={client.address}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                id="city"
                name="city"
                label="Ville"
                placeholder="Paris"
                defaultValue={client.city || ""}
              />
              <Input
                id="postalCode"
                name="postalCode"
                label="Code postal"
                placeholder="75001"
                defaultValue={client.postalCode || ""}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                id="chimneyType"
                name="chimneyType"
                label="Type de cheminée"
                placeholder="Sélectionner..."
                options={chimneyTypeOptions}
                defaultValue={client.chimneyType || ""}
              />
              <Select
                id="fuelType"
                name="fuelType"
                label="Type de combustible"
                placeholder="Sélectionner..."
                options={fuelTypeOptions}
                defaultValue={client.fuelType || ""}
              />
            </div>

            <Textarea
              id="notes"
              name="notes"
              label="Notes"
              placeholder="Informations complémentaires..."
              defaultValue={client.notes || ""}
            />

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
              <Link href={`/clients/${client.id}`}>
                <Button type="button" variant="secondary">
                  Annuler
                </Button>
              </Link>
              <Button type="submit" loading={pending}>
                Enregistrer
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </>
  );
}
