"use client";

import { useActionState } from "react";
import { login } from "@/app/actions/auth";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Flame } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(login, null);

  return (
    <div className="w-full max-w-sm">
      <div className="text-center mb-8">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 mb-4">
          <Flame className="h-6 w-6 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Connexion</h1>
        <p className="mt-1 text-sm text-gray-500">Accédez à votre espace professionnel</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        {state?.error && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {state.error}
          </div>
        )}

        <form action={formAction} className="space-y-4">
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
            id="password"
            name="password"
            type="password"
            label="Mot de passe"
            placeholder="••••••••"
            required
            autoComplete="current-password"
          />
          <Button type="submit" className="w-full" loading={pending}>
            Se connecter
          </Button>
        </form>
      </div>

      <p className="mt-4 text-center text-sm text-gray-500">
        Pas encore de compte ?{" "}
        <Link href="/register" className="font-medium text-blue-600 hover:text-blue-500">
          Créer un compte
        </Link>
      </p>

      <p className="mt-3 text-center">
        <Link href="/landing" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
          Découvrir Bistry
        </Link>
      </p>
    </div>
  );
}
