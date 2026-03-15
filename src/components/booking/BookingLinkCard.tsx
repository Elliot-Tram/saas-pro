"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Link2, Copy, Check, ExternalLink } from "lucide-react";
import Link from "next/link";

interface BookingLinkCardProps {
  teamId: string;
}

export function BookingLinkCard({ teamId }: BookingLinkCardProps) {
  const [copied, setCopied] = useState(false);
  const bookingUrl = `https://bistry.fr/booking/${teamId}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(bookingUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card>
      <CardContent className="py-4">
        <div className="flex items-start gap-3">
          <div className="rounded-lg p-2.5 bg-indigo-50">
            <Link2 className="h-5 w-5 text-indigo-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-gray-900">
              Votre page de demande de devis
            </h3>
            <p className="text-xs text-gray-500 mt-0.5 truncate">
              {bookingUrl}
            </p>
            <div className="flex items-center gap-2 mt-3">
              <Button size="sm" variant="secondary" onClick={handleCopy}>
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-green-600" />
                    Copie !
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    Copier le lien
                  </>
                )}
              </Button>
              <Link href={`/booking/${teamId}`} target="_blank">
                <Button size="sm" variant="ghost">
                  <ExternalLink className="h-3.5 w-3.5" />
                  Voir
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
