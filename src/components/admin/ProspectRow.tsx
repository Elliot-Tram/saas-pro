"use client";

import { useState, useTransition } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  updateProspectStatus,
  updateProspectNotes,
  deleteProspect,
} from "@/app/actions/prospects";
import {
  ExternalLink,
  UserPlus,
  Trash2,
  Check,
  X,
  Pencil,
} from "lucide-react";
import Link from "next/link";

interface Prospect {
  id: string;
  company: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  postalCode: string | null;
  googleMapsUrl: string | null;
  website: string | null;
  notes: string | null;
  status: string;
}

const STATUS_OPTIONS = [
  { value: "a_contacter", label: "A contacter" },
  { value: "appele", label: "Appele" },
  { value: "interesse", label: "Interesse" },
  { value: "compte_cree", label: "Compte cree" },
  { value: "pas_interesse", label: "Pas interesse" },
];

const STATUS_BADGE_VARIANT: Record<
  string,
  "default" | "info" | "warning" | "success" | "danger"
> = {
  a_contacter: "default",
  appele: "info",
  interesse: "warning",
  compte_cree: "success",
  pas_interesse: "danger",
};

const STATUS_LABEL: Record<string, string> = {
  a_contacter: "A contacter",
  appele: "Appele",
  interesse: "Interesse",
  compte_cree: "Compte cree",
  pas_interesse: "Pas interesse",
};

export function ProspectRow({ prospect }: { prospect: Prospect }) {
  const [isPending, startTransition] = useTransition();
  const [editingNotes, setEditingNotes] = useState(false);
  const [notesValue, setNotesValue] = useState(prospect.notes || "");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  function handleStatusChange(newStatus: string) {
    startTransition(async () => {
      await updateProspectStatus(prospect.id, newStatus);
    });
  }

  function handleNotesSave() {
    startTransition(async () => {
      await updateProspectNotes(prospect.id, notesValue);
      setEditingNotes(false);
    });
  }

  function handleNotesCancel() {
    setNotesValue(prospect.notes || "");
    setEditingNotes(false);
  }

  function handleDelete() {
    startTransition(async () => {
      await deleteProspect(prospect.id);
      setShowDeleteConfirm(false);
    });
  }

  const createAccountParams = new URLSearchParams();
  if (prospect.company) createAccountParams.set("company", prospect.company);
  if (prospect.email) createAccountParams.set("email", prospect.email);
  if (prospect.phone) createAccountParams.set("phone", prospect.phone);
  if (prospect.city) createAccountParams.set("city", prospect.city);
  if (prospect.address) createAccountParams.set("address", prospect.address);

  return (
    <tr className={`hover:bg-gray-50 transition-colors ${isPending ? "opacity-50" : ""}`}>
      {/* Entreprise */}
      <td className="px-4 py-3">
        <div>
          <p className="font-medium text-gray-900">{prospect.company}</p>
          {prospect.website && (
            <a
              href={prospect.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-500 hover:underline"
            >
              {prospect.website.replace(/^https?:\/\//, "").replace(/\/$/, "")}
            </a>
          )}
        </div>
      </td>

      {/* Ville */}
      <td className="px-4 py-3 text-sm text-gray-600">
        {prospect.city || <span className="text-gray-300">--</span>}
      </td>

      {/* Telephone */}
      <td className="px-4 py-3 text-sm">
        {prospect.phone ? (
          <a
            href={`tel:${prospect.phone}`}
            className="text-blue-600 hover:underline"
          >
            {prospect.phone}
          </a>
        ) : (
          <span className="text-gray-300">--</span>
        )}
      </td>

      {/* Email */}
      <td className="px-4 py-3 text-sm text-gray-600">
        {prospect.email ? (
          <a
            href={`mailto:${prospect.email}`}
            className="text-blue-600 hover:underline"
          >
            {prospect.email}
          </a>
        ) : (
          <span className="text-gray-300">--</span>
        )}
      </td>

      {/* Statut */}
      <td className="px-4 py-3">
        <select
          value={prospect.status}
          onChange={(e) => handleStatusChange(e.target.value)}
          disabled={isPending}
          className="text-xs rounded-lg border border-gray-200 bg-white px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </td>

      {/* Notes */}
      <td className="px-4 py-3 max-w-[200px]">
        {editingNotes ? (
          <div className="flex items-center gap-1">
            <input
              type="text"
              value={notesValue}
              onChange={(e) => setNotesValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleNotesSave();
                if (e.key === "Escape") handleNotesCancel();
              }}
              autoFocus
              className="w-full text-sm rounded border border-gray-300 px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <button
              onClick={handleNotesSave}
              className="text-green-600 hover:text-green-800 p-0.5"
              title="Sauvegarder"
            >
              <Check className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={handleNotesCancel}
              className="text-gray-400 hover:text-gray-600 p-0.5"
              title="Annuler"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <div
            className="flex items-center gap-1 group cursor-pointer"
            onClick={() => setEditingNotes(true)}
          >
            <span className="text-sm text-gray-500 truncate">
              {prospect.notes || (
                <span className="text-gray-300 italic">Ajouter une note...</span>
              )}
            </span>
            <Pencil className="h-3 w-3 text-gray-300 group-hover:text-gray-500 shrink-0" />
          </div>
        )}
      </td>

      {/* Actions */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-1.5">
          {prospect.status === "interesse" && (
            <Link href={`/admin/create?${createAccountParams.toString()}`}>
              <Button size="sm" variant="primary" className="text-xs px-2.5 py-1.5">
                <UserPlus className="h-3.5 w-3.5" />
                Creer le compte
              </Button>
            </Link>
          )}

          {prospect.googleMapsUrl && (
            <a
              href={prospect.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-lg p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              title="Google Maps"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          )}

          {showDeleteConfirm ? (
            <div className="flex items-center gap-1">
              <button
                onClick={handleDelete}
                disabled={isPending}
                className="text-red-600 hover:text-red-800 p-1"
                title="Confirmer"
              >
                <Check className="h-4 w-4" />
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
                title="Annuler"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="inline-flex items-center justify-center rounded-lg p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
              title="Supprimer"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}
