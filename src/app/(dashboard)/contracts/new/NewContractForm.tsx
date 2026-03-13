"use client";

import { useActionState } from "react";
import { createContract } from "@/app/actions/contracts";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface NewContractFormProps {
  clients: { id: string; name: string }[];
}

export function NewContractForm({ clients }: NewContractFormProps) {
  const [state, formAction, pending] = useActionState(createContract, null);

  const clientOptions = clients.map((c) => ({
    value: c.id,
    label: c.name,
  }));

  return (
    <>
      <div className="mb-8">
        <Link
          href="/contracts"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour aux contrats
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Nouveau contrat</h1>
        <p className="mt-1 text-sm text-gray-500">
          Créez un nouveau contrat d&apos;entretien annuel
        </p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <h2 className="font-semibold text-gray-900">
            Informations du contrat
          </h2>
        </CardHeader>
        <CardContent>
          {state?.error && (
            <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {state.error}
            </div>
          )}

          <form action={formAction} className="space-y-6">
            <Select
              id="clientId"
              name="clientId"
              label="Client"
              placeholder="Sélectionner un client..."
              options={clientOptions}
              defaultValue=""
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                id="startDate"
                name="startDate"
                type="date"
                label="Date de début"
                required
              />
              <Input
                id="endDate"
                name="endDate"
                type="date"
                label="Date de fin"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                id="amount"
                name="amount"
                type="number"
                label="Montant annuel (EUR)"
                placeholder="0.00"
                step="0.01"
                min="0"
                required
              />
              <Input
                id="visits"
                name="visits"
                type="number"
                label="Nombre de visites par an"
                defaultValue="1"
                min="1"
                required
              />
            </div>

            <Textarea
              id="description"
              name="description"
              label="Description"
              placeholder="Détails du contrat d'entretien..."
            />

            <div className="flex items-center gap-2">
              <input
                id="autoRenew"
                name="autoRenew"
                type="checkbox"
                defaultChecked
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="autoRenew" className="text-sm font-medium text-gray-700">
                Renouvellement automatique
              </label>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
              <Link href="/contracts">
                <Button type="button" variant="secondary">
                  Annuler
                </Button>
              </Link>
              <Button type="submit" loading={pending}>
                Créer le contrat
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </>
  );
}
