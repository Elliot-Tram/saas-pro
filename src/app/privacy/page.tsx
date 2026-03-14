import type { Metadata } from "next";
import { Flame } from "lucide-react";

export const metadata: Metadata = {
  title: "Politique de Confidentialite — Bistry",
  description:
    "Politique de confidentialite et RGPD du service Bistry, logiciel de gestion pour ramoneurs professionnels.",
};

export default function PrivacyPage() {
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
          Politique de Confidentialite
        </h1>
        <p className="mt-3 text-sm text-gray-400">
          Derniere mise a jour : mars 2026
        </p>

        <div className="mt-12 space-y-10 text-[15px] leading-relaxed text-gray-700">
          {/* Responsable */}
          <section>
            <h2 className="mb-3 text-xl font-semibold text-gray-900">
              Responsable du traitement
            </h2>
            <p>
              Le responsable du traitement des donnees personnelles est Bistry.
            </p>
            <p className="mt-2 text-sm text-gray-500">
              Lille, France
              <br />
              Email : contact@bistry.fr
            </p>
          </section>

          {/* Donnees collectees */}
          <section>
            <h2 className="mb-3 text-xl font-semibold text-gray-900">
              Donnees collectees
            </h2>
            <p>
              Dans le cadre de l&apos;utilisation du service, Bistry collecte les
              categories de donnees suivantes :
            </p>
            <ul className="mt-3 list-inside list-disc space-y-2 pl-2">
              <li>
                <strong>Donnees d&apos;identification</strong> : nom, prenom, adresse
                email, numero de telephone, adresse postale.
              </li>
              <li>
                <strong>Donnees professionnelles</strong> : nom de l&apos;entreprise,
                numero SIRET, qualifications professionnelles.
              </li>
              <li>
                <strong>Donnees clients</strong> : fiches clients creees par
                l&apos;utilisateur (nom, adresse, telephone, historique
                d&apos;interventions).
              </li>
              <li>
                <strong>Documents generes</strong> : certificats de ramonage, devis,
                factures.
              </li>
              <li>
                <strong>Donnees techniques</strong> : adresse IP, type de navigateur,
                donnees de connexion.
              </li>
            </ul>
          </section>

          {/* Finalites */}
          <section>
            <h2 className="mb-3 text-xl font-semibold text-gray-900">
              Finalites du traitement
            </h2>
            <p>Les donnees collectees sont traitees pour les finalites suivantes :</p>
            <ul className="mt-3 list-inside list-disc space-y-2 pl-2">
              <li>Gestion du compte utilisateur et authentification.</li>
              <li>
                Fourniture et fonctionnement du service (gestion des fiches clients,
                generation de documents, planning).
              </li>
              <li>
                Envoi de notifications liees au service (rappels, confirmations).
              </li>
              <li>Facturation et gestion de l&apos;abonnement.</li>
              <li>Amelioration du service et support technique.</li>
            </ul>
          </section>

          {/* Base legale */}
          <section>
            <h2 className="mb-3 text-xl font-semibold text-gray-900">
              Base legale du traitement
            </h2>
            <p>
              Le traitement des donnees personnelles repose sur l&apos;execution du
              contrat liant l&apos;utilisateur a Bistry (article 6.1.b du Reglement
              General sur la Protection des Donnees — RGPD). Les donnees sont
              necessaires a la fourniture du service souscrit par l&apos;utilisateur.
            </p>
          </section>

          {/* Duree de conservation */}
          <section>
            <h2 className="mb-3 text-xl font-semibold text-gray-900">
              Duree de conservation
            </h2>
            <p>
              Les donnees personnelles sont conservees pendant toute la duree de
              l&apos;abonnement actif. Apres resiliation de l&apos;abonnement, les
              donnees sont conservees pour une duree de 3 ans a des fins de gestion
              des obligations legales (comptabilite, fiscalite), puis supprimees de
              maniere definitive.
            </p>
            <p className="mt-3">
              L&apos;utilisateur peut demander la suppression anticipee de ses donnees
              a tout moment, sous reserve des obligations legales de conservation.
            </p>
          </section>

          {/* Droits */}
          <section>
            <h2 className="mb-3 text-xl font-semibold text-gray-900">
              Droits des utilisateurs
            </h2>
            <p>
              Conformement au RGPD, vous disposez des droits suivants sur vos donnees
              personnelles :
            </p>
            <ul className="mt-3 list-inside list-disc space-y-2 pl-2">
              <li>
                <strong>Droit d&apos;acces</strong> : obtenir la confirmation que vos
                donnees sont traitees et en obtenir une copie.
              </li>
              <li>
                <strong>Droit de rectification</strong> : faire corriger des donnees
                inexactes ou incompletes.
              </li>
              <li>
                <strong>Droit de suppression</strong> : demander l&apos;effacement de
                vos donnees dans les conditions prevues par la loi.
              </li>
              <li>
                <strong>Droit a la portabilite</strong> : recevoir vos donnees dans un
                format structure et lisible par machine.
              </li>
              <li>
                <strong>Droit de limitation</strong> : demander la limitation du
                traitement de vos donnees.
              </li>
              <li>
                <strong>Droit d&apos;opposition</strong> : vous opposer au traitement
                de vos donnees pour des motifs legitimes.
              </li>
            </ul>
            <p className="mt-4">
              Pour exercer ces droits, contactez-nous a l&apos;adresse :{" "}
              <a
                href="mailto:privacy@bistry.fr"
                className="font-medium text-blue-600 underline underline-offset-2 hover:text-blue-800"
              >
                privacy@bistry.fr
              </a>
            </p>
            <p className="mt-3">
              Vous disposez egalement du droit d&apos;introduire une reclamation
              aupres de la Commission Nationale de l&apos;Informatique et des Libertes
              (CNIL) — www.cnil.fr.
            </p>
          </section>

          {/* Sous-traitants */}
          <section>
            <h2 className="mb-3 text-xl font-semibold text-gray-900">
              Sous-traitants
            </h2>
            <p>
              Bistry fait appel aux sous-traitants suivants pour le fonctionnement du
              service :
            </p>
            <ul className="mt-3 list-inside list-disc space-y-2 pl-2">
              <li>
                <strong>Vercel Inc.</strong> — Hebergement de l&apos;application web
                (340 S Lemon Ave #4133, Walnut, CA 91789, USA).
              </li>
              <li>
                <strong>Railway</strong> — Hebergement de la base de donnees.
              </li>
            </ul>
            <p className="mt-3">
              Ces sous-traitants sont lies par des clauses contractuelles garantissant
              la protection des donnees conformement au RGPD.
            </p>
          </section>

          {/* Cookies */}
          <section>
            <h2 className="mb-3 text-xl font-semibold text-gray-900">
              Cookies
            </h2>
            <p>
              Bistry utilise uniquement un cookie de session (JWT) strictement
              necessaire au fonctionnement du service et a l&apos;authentification de
              l&apos;utilisateur. Aucun cookie de tracking, de publicite ou d&apos;analyse
              comportementale n&apos;est utilise.
            </p>
            <p className="mt-3">
              Ce cookie etant indispensable au fonctionnement du service, il ne
              necessite pas de consentement prealable conformement a la directive
              ePrivacy.
            </p>
          </section>

          {/* Securite */}
          <section>
            <h2 className="mb-3 text-xl font-semibold text-gray-900">
              Securite des donnees
            </h2>
            <p>
              Bistry met en oeuvre des mesures techniques et organisationnelles
              appropriees pour proteger les donnees personnelles :
            </p>
            <ul className="mt-3 list-inside list-disc space-y-2 pl-2">
              <li>Chiffrement des mots de passe (hashage bcrypt).</li>
              <li>
                Communication securisee via HTTPS sur l&apos;ensemble du service.
              </li>
              <li>Acces restreint aux donnees (authentification obligatoire).</li>
              <li>Sauvegardes regulieres de la base de donnees.</li>
            </ul>
          </section>

          {/* Modifications */}
          <section>
            <h2 className="mb-3 text-xl font-semibold text-gray-900">
              Modifications de la politique
            </h2>
            <p>
              Bistry se reserve le droit de modifier la presente politique de
              confidentialite a tout moment. En cas de modification substantielle, les
              utilisateurs seront informes par email ou notification dans
              l&apos;application. La date de derniere mise a jour est indiquee en haut
              de cette page.
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
              className="text-sm text-gray-400 transition-colors hover:text-gray-600"
            >
              Mentions legales
            </a>
            <a
              href="/privacy"
              className="text-sm font-medium text-gray-600"
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
