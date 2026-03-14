import type { Metadata } from "next";
import { Flame } from "lucide-react";

export const metadata: Metadata = {
  title: "Mentions Legales — Bistry",
  description:
    "Mentions legales du service Bistry, logiciel de gestion pour ramoneurs professionnels.",
};

export default function LegalPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-5">
          <a href="/landing" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 shadow-lg shadow-blue-500/25">
              <Flame className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-gray-900">
              Bistry
            </span>
          </a>
          <a
            href="/landing"
            className="text-sm font-medium text-gray-500 transition-colors hover:text-gray-900"
          >
            Retour au site
          </a>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Mentions Legales
        </h1>
        <p className="mt-3 text-sm text-gray-400">
          Derniere mise a jour : mars 2026
        </p>

        <div className="mt-12 space-y-10 text-[15px] leading-relaxed text-gray-700">
          {/* Editeur */}
          <section>
            <h2 className="mb-3 text-xl font-semibold text-gray-900">
              Editeur du site
            </h2>
            <p>
              Le present site est edite par :
            </p>
            <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-5">
              <p className="font-semibold text-gray-900">Bistry</p>
              <p className="mt-1">Lille, France</p>
              <p>Email : contact@bistry.fr</p>
            </div>
          </section>

          {/* Directeur de publication */}
          <section>
            <h2 className="mb-3 text-xl font-semibold text-gray-900">
              Directeur de la publication
            </h2>
            <p>Elliot Tristram — contact@bistry.fr</p>
          </section>

          {/* Hebergeur */}
          <section>
            <h2 className="mb-3 text-xl font-semibold text-gray-900">
              Hebergeur
            </h2>
            <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-5">
              <p className="font-semibold text-gray-900">Vercel Inc.</p>
              <p className="mt-1">340 S Lemon Ave #4133</p>
              <p>Walnut, CA 91789, USA</p>
              <p className="mt-1">Site web : vercel.com</p>
            </div>
          </section>

          {/* Contact */}
          <section>
            <h2 className="mb-3 text-xl font-semibold text-gray-900">
              Contact
            </h2>
            <p>
              Pour toute question concernant le site ou le service Bistry, vous
              pouvez nous contacter a l&apos;adresse suivante :{" "}
              <a
                href="mailto:contact@bistry.fr"
                className="font-medium text-blue-600 underline underline-offset-2 hover:text-blue-800"
              >
                contact@bistry.fr
              </a>
            </p>
          </section>

          {/* Propriete intellectuelle */}
          <section>
            <h2 className="mb-3 text-xl font-semibold text-gray-900">
              Propriete intellectuelle
            </h2>
            <p>
              L&apos;ensemble des contenus presents sur le site Bistry (textes,
              images, logos, icones, logiciels) sont proteges par le droit de la
              propriete intellectuelle. Toute reproduction, representation,
              modification ou exploitation non autorisee de tout ou partie de ces
              contenus est interdite et constitue une contrefacon sanctionnee par les
              articles L.335-2 et suivants du Code de la propriete intellectuelle.
            </p>
          </section>

          {/* Donnees personnelles */}
          <section>
            <h2 className="mb-3 text-xl font-semibold text-gray-900">
              Donnees personnelles
            </h2>
            <p>
              Pour en savoir plus sur la maniere dont Bistry collecte et traite vos
              donnees personnelles, veuillez consulter notre{" "}
              <a
                href="/privacy"
                className="font-medium text-blue-600 underline underline-offset-2 hover:text-blue-800"
              >
                Politique de Confidentialite
              </a>
              .
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-slate-50">
        <div className="mx-auto flex max-w-3xl flex-col items-center justify-between gap-4 px-6 py-8 sm:flex-row">
          <p className="text-sm text-gray-400">
            &copy; 2026 Bistry. Tous droits reserves.
          </p>
          <div className="flex gap-6">
            <a
              href="/legal"
              className="text-sm font-medium text-gray-600"
            >
              Mentions legales
            </a>
            <a
              href="/privacy"
              className="text-sm text-gray-400 transition-colors hover:text-gray-600"
            >
              Confidentialite
            </a>
            <a
              href="/cgv"
              className="text-sm text-gray-400 transition-colors hover:text-gray-600"
            >
              CGV
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
