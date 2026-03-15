"use client";

import { useActionState, useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { createProspectAccount } from "@/app/actions/admin";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { CheckCircle2, Copy, RefreshCw } from "lucide-react";

function generatePassword() {
  const chars = "abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let password = "";
  for (let i = 0; i < 10; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password + "A1!";
}

export function CreateProspectForm() {
  const searchParams = useSearchParams();
  const [state, formAction, isPending] = useActionState(
    createProspectAccount,
    null
  );
  const [password, setPassword] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoBase64, setLogoBase64] = useState<string | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  // Pre-fill from URL params (from prospect tracker)
  const defaultCompany = searchParams.get("company") || "";
  const defaultEmail = searchParams.get("email") || "";
  const defaultPhone = searchParams.get("phone") || "";
  const defaultCity = searchParams.get("city") || "";
  const defaultAddress = searchParams.get("address") || "";

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

  useEffect(() => {
    setPassword(generatePassword());
  }, []);

  const regeneratePassword = () => {
    setPassword(generatePassword());
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  if (state?.success) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center mb-6">
            <div className="mx-auto h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mb-3">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Compte cree avec succes
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Transmettez ces identifiants au prospect
            </p>
          </div>

          <div className="space-y-4 bg-gray-50 rounded-lg p-4">
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">
                Entreprise
              </p>
              <p className="text-sm font-medium text-gray-900">
                {state.company}
              </p>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1">Email</p>
                <p className="text-sm font-mono text-gray-900">{state.email}</p>
              </div>
              <button
                onClick={() => copyToClipboard(state.email!, "email")}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                {copied === "email" ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1">
                  Mot de passe
                </p>
                <p className="text-sm font-mono text-gray-900">
                  {state.password}
                </p>
              </div>
              <button
                onClick={() => copyToClipboard(state.password!, "password")}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                {copied === "password" ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <button
              onClick={() =>
                copyToClipboard(
                  `Bonjour,\n\nVotre compte Bistry a ete cree.\n\nEmail : ${state.email}\nMot de passe : ${state.password}\n\nConnectez-vous sur ${process.env.NEXT_PUBLIC_APP_URL || "https://app.bistry.fr"}\n\nCordialement`,
                  "all"
                )
              }
              className="flex-1"
            >
              <Button variant="secondary" className="w-full">
                <Copy className="h-4 w-4" />
                {copied === "all" ? "Copie !" : "Copier le message"}
              </Button>
            </button>
            <a href="/admin/create" className="flex-1">
              <Button variant="primary" className="w-full">
                Nouveau prospect
              </Button>
            </a>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <form action={formAction} className="space-y-5">
          {state?.error && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {state.error}
            </div>
          )}

          <Input
            id="company"
            name="company"
            label="Nom de l'entreprise"
            required
            placeholder="Ex: Ramonage Express"
            defaultValue={defaultCompany}
          />

          <Input
            id="email"
            name="email"
            type="email"
            label="Email du prospect"
            required
            placeholder="prospect@exemple.fr"
            defaultValue={defaultEmail}
          />

          <div className="space-y-1">
            <label className="block text-sm sm:text-base font-medium text-gray-700">
              Mot de passe temporaire
            </label>
            <div className="flex gap-2">
              <input
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full rounded-lg border border-gray-300 px-4 py-3 text-base text-gray-900 font-mono shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                readOnly
              />
              <button
                type="button"
                onClick={regeneratePassword}
                className="rounded-lg border border-gray-300 px-3 py-2 text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors"
                title="Regenerer"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => copyToClipboard(password, "pwd")}
                className="rounded-lg border border-gray-300 px-3 py-2 text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors"
                title="Copier"
              >
                {copied === "pwd" ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {/* Logo upload */}
          <div className="space-y-1">
            <label className="block text-sm sm:text-base font-medium text-gray-700">
              Logo de l&apos;entreprise
            </label>
            <div className="flex items-center gap-3">
              {logoPreview && (
                <img src={logoPreview} alt="Logo" className="h-12 w-12 rounded-lg border border-gray-200 object-contain" />
              )}
              <button
                type="button"
                onClick={() => logoInputRef.current?.click()}
                className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
              >
                {logoPreview ? "Changer" : "Ajouter un logo"}
              </button>
              <input
                ref={logoInputRef}
                type="file"
                accept="image/png,image/jpeg"
                className="hidden"
                onChange={handleLogoChange}
              />
            </div>
            <input type="hidden" name="logo" value={logoBase64 || ""} />
          </div>

          <Input
            id="phone"
            name="phone"
            label="Telephone"
            placeholder="06 12 34 56 78"
            defaultValue={defaultPhone}
          />

          <Input
            id="address"
            name="address"
            label="Adresse"
            placeholder="12 rue des Artisans"
            defaultValue={defaultAddress}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              id="city"
              name="city"
              label="Ville"
              placeholder="Lille"
              defaultValue={defaultCity}
            />
            <Input
              id="postalCode"
              name="postalCode"
              label="Code postal"
              placeholder="59000"
            />
          </div>

          <Input
            id="siret"
            name="siret"
            label="SIRET"
            placeholder="123 456 789 00012"
          />

          <div className="flex items-center gap-3 pt-2">
            <input
              id="seedDemo"
              name="seedDemo"
              type="checkbox"
              defaultChecked
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="seedDemo" className="text-sm text-gray-700">
              Pr&eacute;-remplir avec des donn&eacute;es de d&eacute;mo (3 clients, 1 certificat, 1 facture, 2 RDV)
            </label>
          </div>

          <div className="pt-2">
            <Button type="submit" loading={isPending} className="w-full">
              Creer le compte prospect
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
