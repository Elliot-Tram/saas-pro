"use client";

import { useActionState } from "react";
import { register } from "@/app/actions/auth";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Flame } from "lucide-react";
import Link from "next/link";

export default function RegisterPage() {
  const [state, formAction, pending] = useActionState(register, null);

  return (
    <div className="w-full max-w-sm">
      <div className="text-center mb-8">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 mb-4">
          <Flame className="h-6 w-6 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Créer un compte</h1>
        <p className="mt-1 text-sm text-gray-500">Commencez à gérer votre activité</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        {state?.error && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {state.error}
          </div>
        )}

        <form action={formAction} className="space-y-4">
          <Input
            id="name"
            name="name"
            label="Nom complet"
            placeholder="Jean Dupont"
            required
          />
          <Input
            id="email"
            name="email"
            type="email"
            label="Email"
            placeholder="vous@exemple.fr"
            required
            autoComplete="email"
          />
          <Input
            id="company"
            name="company"
            label="Entreprise (optionnel)"
            placeholder="Ramonage Pro SARL"
          />
          <Input
            id="password"
            name="password"
            type="password"
            label="Mot de passe"
            placeholder="6 caractères minimum"
            required
            minLength={6}
            autoComplete="new-password"
          />
          <Button type="submit" className="w-full" loading={pending}>
            Créer mon compte
          </Button>
        </form>
      </div>

      <p className="mt-4 text-center text-sm text-gray-500">
        Déjà un compte ?{" "}
        <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
          Se connecter
        </Link>
      </p>
    </div>
  );
}
