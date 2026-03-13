"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface SectorSelectProps {
  sectors: string[];
  defaultValue?: string;
  name?: string;
}

export function SectorSelect({ sectors, defaultValue = "", name = "sector" }: SectorSelectProps) {
  const [mode, setMode] = useState<"select" | "new">(
    defaultValue && !sectors.includes(defaultValue) ? "new" : "select"
  );
  const [value, setValue] = useState(defaultValue);
  const [newValue, setNewValue] = useState(
    defaultValue && !sectors.includes(defaultValue) ? defaultValue : ""
  );

  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700">Secteur</label>

      {mode === "select" ? (
        <div className="flex gap-2">
          <select
            className={cn(
              "block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
            )}
            value={value}
            onChange={(e) => {
              if (e.target.value === "__new__") {
                setMode("new");
                setValue("");
              } else {
                setValue(e.target.value);
              }
            }}
          >
            <option value="">Sans secteur</option>
            {sectors.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
            <option value="__new__">+ Créer un nouveau secteur</option>
          </select>
        </div>
      ) : (
        <div className="flex gap-2">
          <input
            className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 shadow-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Nom du secteur (ex: Vallée de Chamonix)"
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            autoFocus
          />
          {sectors.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setMode("select");
                setNewValue("");
              }}
              className="shrink-0 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50"
            >
              Annuler
            </button>
          )}
        </div>
      )}

      <input type="hidden" name={name} value={mode === "select" ? value : newValue} />
    </div>
  );
}
