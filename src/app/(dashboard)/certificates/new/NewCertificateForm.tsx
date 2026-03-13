"use client";

import { useActionState, useState, useEffect } from "react";
import { createCertificate } from "@/app/actions/certificates";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { SignaturePad } from "@/components/ui/SignaturePad";
import { ArrowLeft, CheckCircle } from "lucide-react";
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

const conduitTypeOptions = [
  { value: "Maçonné", label: "Maçonné" },
  { value: "Tubé inox", label: "Tubé inox" },
  { value: "Tubé flexible", label: "Tubé flexible" },
];

const methodOptions = [
  { value: "mecanique_haut", label: "Mécanique par le haut" },
  { value: "mecanique_bas", label: "Mécanique par le bas" },
  { value: "chimique", label: "Chimique" },
  { value: "mixte", label: "Mixte" },
];

const conditionOptions = [
  { value: "bon_etat", label: "Bon état" },
  { value: "a_surveiller", label: "À surveiller" },
  { value: "dangereux", label: "Dangereux" },
];

const periodicityOptions = [
  { value: "annuel", label: "Annuel" },
  { value: "semestriel", label: "Semestriel" },
];

const anomalyItems = [
  { key: "anomaly_distance_plancher", label: "Distance de sécurité aux traversées de plancher non conforme" },
  { key: "anomaly_distance_toiture", label: "Distance de sécurité au niveau de la toiture non conforme" },
  { key: "anomaly_etancheite", label: "Défaut d'étanchéité du conduit" },
  { key: "anomaly_coudes", label: "Coudes non conformes (>2 coudes à 90° par DTU 24.1)" },
  { key: "anomaly_souche", label: "Souche de cheminée défectueuse" },
  { key: "anomaly_section_horizontale", label: "Section horizontale excessive (>3m)" },
  { key: "anomaly_plaque", label: "Absence de plaque signalétique" },
  { key: "anomaly_bistre", label: "Présence de bistre importante" },
  { key: "anomaly_autre", label: "Autre anomalie" },
];

interface ClientData {
  id: string;
  name: string;
  chimneyType: string | null;
  fuelType: string | null;
}

interface NewCertificateFormProps {
  clients: ClientData[];
  defaultClientId?: string;
  fromWorkflow?: boolean;
}

export function NewCertificateForm({
  clients,
  defaultClientId,
  fromWorkflow,
}: NewCertificateFormProps) {
  const [state, formAction, pending] = useActionState(createCertificate, null);
  const [selectedClientId, setSelectedClientId] = useState(
    defaultClientId || ""
  );
  const [chimneyType, setChimneyType] = useState("");
  const [fuelType, setFuelType] = useState("");

  const clientOptions = clients.map((c) => ({
    value: c.id,
    label: c.name,
  }));

  const today = new Date().toISOString().split("T")[0];

  // Auto-fill chimney data when client is selected
  useEffect(() => {
    if (!selectedClientId) return;
    const client = clients.find((c) => c.id === selectedClientId);
    if (client) {
      if (client.chimneyType) setChimneyType(client.chimneyType);
      if (client.fuelType) setFuelType(client.fuelType);
    }
  }, [selectedClientId, clients]);

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

      {fromWorkflow && (
        <div className="mb-6 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700 max-w-4xl flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
          Intervention terminée ! Créez maintenant le certificat de ramonage pour le client.
        </div>
      )}

      {state?.error && (
        <div className="mb-6 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 max-w-4xl">
          {state.error}
        </div>
      )}

      <form action={formAction} className="space-y-6 max-w-4xl">
        {/* Card 1: Client & Contexte */}
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-gray-900">Client & Contexte</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                id="clientId"
                name="clientId"
                label="Client"
                placeholder="Sélectionner un client..."
                options={clientOptions}
                value={selectedClientId}
                onChange={(e) => setSelectedClientId(e.target.value)}
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Qualité du client
              </label>
              <div className="flex items-center gap-6">
                <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="radio"
                    name="clientQuality"
                    value="proprietaire"
                    defaultChecked
                    className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  Propriétaire
                </label>
                <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="radio"
                    name="clientQuality"
                    value="locataire"
                    className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  Locataire
                </label>
                <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="radio"
                    name="clientQuality"
                    value="syndic"
                    className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  Syndic
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Installation */}
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-gray-900">Installation</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                id="chimneyType"
                name="chimneyType"
                label="Type d'appareil"
                placeholder="Sélectionner..."
                options={chimneyTypeOptions}
                value={chimneyType}
                onChange={(e) => setChimneyType(e.target.value)}
                required
              />
              <Select
                id="fuelType"
                name="fuelType"
                label="Combustible"
                placeholder="Sélectionner..."
                options={fuelTypeOptions}
                value={fuelType}
                onChange={(e) => setFuelType(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                id="chimneyLocation"
                name="chimneyLocation"
                label="Localisation"
                placeholder="Salon, RDC"
              />
              <Input
                id="applianceBrand"
                name="applianceBrand"
                label="Marque appareil"
                placeholder=""
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                id="applianceModel"
                name="applianceModel"
                label="Modèle appareil"
                placeholder=""
              />
              <Select
                id="conduitType"
                name="conduitType"
                label="Type de conduit"
                placeholder="Sélectionner..."
                options={conduitTypeOptions}
                defaultValue=""
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                id="conduitDiameter"
                name="conduitDiameter"
                label="Diamètre conduit"
                placeholder="150 mm"
              />
              <Input
                id="conduitLength"
                name="conduitLength"
                label="Longueur conduit"
                placeholder="8 m"
              />
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Intervention */}
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-gray-900">Intervention</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select
              id="method"
              name="method"
              label="Méthode"
              placeholder="Sélectionner..."
              options={methodOptions}
              defaultValue="mecanique_haut"
              required
            />
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
                Vacuité du conduit attestée sur toute sa longueur
              </label>
            </div>
            <Select
              id="condition"
              name="condition"
              label="État général"
              placeholder="Sélectionner..."
              options={conditionOptions}
              defaultValue=""
              required
            />
          </CardContent>
        </Card>

        {/* Card 4: Anomalies constatées */}
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-gray-900">Anomalies constatées</h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {anomalyItems.map((item) => (
                <div key={item.key} className="flex items-start gap-3">
                  <input
                    id={item.key}
                    name={item.key}
                    type="checkbox"
                    className="h-4 w-4 mt-0.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label
                    htmlFor={item.key}
                    className="text-sm text-gray-700"
                  >
                    {item.label}
                  </label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Card 5: Observations & Recommandations */}
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-gray-900">Observations & Recommandations</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              id="observations"
              name="observations"
              label="Observations"
              placeholder="Observations sur l'état du conduit..."
            />
            <Textarea
              id="recommendations"
              name="recommendations"
              label="Recommandations"
              placeholder="Recommandations pour le client..."
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                id="periodicity"
                name="periodicity"
                label="Périodicité recommandée"
                options={periodicityOptions}
                defaultValue="annuel"
                required
              />
              <Input
                id="nextVisit"
                name="nextVisit"
                type="date"
                label="Prochain passage recommandé"
              />
            </div>
          </CardContent>
        </Card>

        {/* Card 6: Signatures */}
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-gray-900">Signatures</h2>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <SignaturePad
                label="Signature du professionnel"
                name="proSignature"
              />
              <SignaturePad
                label="Signature du client"
                name="clientSignature"
              />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2 pb-8">
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
    </>
  );
}
