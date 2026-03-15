"use client";

import { useActionState, useRef, useState } from "react";
import { completeOnboarding } from "@/app/actions/onboarding";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Building2, UserCircle, MapPin, ChevronRight, ChevronLeft, Check } from "lucide-react";

const steps = [
  { number: 1, label: "Votre entreprise", icon: Building2 },
  { number: 2, label: "Votre profil professionnel", icon: UserCircle },
  { number: 3, label: "Votre premier secteur", icon: MapPin },
];

interface DefaultValues {
  company?: string;
  siret?: string;
  phone?: string;
  address?: string;
  city?: string;
  postalCode?: string;
}

export function OnboardingWizard({ defaultValues = {} }: { defaultValues?: DefaultValues }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [state, formAction, pending] = useActionState(completeOnboarding, null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoBase64, setLogoBase64] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // Store field values across steps — pre-fill from registration
  const [formData, setFormData] = useState({
    company: defaultValues.company || "",
    siret: defaultValues.siret || "",
    phone: defaultValues.phone || "",
    address: defaultValues.address || "",
    city: defaultValues.city || "",
    postalCode: defaultValues.postalCode || "",
    qualification: "",
    insuranceNumber: "",
    insurerName: "",
    googleReviewLink: "",
    sectorName: "",
  });

  function updateField(field: string, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

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

  function goNext() {
    if (currentStep === 1 && !formData.company.trim()) {
      return;
    }
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  }

  function goPrevious() {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Logo / Title */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Bienvenue sur Bistry</h1>
          <p className="text-sm text-gray-500 mt-1">Configurez votre compte en quelques etapes</p>
        </div>

        {/* Progress indicator */}
        <div className="flex items-center justify-center gap-3 mb-8">
          {steps.map((step) => (
            <div key={step.number} className="flex items-center gap-2">
              <div
                className={`flex items-center justify-center h-8 w-8 rounded-full text-sm font-semibold transition-colors ${
                  step.number === currentStep
                    ? "bg-blue-600 text-white"
                    : step.number < currentStep
                    ? "bg-green-500 text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {step.number < currentStep ? (
                  <Check className="h-4 w-4" />
                ) : (
                  step.number
                )}
              </div>
              {step.number < 3 && (
                <div
                  className={`w-12 h-0.5 ${
                    step.number < currentStep ? "bg-green-500" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step title */}
        <div className="text-center mb-6">
          <h2 className="text-lg font-semibold text-gray-900">
            {steps[currentStep - 1].label}
          </h2>
        </div>

        {state?.error && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 mb-4">
            {state.error}
          </div>
        )}

        <form ref={formRef} action={formAction}>
          {/* Hidden fields to carry all data on submission */}
          <input type="hidden" name="company" value={formData.company} />
          <input type="hidden" name="siret" value={formData.siret} />
          <input type="hidden" name="phone" value={formData.phone} />
          <input type="hidden" name="address" value={formData.address} />
          <input type="hidden" name="city" value={formData.city} />
          <input type="hidden" name="postalCode" value={formData.postalCode} />
          <input type="hidden" name="logo" value={logoBase64 || ""} />
          <input type="hidden" name="qualification" value={formData.qualification} />
          <input type="hidden" name="insuranceNumber" value={formData.insuranceNumber} />
          <input type="hidden" name="insurerName" value={formData.insurerName} />
          <input type="hidden" name="googleReviewLink" value={formData.googleReviewLink} />
          <input type="hidden" name="sectorName" value={formData.sectorName} />

          {/* Step 1: Entreprise */}
          {currentStep === 1 && (
            <Card>
              <CardContent className="space-y-4 py-6">
                <Input
                  id="company"
                  label="Raison sociale"
                  placeholder="Ex: Ramonage Savoie SARL"
                  value={formData.company}
                  onChange={(e) => updateField("company", e.target.value)}
                  required
                />
                <Input
                  id="siret"
                  label="SIRET"
                  placeholder="123 456 789 00012"
                  value={formData.siret}
                  onChange={(e) => updateField("siret", e.target.value)}
                />
                <Input
                  id="phone"
                  label="Telephone"
                  type="tel"
                  placeholder="06 12 34 56 78"
                  value={formData.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                />
                <Input
                  id="address"
                  label="Adresse"
                  placeholder="12 rue des Alpes"
                  value={formData.address}
                  onChange={(e) => updateField("address", e.target.value)}
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    id="city"
                    label="Ville"
                    placeholder="Annecy"
                    value={formData.city}
                    onChange={(e) => updateField("city", e.target.value)}
                  />
                  <Input
                    id="postalCode"
                    label="Code postal"
                    placeholder="74000"
                    value={formData.postalCode}
                    onChange={(e) => updateField("postalCode", e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Profil professionnel */}
          {currentStep === 2 && (
            <Card>
              <CardContent className="space-y-4 py-6">
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
                </div>
                <Input
                  id="qualification"
                  label="Qualification"
                  placeholder="Qualibat RGE, CTM Ramoneur..."
                  value={formData.qualification}
                  onChange={(e) => updateField("qualification", e.target.value)}
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    id="insuranceNumber"
                    label="N° assurance RC Pro"
                    placeholder="N° de police"
                    value={formData.insuranceNumber}
                    onChange={(e) => updateField("insuranceNumber", e.target.value)}
                  />
                  <Input
                    id="insurerName"
                    label="Nom de l'assureur"
                    placeholder="Ex: AXA, MAAF..."
                    value={formData.insurerName}
                    onChange={(e) => updateField("insurerName", e.target.value)}
                  />
                </div>
                <div>
                  <Input
                    id="googleReviewLink"
                    label="Lien avis Google (facultatif)"
                    placeholder="https://g.page/r/votre-lien/review"
                    value={formData.googleReviewLink}
                    onChange={(e) => updateField("googleReviewLink", e.target.value)}
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Trouvez votre lien dans Google My Business &rarr; Accueil &rarr; Demander des avis
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Premier secteur */}
          {currentStep === 3 && (
            <Card>
              <CardContent className="space-y-4 py-6">
                <div className="rounded-lg bg-blue-50 border border-blue-200 px-4 py-3 text-sm text-blue-700">
                  Les secteurs vous permettent d&apos;organiser vos tournees par zone geographique.
                  Vous pourrez en ajouter d&apos;autres plus tard.
                </div>
                <Input
                  id="sectorName"
                  label="Nom du secteur"
                  placeholder='Ex: "Annecy", "Vallee de Chamonix"'
                  value={formData.sectorName}
                  onChange={(e) => updateField("sectorName", e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => {
                    updateField("sectorName", "");
                    formRef.current?.requestSubmit();
                  }}
                  className="text-sm text-gray-500 hover:text-gray-700 underline"
                >
                  Je ferai ca plus tard
                </button>
              </CardContent>
            </Card>
          )}

          {/* Navigation buttons */}
          <div className="flex items-center justify-between mt-6">
            {currentStep > 1 ? (
              <Button type="button" variant="secondary" onClick={goPrevious}>
                <ChevronLeft className="h-4 w-4" />
                Precedent
              </Button>
            ) : (
              <div />
            )}

            {currentStep < 3 ? (
              <Button
                type="button"
                onClick={goNext}
                disabled={currentStep === 1 && !formData.company.trim()}
              >
                Suivant
                <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button type="submit" loading={pending}>
                Terminer
                <Check className="h-4 w-4" />
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
