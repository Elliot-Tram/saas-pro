"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Copy, Check } from "lucide-react";

interface EmbedCodeSectionProps {
  teamId: string;
}

export function EmbedCodeSection({ teamId }: EmbedCodeSectionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const embedCode = `<iframe src="https://bistry.fr/booking/${teamId}/embed" width="100%" height="700" frameborder="0"></iframe>`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
      >
        {isOpen ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
        Integrer sur votre site
      </button>

      {isOpen && (
        <div className="mt-3 space-y-2">
          <p className="text-xs text-gray-500">
            Copiez ce code et collez-le dans votre site web pour afficher le formulaire de prise de rendez-vous.
          </p>
          <div className="relative">
            <pre className="rounded-lg bg-gray-50 border border-gray-200 p-3 text-xs text-gray-700 overflow-x-auto">
              {embedCode}
            </pre>
            <button
              type="button"
              onClick={handleCopy}
              className="absolute top-2 right-2 rounded-md bg-white border border-gray-200 p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors"
              title="Copier le code"
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-green-600" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
