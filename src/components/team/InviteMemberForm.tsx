"use client";

import { useActionState } from "react";
import { inviteMember } from "@/app/actions/team";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function InviteMemberForm() {
  const [state, formAction, pending] = useActionState(inviteMember, null);

  return (
    <div className="max-w-lg">
      <Link
        href="/team"
        className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour à l&apos;équipe
      </Link>

      <Card>
        <CardHeader>
          <h2 className="font-semibold text-gray-900">Nouveau membre</h2>
          <p className="text-sm text-gray-500 mt-1">
            Un mot de passe temporaire sera généré automatiquement.
          </p>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            {state?.error && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {state.error}
              </div>
            )}

            <Input
              id="name"
              name="name"
              label="Nom complet"
              placeholder="Lucas Martin"
              required
            />

            <Input
              id="email"
              name="email"
              type="email"
              label="Email"
              placeholder="lucas@example.com"
              required
            />

            <Select
              id="role"
              name="role"
              label="Rôle"
              options={[
                { value: "member", label: "Membre" },
                { value: "admin", label: "Administrateur" },
              ]}
            />

            <div className="flex justify-end gap-3 pt-2">
              <Link href="/team">
                <Button variant="secondary" type="button">
                  Annuler
                </Button>
              </Link>
              <Button type="submit" loading={pending}>
                Envoyer l&apos;invitation
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
