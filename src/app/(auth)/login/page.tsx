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
        <img src="/logo-concept-2.svg" alt="Bistry" className="h-14 w-14 rounded-xl mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-white">Connexion</h1>
        <p className="mt-1 text-sm text-slate-400">Connectez-vous à Bistry</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-xl p-6">
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

      <p className="mt-4 text-center text-sm text-slate-400">
        Pas encore de compte ?{" "}
        <Link href="/register" className="font-medium text-blue-400 hover:text-blue-300">
          Créer un compte
        </Link>
      </p>

      <p className="mt-3 text-center">
        <Link href="/landing" className="text-sm text-slate-500 hover:text-slate-300 transition-colors">
          Découvrir Bistry
        </Link>
      </p>
    </div>
  );
}
