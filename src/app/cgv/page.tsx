import type { Metadata } from "next";
import { Flame } from "lucide-react";

export const metadata: Metadata = {
  title: "Conditions Generales de Vente — Bistry",
  description:
    "Conditions generales de vente du service Bistry, logiciel de gestion pour ramoneurs professionnels.",
};

export default function CGVPage() {
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
          Conditions Generales de Vente
        </h1>
        <p className="mt-3 text-sm text-gray-400">
          Derniere mise a jour : mars 2026
        </p>

        <div className="mt-12 space-y-10 text-[15px] leading-relaxed text-gray-700">
          {/* Article 1 */}
          <section>
            <h2 className="mb-3 text-xl font-semibold text-gray-900">
              Article 1 — Objet
            </h2>
            <p>
              Les presentes Conditions Generales de Vente (ci-apres &laquo;&nbsp;CGV&nbsp;&raquo;)
              regissent l&apos;utilisation du service Bistry, logiciel de gestion en
              ligne (SaaS) destine aux ramoneurs professionnels. Elles definissent les
              droits et obligations des parties dans le cadre de la souscription et de
              l&apos;utilisation du service.
            </p>
            <p className="mt-3">
              Toute inscription ou utilisation du service implique l&apos;acceptation
              sans reserve des presentes CGV. Bistry se reserve le droit de modifier
              les presentes CGV a tout moment. Les utilisateurs seront informes de
              toute modification par email ou notification dans l&apos;application.
            </p>
          </section>

          {/* Article 2 */}
          <section>
            <h2 className="mb-3 text-xl font-semibold text-gray-900">
              Article 2 — Acces au service
            </h2>
            <p>
              Le service Bistry est accessible via un navigateur web et propose trois
              formules d&apos;abonnement :
            </p>
            <ul className="mt-3 list-inside list-disc space-y-2 pl-2">
              <li>
                <strong>Essentiel</strong> — 29&nbsp;&euro;&nbsp;HT/mois : 1 utilisateur
                inclus, fiches clients, planning, certificats de ramonage, facturation,
                rappels annuels, dashboard et statistiques.
              </li>
              <li>
                <strong>Pro</strong> — 49&nbsp;&euro;&nbsp;HT/mois : toutes les
                fonctionnalites Essentiel, plus site vitrine personnalise, demande
                d&apos;avis Google automatique, statistiques avancees et formulaire
                devis vers fiche client.
              </li>
              <li>
                <strong>Boost</strong> — 79&nbsp;&euro;&nbsp;HT/mois : toutes les
                fonctionnalites Pro, plus publication de photos sur Google My Business,
                setup Google My Business inclus et support prioritaire.
              </li>
            </ul>
            <p className="mt-3">
              Un siege supplementaire peut etre ajoute a toute formule au tarif de
              19&nbsp;&euro;&nbsp;HT/mois par utilisateur additionnel.
            </p>
          </section>

          {/* Article 3 */}
          <section>
            <h2 className="mb-3 text-xl font-semibold text-gray-900">
              Article 3 — Inscription
            </h2>
            <p>
              L&apos;inscription au service est ouverte a toute personne physique ou
              morale exercant une activite professionnelle de ramonage ou d&apos;entretien
              de conduits. L&apos;utilisateur s&apos;engage a fournir des informations
              exactes et a jour lors de son inscription et a les maintenir actualisees
              tout au long de l&apos;utilisation du service.
            </p>
            <p className="mt-3">
              L&apos;utilisateur est responsable de la confidentialite de ses
              identifiants de connexion. Toute utilisation du service effectuee avec
              ses identifiants est reputee avoir ete effectuee par l&apos;utilisateur
              lui-meme.
            </p>
          </section>

          {/* Article 4 */}
          <section>
            <h2 className="mb-3 text-xl font-semibold text-gray-900">
              Article 4 — Duree et resiliation
            </h2>
            <p>
              L&apos;abonnement est souscrit pour une duree mensuelle, renouvelable
              tacitement a chaque echeance. L&apos;utilisateur peut resilier son
              abonnement a tout moment depuis son espace personnel ou en contactant le
              support. La resiliation prend effet a la fin de la periode en cours deja
              payee.
            </p>
            <p className="mt-3">
              En cas de manquement grave aux presentes CGV, Bistry se reserve le droit
              de suspendre ou de resilier l&apos;acces au service sans preavis ni
              remboursement.
            </p>
          </section>

          {/* Article 5 */}
          <section>
            <h2 className="mb-3 text-xl font-semibold text-gray-900">
              Article 5 — Prix et paiement
            </h2>
            <p>
              Les prix sont indiques en euros hors taxes (HT). La TVA applicable sera
              ajoutee au montant HT conformement a la legislation en vigueur. Le
              paiement est effectue mensuellement, par prelevement automatique via le
              moyen de paiement enregistre par l&apos;utilisateur.
            </p>
            <p className="mt-3">
              Bistry se reserve le droit de modifier ses tarifs. Toute modification
              tarifaire sera communiquee a l&apos;utilisateur au moins 30 jours avant
              son entree en vigueur. L&apos;utilisateur pourra resilier son abonnement
              s&apos;il n&apos;accepte pas les nouveaux tarifs.
            </p>
          </section>

          {/* Article 6 */}
          <section>
            <h2 className="mb-3 text-xl font-semibold text-gray-900">
              Article 6 — Obligations de l&apos;utilisateur
            </h2>
            <p>L&apos;utilisateur s&apos;engage a :</p>
            <ul className="mt-3 list-inside list-disc space-y-2 pl-2">
              <li>
                Utiliser le service conformement a sa destination et aux presentes CGV.
              </li>
              <li>
                Ne pas partager ses identifiants de connexion avec des tiers non
                autorises.
              </li>
              <li>
                Ne pas tenter de contourner les mesures de securite ou de copier le
                logiciel.
              </li>
              <li>
                Respecter la legislation en vigueur dans le cadre de l&apos;utilisation
                du service.
              </li>
              <li>
                Ne pas utiliser le service a des fins illicites, frauduleuses ou
                portant atteinte aux droits de tiers.
              </li>
            </ul>
          </section>

          {/* Article 7 */}
          <section>
            <h2 className="mb-3 text-xl font-semibold text-gray-900">
              Article 7 — Propriete intellectuelle
            </h2>
            <p>
              Le contenu cree par l&apos;utilisateur dans le cadre de l&apos;utilisation
              du service (fiches clients, documents, certificats) reste la propriete
              exclusive de l&apos;utilisateur. Bistry ne revendique aucun droit de
              propriete sur ces contenus.
            </p>
            <p className="mt-3">
              Le logiciel Bistry, incluant son code source, son architecture, son
              interface, sa documentation et l&apos;ensemble de ses elements visuels et
              fonctionnels, est la propriete exclusive de Bistry. Toute reproduction,
              modification, distribution ou utilisation non autorisee du logiciel est
              strictement interdite.
            </p>
          </section>

          {/* Article 8 */}
          <section>
            <h2 className="mb-3 text-xl font-semibold text-gray-900">
              Article 8 — Responsabilite
            </h2>
            <p>
              Bistry s&apos;engage a mettre en oeuvre les moyens necessaires pour assurer
              la disponibilite et le bon fonctionnement du service. Toutefois, Bistry
              ne garantit pas un fonctionnement ininterrompu ni exempt d&apos;erreurs.
            </p>
            <p className="mt-3">
              Bistry ne saurait etre tenue responsable des dommages indirects,
              pertes de donnees, manque a gagner ou prejudice commercial resultant
              de l&apos;utilisation ou de l&apos;impossibilite d&apos;utiliser le service.
              La responsabilite de Bistry est limitee au montant des sommes versees
              par l&apos;utilisateur au cours des 12 derniers mois.
            </p>
          </section>

          {/* Article 9 */}
          <section>
            <h2 className="mb-3 text-xl font-semibold text-gray-900">
              Article 9 — Donnees personnelles
            </h2>
            <p>
              Bistry collecte et traite des donnees personnelles dans le cadre de
              la fourniture du service, conformement au Reglement General sur la
              Protection des Donnees (RGPD). Pour plus d&apos;informations sur le
              traitement des donnees personnelles, veuillez consulter notre{" "}
              <a
                href="/privacy"
                className="font-medium text-blue-600 underline underline-offset-2 hover:text-blue-800"
              >
                Politique de Confidentialite
              </a>
              .
            </p>
          </section>

          {/* Article 10 */}
          <section>
            <h2 className="mb-3 text-xl font-semibold text-gray-900">
              Article 10 — Droit applicable et litiges
            </h2>
            <p>
              Les presentes CGV sont regies par le droit francais. En cas de litige
              relatif a l&apos;interpretation ou a l&apos;execution des presentes CGV,
              les parties s&apos;efforceront de trouver une solution amiable. A defaut
              d&apos;accord amiable, le litige sera soumis aux tribunaux competents du
              ressort du siege social de Bistry.
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
              className="text-sm text-gray-400 transition-colors hover:text-gray-600"
            >
              Confidentialite
            </a>
            <a
              href="/cgv"
              className="text-sm font-medium text-gray-600"
            >
              CGV
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
