import {
  ClipboardCheck,
  FileText,
  Star,
  Smartphone,
  ArrowRight,
  Check,
  Flame,
  ChevronRight,
  ChevronDown,
  Shield,
  Zap,
  Bell,
  X,
  Phone,
  Mail,
} from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bistry — Le logiciel n°1 des ramoneurs professionnels",
  description:
    "Certificats de ramonage en 30 secondes, factures automatiques, rappels clients. Conforme au decret 2023-641. Essai gratuit 14 jours.",
};

function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-slate-900/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <a href="/landing" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 shadow-lg shadow-blue-500/25">
            <Flame className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">
            Bistry
          </span>
        </a>
        <div className="hidden items-center gap-8 md:flex">
          <a
            href="#fonctionnalites"
            className="text-sm font-medium text-slate-300 transition-colors hover:text-white"
          >
            Fonctionnalites
          </a>
          <a
            href="#tarifs"
            className="text-sm font-medium text-slate-300 transition-colors hover:text-white"
          >
            Tarifs
          </a>
          <a
            href="#faq"
            className="text-sm font-medium text-slate-300 transition-colors hover:text-white"
          >
            FAQ
          </a>
          <a
            href="/login"
            className="text-sm font-medium text-slate-300 transition-colors hover:text-white"
          >
            Connexion
          </a>
          <a
            href="/register"
            className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition-all hover:bg-blue-500 hover:shadow-blue-500/30"
          >
            Essai gratuit 14 jours
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
        <a
          href="/register"
          className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white md:hidden"
        >
          Essai gratuit
        </a>
      </div>
    </nav>
  );
}

function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-[#0c2444] to-slate-900 pt-32 pb-24 lg:pt-44 lg:pb-32">
      {/* Background decorations */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-blue-600/10 blur-3xl" />
        <div className="absolute right-1/4 bottom-1/4 h-96 w-96 rounded-full bg-blue-400/8 blur-3xl" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-400/20 to-transparent" />
      </div>

      {/* Grid pattern overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10 mx-auto max-w-7xl px-6 text-center">
        {/* Badge */}
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-2 text-sm font-medium text-blue-300">
          <Shield className="h-4 w-4" />
          Conforme au decret 2023-641
        </div>

        {/* Headline */}
        <h1 className="mx-auto max-w-5xl text-4xl leading-tight font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl lg:leading-[1.1]">
          Creez vos certificats de ramonage{" "}
          <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
            en 30 secondes
          </span>
        </h1>

        {/* Subheadline */}
        <p className="mx-auto mt-6 max-w-3xl text-lg leading-relaxed text-slate-300 sm:text-xl">
          Fini le carnet papier. Bistry genere vos certificats, factures et
          rappels automatiquement. Conforme au decret 2023-641.
        </p>

        {/* CTAs */}
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <a
            href="/register"
            className="group inline-flex items-center gap-2.5 rounded-full bg-blue-600 px-8 py-4 text-base font-semibold text-white shadow-2xl shadow-blue-600/30 transition-all hover:bg-blue-500 hover:shadow-blue-500/40 hover:-translate-y-0.5"
          >
            Essai gratuit 14 jours
            <ArrowRight className="h-4.5 w-4.5 transition-transform group-hover:translate-x-0.5" />
          </a>
          <a
            href="#certificate"
            className="inline-flex items-center gap-2.5 rounded-full border border-white/20 bg-white/5 px-8 py-4 text-base font-semibold text-white backdrop-blur transition-all hover:border-white/30 hover:bg-white/10"
          >
            Voir un exemple de certificat
            <ChevronDown className="h-4.5 w-4.5" />
          </a>
        </div>

        {/* Sub-CTA text */}
        <p className="mt-4 text-sm text-slate-400">
          Pas besoin de carte bancaire
        </p>

        {/* Phone line */}
        <p className="mt-6 flex items-center justify-center gap-2 text-sm text-slate-400">
          <Phone className="h-4 w-4" />
          Une question ? Appelez-nous au 04 XX XX XX XX
        </p>
      </div>
    </section>
  );
}

function CertificateShowcase() {
  return (
    <section id="certificate" className="bg-gradient-to-b from-slate-50 to-white py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6">
        {/* Section header */}
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-1.5 text-sm font-medium text-blue-700">
            <FileText className="h-4 w-4" />
            Certificat
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">
            Un certificat qui{" "}
            <span className="text-blue-600">fait pro</span>
          </h2>
        </div>

        {/* Certificate mockup */}
        <div className="mx-auto mt-16 max-w-2xl lg:mt-20">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-300/50">
            {/* Blue top bar */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20">
                    <Flame className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white/90">VOTRE ENTREPRISE</div>
                    <div className="text-xs text-blue-200">SIRET : XXX XXX XXX XXXXX</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-blue-200">N° 2024-0147</div>
                  <div className="text-xs text-blue-200">15/03/2026</div>
                </div>
              </div>
            </div>

            {/* Certificate title */}
            <div className="border-b border-slate-100 px-8 py-6 text-center">
              <h3 className="text-xl font-bold tracking-wide text-slate-800 uppercase">
                Certificat de ramonage
              </h3>
              <p className="mt-1 text-sm text-slate-400">
                Article 31-6 du RSDT &mdash; Decret 2023-641
              </p>
            </div>

            {/* Content */}
            <div className="px-8 py-6">
              {/* Client info */}
              <div className="mb-6 rounded-xl bg-slate-50 p-5">
                <div className="mb-2 text-xs font-semibold tracking-wide text-slate-400 uppercase">
                  Client
                </div>
                <div className="text-sm font-medium text-slate-700">M. Jean Dupont</div>
                <div className="text-sm text-slate-500">12 rue des Lilas, 69001 Lyon</div>
              </div>

              {/* Intervention details */}
              <div className="mb-6 grid grid-cols-2 gap-4">
                <div className="rounded-xl bg-slate-50 p-4">
                  <div className="mb-1 text-xs font-semibold tracking-wide text-slate-400 uppercase">
                    Type de conduit
                  </div>
                  <div className="text-sm font-medium text-slate-700">Conduit maconnee</div>
                </div>
                <div className="rounded-xl bg-slate-50 p-4">
                  <div className="mb-1 text-xs font-semibold tracking-wide text-slate-400 uppercase">
                    Combustible
                  </div>
                  <div className="text-sm font-medium text-slate-700">Bois</div>
                </div>
              </div>

              {/* Status badges */}
              <div className="mb-6 flex flex-col gap-3 sm:flex-row">
                <div className="flex-1 rounded-xl border border-green-200 bg-green-50 px-5 py-4 text-center">
                  <div className="mb-1 text-xs font-semibold tracking-wide text-green-600 uppercase">
                    Vacuite
                  </div>
                  <div className="text-lg font-bold text-green-700">CONFORME</div>
                </div>
                <div className="flex-1 rounded-xl border border-green-200 bg-green-50 px-5 py-4 text-center">
                  <div className="mb-1 text-xs font-semibold tracking-wide text-green-600 uppercase">
                    Etat general
                  </div>
                  <div className="text-lg font-bold text-green-700">BON ETAT</div>
                </div>
              </div>

              {/* Signatures */}
              <div className="grid grid-cols-2 gap-6 border-t border-slate-100 pt-6">
                <div className="text-center">
                  <div className="mb-2 text-xs font-semibold tracking-wide text-slate-400 uppercase">
                    Signature du technicien
                  </div>
                  <div className="mx-auto h-16 w-32 rounded-lg border-2 border-dashed border-slate-200 bg-slate-50" />
                </div>
                <div className="text-center">
                  <div className="mb-2 text-xs font-semibold tracking-wide text-slate-400 uppercase">
                    Signature du client
                  </div>
                  <div className="mx-auto h-16 w-32 rounded-lg border-2 border-dashed border-slate-200 bg-slate-50" />
                </div>
              </div>
            </div>

            {/* Legal footer */}
            <div className="border-t border-slate-100 bg-slate-50 px-8 py-4">
              <p className="text-center text-[11px] leading-relaxed text-slate-400">
                Ce certificat atteste que le ramonage a ete effectue conformement aux
                dispositions du decret n° 2023-641 du 20 juillet 2023.
                Document a conserver et a presenter a votre assurance.
              </p>
            </div>
          </div>

          {/* Caption below */}
          <p className="mt-8 text-center text-base leading-relaxed text-gray-500">
            Personnalise avec votre logo, votre signature, et les informations de
            votre entreprise.
          </p>
        </div>
      </div>
    </section>
  );
}

function SocialProofBar() {
  return (
    <section className="border-y border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-6 py-6">
        <div className="flex flex-col items-center justify-center gap-6 sm:flex-row sm:gap-12">
          <div className="flex items-center gap-2.5 text-sm font-medium text-slate-700">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
              <Shield className="h-4 w-4 text-green-600" />
            </div>
            Conforme decret 2023-641
          </div>
          <div className="hidden h-5 w-px bg-slate-300 sm:block" />
          <div className="flex items-center gap-2.5 text-sm font-medium text-slate-700">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
              <Smartphone className="h-4 w-4 text-blue-600" />
            </div>
            Signature sur telephone
          </div>
          <div className="hidden h-5 w-px bg-slate-300 sm:block" />
          <div className="flex items-center gap-2.5 text-sm font-medium text-slate-700">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100">
              <Bell className="h-4 w-4 text-amber-600" />
            </div>
            Rappels automatiques
          </div>
          <div className="hidden h-5 w-px bg-slate-300 sm:block" />
          <div className="flex items-center gap-2.5 text-sm font-medium text-slate-700">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100">
              <Zap className="h-4 w-4 text-purple-600" />
            </div>
            Essai gratuit 14 jours
          </div>
        </div>
      </div>
    </section>
  );
}

const features = [
  {
    icon: ClipboardCheck,
    title: "Certificats en un clic",
    description:
      "Apres chaque intervention, un seul bouton : votre certificat est pret, signe, et envoye au client.",
    color: "blue" as const,
  },
  {
    icon: FileText,
    title: "Zero paperasse",
    description:
      "Factures, devis, relances — tout se fait automatiquement. Vous ne touchez plus un papier.",
    color: "green" as const,
  },
  {
    icon: Bell,
    title: "Vos clients vous rappellent",
    description:
      "Bistry envoie les rappels annuels a votre place. Vos clients reviennent sans que vous ayez a les relancer.",
    color: "amber" as const,
  },
  {
    icon: Star,
    title: "Plus d'avis Google",
    description:
      "Apres chaque intervention, vos clients recoivent une demande d'avis. Votre reputation grimpe toute seule.",
    color: "purple" as const,
  },
];

const colorMap = {
  blue: {
    iconBg: "bg-blue-100",
    icon: "text-blue-600",
    border: "border-blue-100",
    hoverBorder: "hover:border-blue-200",
  },
  green: {
    iconBg: "bg-green-100",
    icon: "text-green-600",
    border: "border-green-100",
    hoverBorder: "hover:border-green-200",
  },
  amber: {
    iconBg: "bg-amber-100",
    icon: "text-amber-600",
    border: "border-amber-100",
    hoverBorder: "hover:border-amber-200",
  },
  purple: {
    iconBg: "bg-purple-100",
    icon: "text-purple-600",
    border: "border-purple-100",
    hoverBorder: "hover:border-purple-200",
  },
};

function FeaturesSection() {
  return (
    <section id="fonctionnalites" className="bg-white py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6">
        {/* Section header */}
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-1.5 text-sm font-medium text-blue-700">
            <Zap className="h-4 w-4" />
            Fonctionnalites
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">
            Tout ce qu&apos;il vous faut,{" "}
            <span className="text-blue-600">rien de superflu</span>
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-gray-500">
            Vous faites le ramonage, Bistry fait le reste.
          </p>
        </div>

        {/* Features grid — 4 cards, 2x2 */}
        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:mt-20">
          {features.map((feature) => {
            const colors = colorMap[feature.color];
            return (
              <div
                key={feature.title}
                className={`group relative rounded-2xl border ${colors.border} ${colors.hoverBorder} bg-white p-10 transition-all duration-200 hover:shadow-lg hover:shadow-gray-200/50 hover:-translate-y-0.5`}
              >
                <div
                  className={`mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl ${colors.iconBg}`}
                >
                  <feature.icon className={`h-7 w-7 ${colors.icon}`} />
                </div>
                <h3 className="mb-3 text-xl font-semibold text-gray-900">
                  {feature.title}
                </h3>
                <p className="text-base leading-relaxed text-gray-500">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function BeforeAfterSection() {
  const beforeItems = [
    "Carnet papier",
    "Certificats a la main",
    "Factures oubliees",
    "Clients perdus",
    "Pas d'avis Google",
  ];

  const afterItems = [
    "Certificats en 30 secondes",
    "Factures automatiques",
    "Rappels par email",
    "Clients fideles",
    "Avis Google en un clic",
  ];

  return (
    <section className="bg-gradient-to-b from-slate-50 to-white py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6">
        {/* Section header */}
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">
            Avant / Apres
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-gray-500">
            Ce qui change quand vous passez a Bistry.
          </p>
        </div>

        {/* Two columns */}
        <div className="mx-auto mt-16 grid max-w-4xl gap-8 lg:mt-20 lg:grid-cols-2">
          {/* Before */}
          <div className="rounded-2xl border border-red-100 bg-gradient-to-b from-red-50/80 to-slate-50 p-8 sm:p-10">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-red-100 px-4 py-1.5 text-sm font-semibold text-red-700">
              <X className="h-4 w-4" />
              Avant Bistry
            </div>
            <ul className="space-y-4">
              {beforeItems.map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-100">
                    <X className="h-3.5 w-3.5 text-red-500" />
                  </div>
                  <span className="text-base text-gray-700">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* After */}
          <div className="rounded-2xl border border-green-100 bg-gradient-to-b from-green-50/80 to-blue-50/50 p-8 sm:p-10">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-green-100 px-4 py-1.5 text-sm font-semibold text-green-700">
              <Check className="h-4 w-4" />
              Avec Bistry
            </div>
            <ul className="space-y-4">
              {afterItems.map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-100">
                    <Check className="h-3.5 w-3.5 text-green-600" />
                  </div>
                  <span className="text-base text-gray-700">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

const essentialFeatures = [
  "1 utilisateur inclus",
  "Fiches clients",
  "Certificats de ramonage PDF",
  "Facturation & devis",
  "Rappels annuels automatiques",
];

const proFeatures = [
  "Tout Essentiel, plus :",
  "Site vitrine personnalise",
  "Avis Google automatiques",
  "Statistiques avancees",
];

const boostFeatures = [
  "Tout Pro, plus :",
  "Photos Google My Business",
  "Setup Google My Business inclus",
  "Support prioritaire",
];

function PricingSection() {
  return (
    <section id="tarifs" className="bg-white py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6">
        {/* Section header */}
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-amber-50 px-4 py-1.5 text-sm font-medium text-amber-700">
            <Star className="h-4 w-4" />
            Tarifs
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">
            Simple et{" "}
            <span className="text-blue-600">sans surprise</span>
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-gray-500">
            Pas de frais caches. 14 jours d&apos;essai gratuit, sans carte bancaire.
          </p>
        </div>

        {/* Pricing cards */}
        <div className="mx-auto mt-16 grid max-w-6xl gap-8 lg:mt-20 lg:grid-cols-3">
          {/* Essentiel */}
          <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg shadow-slate-200/50">
            <div className="h-1.5 bg-gradient-to-r from-slate-400 to-slate-500" />
            <div className="p-8 sm:p-10">
              <div className="mb-8 text-center">
                <div className="mb-2 text-sm font-semibold tracking-wide text-slate-600 uppercase">
                  Essentiel
                </div>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-5xl font-extrabold tracking-tight text-gray-900">
                    29
                  </span>
                  <span className="text-xl font-semibold text-gray-400">
                    &euro;
                  </span>
                  <span className="ml-1 text-lg text-gray-400">/mois</span>
                </div>
              </div>

              <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

              <ul className="mt-8 space-y-4">
                {essentialFeatures.map((feat) => (
                  <li key={feat} className="flex items-center gap-3">
                    <div className="flex h-5.5 w-5.5 shrink-0 items-center justify-center rounded-full bg-green-100">
                      <Check className="h-3.5 w-3.5 text-green-600" />
                    </div>
                    <span className="text-[15px] text-gray-700">{feat}</span>
                  </li>
                ))}
              </ul>

              <a
                href="/register"
                className="group mt-10 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-8 py-4 text-base font-semibold text-gray-900 shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50 hover:-translate-y-0.5"
              >
                Essai gratuit
                <ArrowRight className="h-4.5 w-4.5 transition-transform group-hover:translate-x-0.5" />
              </a>
            </div>
          </div>

          {/* Pro — Populaire */}
          <div className="relative overflow-hidden rounded-3xl border-2 border-blue-500 bg-white shadow-xl shadow-blue-200/40">
            {/* Badge */}
            <div className="absolute top-0 right-0 rounded-bl-2xl bg-blue-600 px-4 py-1.5 text-xs font-bold tracking-wide text-white uppercase">
              Populaire
            </div>
            <div className="h-1.5 bg-gradient-to-r from-blue-500 via-blue-600 to-cyan-500" />
            <div className="p-8 sm:p-10">
              <div className="mb-8 text-center">
                <div className="mb-2 text-sm font-semibold tracking-wide text-blue-600 uppercase">
                  Pro
                </div>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-5xl font-extrabold tracking-tight text-gray-900">
                    49
                  </span>
                  <span className="text-xl font-semibold text-gray-400">
                    &euro;
                  </span>
                  <span className="ml-1 text-lg text-gray-400">/mois</span>
                </div>
              </div>

              <div className="h-px bg-gradient-to-r from-transparent via-blue-200 to-transparent" />

              <ul className="mt-8 space-y-4">
                {proFeatures.map((feat, i) => (
                  <li key={feat} className="flex items-center gap-3">
                    {i === 0 ? (
                      <div className="flex h-5.5 w-5.5 shrink-0 items-center justify-center rounded-full bg-blue-100">
                        <Check className="h-3.5 w-3.5 text-blue-600" />
                      </div>
                    ) : (
                      <div className="flex h-5.5 w-5.5 shrink-0 items-center justify-center rounded-full bg-green-100">
                        <Check className="h-3.5 w-3.5 text-green-600" />
                      </div>
                    )}
                    <span
                      className={`text-[15px] ${i === 0 ? "font-medium text-blue-700" : "text-gray-700"}`}
                    >
                      {feat}
                    </span>
                  </li>
                ))}
              </ul>

              <a
                href="/register"
                className="group mt-10 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-blue-600/25 transition-all hover:from-blue-500 hover:to-blue-600 hover:shadow-blue-500/30 hover:-translate-y-0.5"
              >
                Essai gratuit
                <ArrowRight className="h-4.5 w-4.5 transition-transform group-hover:translate-x-0.5" />
              </a>
            </div>
          </div>

          {/* Boost */}
          <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg shadow-slate-200/50">
            <div className="h-1.5 bg-gradient-to-r from-purple-500 to-purple-600" />
            <div className="p-8 sm:p-10">
              <div className="mb-8 text-center">
                <div className="mb-2 text-sm font-semibold tracking-wide text-purple-600 uppercase">
                  Boost
                </div>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-5xl font-extrabold tracking-tight text-gray-900">
                    79
                  </span>
                  <span className="text-xl font-semibold text-gray-400">
                    &euro;
                  </span>
                  <span className="ml-1 text-lg text-gray-400">/mois</span>
                </div>
              </div>

              <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

              <ul className="mt-8 space-y-4">
                {boostFeatures.map((feat, i) => (
                  <li key={feat} className="flex items-center gap-3">
                    {i === 0 ? (
                      <div className="flex h-5.5 w-5.5 shrink-0 items-center justify-center rounded-full bg-purple-100">
                        <Check className="h-3.5 w-3.5 text-purple-600" />
                      </div>
                    ) : (
                      <div className="flex h-5.5 w-5.5 shrink-0 items-center justify-center rounded-full bg-green-100">
                        <Check className="h-3.5 w-3.5 text-green-600" />
                      </div>
                    )}
                    <span
                      className={`text-[15px] ${i === 0 ? "font-medium text-purple-700" : "text-gray-700"}`}
                    >
                      {feat}
                    </span>
                  </li>
                ))}
              </ul>

              <a
                href="/register"
                className="group mt-10 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-8 py-4 text-base font-semibold text-gray-900 shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50 hover:-translate-y-0.5"
              >
                Essai gratuit
                <ArrowRight className="h-4.5 w-4.5 transition-transform group-hover:translate-x-0.5" />
              </a>
            </div>
          </div>
        </div>

        {/* Extra seat note */}
        <p className="mt-10 text-center text-sm text-gray-500">
          Siege supplementaire : +19&euro;/mois par utilisateur
        </p>

        <p className="mt-3 text-center text-sm text-gray-400">
          14 jours d&apos;essai gratuit &middot; Aucune carte bancaire requise
        </p>
      </div>
    </section>
  );
}

const faqItems = [
  {
    question: "Est-ce que c'est complique a utiliser ?",
    answer:
      "Non, si vous savez utiliser un telephone, vous savez utiliser Bistry. L'interface est faite pour le terrain.",
  },
  {
    question: "Est-ce que le certificat est valable ?",
    answer:
      "Oui, conforme au decret 2023-641. Accepte par toutes les assurances.",
  },
  {
    question: "Je peux essayer sans payer ?",
    answer:
      "Oui, 14 jours gratuits, sans carte bancaire.",
  },
  {
    question: "Et si j'ai deja un carnet avec mes clients ?",
    answer:
      "On vous aide a tout importer. Envoyez-nous une photo de votre carnet.",
  },
  {
    question: "Je suis seul, c'est pas trop cher ?",
    answer:
      "Le plan Essentiel a 29\u20AC/mois, c'est moins qu'un plein de gazole.",
  },
];

function FaqSection() {
  return (
    <section id="faq" className="bg-gradient-to-b from-slate-50 to-white py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6">
        {/* Section header */}
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-1.5 text-sm font-medium text-blue-700">
            <ChevronRight className="h-4 w-4" />
            FAQ
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">
            Questions{" "}
            <span className="text-blue-600">frequentes</span>
          </h2>
        </div>

        {/* FAQ items */}
        <div className="mx-auto mt-16 max-w-3xl space-y-4 lg:mt-20">
          {faqItems.map((item) => (
            <details
              key={item.question}
              className="group rounded-2xl border border-slate-200 bg-white transition-all hover:shadow-md"
            >
              <summary className="flex cursor-pointer items-center justify-between px-8 py-6 text-base font-semibold text-gray-900 marker:[font-size:0] [&::-webkit-details-marker]:hidden">
                {item.question}
                <ChevronDown className="h-5 w-5 shrink-0 text-gray-400 transition-transform group-open:rotate-180" />
              </summary>
              <div className="px-8 pb-6 text-base leading-relaxed text-gray-500">
                {item.answer}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function CtaSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-[#0c2444] to-slate-900 py-24 lg:py-32">
      {/* Background decorations */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/2 left-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600/8 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-2 text-sm font-medium text-blue-300">
          <Flame className="h-4 w-4" />
          Rejoignez Bistry
        </div>
        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
          Passez au numerique{" "}
          <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
            des aujourd&apos;hui
          </span>
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-slate-300">
          Vous faites le ramonage, Bistry s&apos;occupe de la paperasse.
          14 jours gratuits, sans engagement.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <a
            href="/register"
            className="group inline-flex items-center gap-2.5 rounded-full bg-blue-600 px-8 py-4 text-base font-semibold text-white shadow-2xl shadow-blue-600/30 transition-all hover:bg-blue-500 hover:shadow-blue-500/40 hover:-translate-y-0.5"
          >
            Essai gratuit 14 jours
            <ArrowRight className="h-4.5 w-4.5 transition-transform group-hover:translate-x-0.5" />
          </a>
          <a
            href="/login"
            className="inline-flex items-center gap-2.5 rounded-full border border-white/20 bg-white/5 px-8 py-4 text-base font-semibold text-white backdrop-blur transition-all hover:border-white/30 hover:bg-white/10"
          >
            Se connecter
          </a>
        </div>
        <p className="mt-4 text-sm text-slate-400">
          Pas besoin de carte bancaire
        </p>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="flex flex-col items-start justify-between gap-10 lg:flex-row lg:items-center">
          {/* Brand */}
          <div>
            <a href="/landing" className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-700">
                <Flame className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight text-gray-900">
                Bistry
              </span>
            </a>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-gray-500">
              Le logiciel de gestion concu pour les ramoneurs professionnels.
              Certificats, factures, rappels — tout en un.
            </p>
            <div className="mt-4 flex flex-col gap-2">
              <a
                href="tel:04XXXXXXXX"
                className="flex items-center gap-2 text-sm text-gray-500 transition-colors hover:text-gray-900"
              >
                <Phone className="h-4 w-4" />
                04 XX XX XX XX
              </a>
              <a
                href="mailto:contact@bistry.fr"
                className="flex items-center gap-2 text-sm text-gray-500 transition-colors hover:text-gray-900"
              >
                <Mail className="h-4 w-4" />
                contact@bistry.fr
              </a>
            </div>
          </div>

          {/* Links */}
          <div className="flex flex-wrap gap-x-10 gap-y-4">
            <a
              href="#fonctionnalites"
              className="text-sm font-medium text-gray-500 transition-colors hover:text-gray-900"
            >
              Fonctionnalites
            </a>
            <a
              href="#tarifs"
              className="text-sm font-medium text-gray-500 transition-colors hover:text-gray-900"
            >
              Tarifs
            </a>
            <a
              href="#faq"
              className="text-sm font-medium text-gray-500 transition-colors hover:text-gray-900"
            >
              FAQ
            </a>
            <a
              href="/login"
              className="text-sm font-medium text-gray-500 transition-colors hover:text-gray-900"
            >
              Connexion
            </a>
            <a
              href="/register"
              className="text-sm font-medium text-gray-500 transition-colors hover:text-gray-900"
            >
              Inscription
            </a>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-slate-200 pt-8 sm:flex-row">
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
              className="text-sm text-gray-400 transition-colors hover:text-gray-600"
            >
              CGV
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <HeroSection />
      <SocialProofBar />
      <CertificateShowcase />
      <FeaturesSection />
      <BeforeAfterSection />
      <PricingSection />
      <FaqSection />
      <CtaSection />
      <Footer />
    </div>
  );
}
