"use client";

import { useActionState, useState, useEffect } from "react";
import { createQuote } from "@/app/actions/quotes";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Plus, Trash2, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface LineItem {
  description: string;
  quantity: number;
  unitPrice: number;
}

interface Client {
  id: string;
  firstName: string;
  lastName: string;
}

export default function NewQuotePage() {
  const [state, formAction, pending] = useActionState(createQuote, null);
  const [items, setItems] = useState<LineItem[]>([
    { description: "", quantity: 1, unitPrice: 0 },
  ]);
  const [clients, setClients] = useState<Client[]>([]);
  const [taxRate] = useState(20);

  useEffect(() => {
    fetch("/api/clients")
      .then((res) => res.json())
      .then((data) => setClients(data))
      .catch(() => {});
  }, []);

  const addItem = () => {
    setItems([...items, { description: "", quantity: 1, unitPrice: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index: number, field: keyof LineItem, value: string | number) => {
    const updated = [...items];
    if (field === "description") {
      updated[index].description = value as string;
    } else {
      updated[index][field] = parseFloat(value as string) || 0;
    }
    setItems(updated);
  };

  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const tax = subtotal * (taxRate / 100);
  const total = subtotal + tax;

  const today = new Date().toISOString().split("T")[0];
  const defaultValidUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  return (
    <>
      <div className="flex items-center gap-4 mb-8">
        <Link href="/quotes">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nouveau devis</h1>
          <p className="mt-1 text-sm text-gray-500">Créez un nouveau devis client</p>
        </div>
      </div>

      <form action={formAction}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Client & Dates */}
            <Card>
              <CardHeader>
                <h2 className="font-semibold text-gray-900">Informations générales</h2>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select
                  id="clientId"
                  name="clientId"
                  label="Client"
                  placeholder="Sélectionner un client"
                  options={clients.map((c) => ({
                    value: c.id,
                    label: `${c.firstName} ${c.lastName}`,
                  }))}
                  required
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    id="date"
                    name="date"
                    type="date"
                    label="Date du devis"
                    defaultValue={today}
                    required
                  />
                  <Input
                    id="validUntil"
                    name="validUntil"
                    type="date"
                    label="Valide jusqu'au"
                    defaultValue={defaultValidUntil}
                  />
                </div>
                <input type="hidden" name="taxRate" value={taxRate} />
              </CardContent>
            </Card>

            {/* Line items */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-gray-900">Lignes du devis</h2>
                  <Button type="button" variant="ghost" size="sm" onClick={addItem}>
                    <Plus className="h-4 w-4" />
                    Ajouter une ligne
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* Header */}
                  <div className="grid grid-cols-12 gap-3 text-xs font-medium text-gray-500 uppercase tracking-wider px-1">
                    <div className="col-span-5">Description</div>
                    <div className="col-span-2">Quantité</div>
                    <div className="col-span-2">Prix unitaire</div>
                    <div className="col-span-2 text-right">Total</div>
                    <div className="col-span-1"></div>
                  </div>

                  {items.map((item, index) => (
                    <div key={index} className="grid grid-cols-12 gap-3 items-start">
                      <div className="col-span-5">
                        <input
                          type="text"
                          name={`item_description_${index}`}
                          value={item.description}
                          onChange={(e) => updateItem(index, "description", e.target.value)}
                          placeholder="Description du service"
                          className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 shadow-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          required
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          name={`item_quantity_${index}`}
                          value={item.quantity}
                          onChange={(e) => updateItem(index, "quantity", e.target.value)}
                          min="0.01"
                          step="0.01"
                          className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          required
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          name={`item_unitPrice_${index}`}
                          value={item.unitPrice}
                          onChange={(e) => updateItem(index, "unitPrice", e.target.value)}
                          min="0"
                          step="0.01"
                          className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          required
                        />
                      </div>
                      <div className="col-span-2 flex items-center justify-end h-[38px]">
                        <span className="text-sm font-medium text-gray-900">
                          {(item.quantity * item.unitPrice).toFixed(2)} &euro;
                        </span>
                      </div>
                      <div className="col-span-1 flex items-center justify-center h-[38px]">
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="text-gray-400 hover:text-red-500 transition-colors disabled:opacity-30"
                          disabled={items.length === 1}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <h2 className="font-semibold text-gray-900">Récapitulatif</h2>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Sous-total HT</span>
                  <span className="font-medium text-gray-900">{subtotal.toFixed(2)} &euro;</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">TVA ({taxRate}%)</span>
                  <span className="font-medium text-gray-900">{tax.toFixed(2)} &euro;</span>
                </div>
                <div className="border-t border-gray-100 pt-3 flex justify-between">
                  <span className="text-base font-semibold text-gray-900">Total TTC</span>
                  <span className="text-base font-bold text-gray-900">{total.toFixed(2)} &euro;</span>
                </div>
              </CardContent>
            </Card>

            {state?.error && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3">
                <p className="text-sm text-red-700">{state.error}</p>
              </div>
            )}

            <Button type="submit" className="w-full" loading={pending}>
              Créer le devis
            </Button>
          </div>
        </div>
      </form>
    </>
  );
}
