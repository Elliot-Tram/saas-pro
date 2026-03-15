import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { BookingForm } from "@/components/booking/BookingForm";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ teamId: string }>;
}

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function BookingEmbedPage({ params }: Props) {
  const { teamId } = await params;

  const team = await prisma.team.findUnique({
    where: { id: teamId },
    select: {
      id: true,
      company: true,
    },
  });

  if (!team) {
    notFound();
  }

  const companyName = team.company || "Ramoneur";

  return (
    <div className="bg-white px-4 py-6">
      <div className="mx-auto max-w-lg">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">
          Demander un rendez-vous
        </h2>

        <BookingForm teamId={team.id} companyName={companyName} />

        <div className="mt-6 text-center">
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
