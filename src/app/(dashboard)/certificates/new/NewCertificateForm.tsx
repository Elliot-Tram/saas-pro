"use client";

import { useActionState } from "react";
import { createCertificate } from "@/app/actions/certificates";
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

const conditionOptions = [
  { value: "bon_etat", label: "Bon état" },
  { value: "a_surveiller", label: "À surveiller" },
  { value: "dangereux", label: "Dangereux" },
];

interface Client {
  id: string;
  firstName: string;
  lastName: string;
}

interface NewCertificateFormProps {
  clients: Client[];
}

export function NewCertificateForm({ clients }: NewCertificateFormProps) {
  const [state, formAction, pending] = useActionState(createCertificate, null);

  const clientOptions = clients.map((c) => ({
    value: c.id,
    label: `${c.lastName} ${c.firstName}`,
  }));

  const today = new Date().toISOString().split("T")[0];

  return (
    <>
      <div className="mb-8">
        <Link
          href="/certificates"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour aux certificats
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Nouveau certificat
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Créez un nouveau certificat de ramonage
        </p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <h2 className="font-semibold text-gray-900">
            Informations du certificat
          </h2>
        </CardHeader>
        <CardContent>
          {state?.error && (
            <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {state.error}
            </div>
          )}

          <form action={formAction} className="space-y-6">
            {/* Client & Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                id="clientId"
                name="clientId"
                label="Client"
                placeholder="Sélectionner un client..."
                options={clientOptions}
                defaultValue=""
                required
              />
              <Input
                id="date"
                name="date"
                type="date"
                label="Date d'intervention"
                defaultValue={today}
                required
              />
            </div>

            {/* Chimney Type & Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                id="chimneyType"
                name="chimneyType"
                label="Type de cheminée"
                placeholder="Sélectionner..."
                options={chimneyTypeOptions}
                defaultValue=""
                required
              />
              <Input
                id="chimneyLocation"
                name="chimneyLocation"
                label="Emplacement"
                placeholder="Salon, RDC"
              />
            </div>

            {/* Fuel Type & Condition */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                id="fuelType"
                name="fuelType"
                label="Type de combustible"
                placeholder="Sélectionner..."
                options={fuelTypeOptions}
                defaultValue=""
              />
              <Select
                id="condition"
                name="condition"
                label="État du conduit"
                placeholder="Sélectionner..."
                options={conditionOptions}
                defaultValue=""
                required
              />
            </div>

            {/* Vacuum Test */}
            <div className="flex items-center gap-3">
              <input
                id="vacuumTest"
                name="vacuumTest"
                type="checkbox"
                defaultChecked
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label
                htmlFor="vacuumTest"
                className="text-sm font-medium text-gray-700"
              >
                Test de vacuité conforme
              </label>
            </div>

            {/* Observations */}
            <Textarea
              id="observations"
              name="observations"
              label="Observations"
              placeholder="Observations sur l'état du conduit, recommandations..."
            />

            {/* Next Visit */}
            <Input
              id="nextVisit"
              name="nextVisit"
              type="date"
              label="Prochaine visite recommandée"
            />

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
              <Link href="/certificates">
                <Button type="button" variant="secondary">
                  Annuler
                </Button>
              </Link>
              <Button type="submit" loading={pending}>
                Créer le certificat
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </>
  );
}
