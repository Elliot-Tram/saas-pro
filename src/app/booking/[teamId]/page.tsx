import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { BookingForm } from "@/components/booking/BookingForm";
import { EmbedCodeSection } from "@/components/booking/EmbedCodeSection";
import type { Metadata } from "next";
import Image from "next/image";
import { MapPin, Phone } from "lucide-react";

interface Props {
  params: Promise<{ teamId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { teamId } = await params;
  const team = await prisma.team.findUnique({
    where: { id: teamId },
    select: { company: true },
  });
  if (!team) return { title: "Page introuvable" };
  return {
    title: `Demander un devis gratuit — ${team.company || "Ramoneur"}`,
    description: `Demandez un devis de ramonage gratuit en ligne avec ${team.company || "votre ramoneur"}.`,
  };
}

export default async function BookingPage({ params }: Props) {
  const { teamId } = await params;

  const team = await prisma.team.findUnique({
    where: { id: teamId },
    select: {
      id: true,
      company: true,
      city: true,
      phone: true,
      logo: true,
    },
  });

  if (!team) {
    notFound();
  }

  const companyName = team.company || "Ramoneur";

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-lg px-4 py-8 sm:py-12">
        {/* Header */}
        <div className="text-center mb-8">
          {team.logo && (
            <div className="mb-4 flex justify-center">
              <Image
                src={team.logo}
                alt={companyName}
                width={80}
                height={80}
                className="h-20 w-20 rounded-full object-cover border border-gray-200"
              />
            </div>
          )}
          <h1 className="text-2xl font-bold text-gray-900">{companyName}</h1>
          <div className="mt-2 flex items-center justify-center gap-4 text-sm text-gray-500">
            {team.city && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {team.city}
              </span>
            )}
            {team.phone && (
              <a href={`tel:${team.phone}`} className="flex items-center gap-1 hover:text-gray-700">
                <Phone className="h-3.5 w-3.5" />
                {team.phone}
              </a>
            )}
          </div>
        </div>

        {/* Title */}
        <h2 className="text-lg font-semibold text-gray-900 mb-1">
          Demander un devis gratuit
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          Remplissez le formulaire ci-dessous, nous vous recontacterons rapidement.
        </p>

        {/* Form */}
        <BookingForm teamId={team.id} companyName={companyName} />

        {/* Embed code section */}
        <div className="mt-10 border-t border-gray-100 pt-6">
          <EmbedCodeSection teamId={team.id} />
        </div>

        {/* Footer */}
        <div className="mt-10 text-center">
          <a
            href="https://bistry.fr"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-gray-400 hover:text-gray-500 transition-colors"
          >
            Propulse par Bistry
          </a>
        </div>
      </div>
    </div>
  );
}
