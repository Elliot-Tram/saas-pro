import {
  ClipboardCheck,
  Calendar,
  FileText,
  Users,
  Shield,
  Smartphone,
  ArrowRight,
  Check,
  Flame,
  ChevronRight,
  Star,
  Zap,
} from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bistry — Le logiciel n°1 des ramoneurs professionnels",
  description:
    "Certificats, factures, planning, clients — tout votre métier de ramoneur dans un seul outil. Conforme au décret 2023-641.",
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
            href="#comment-ca-marche"
            className="text-sm font-medium text-slate-300 transition-colors hover:text-white"
          >
            Comment ca marche
          </a>
          <a
            href="#tarifs"
            className="text-sm font-medium text-slate-300 transition-colors hover:text-white"
          >
            Tarifs
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
            Essayer gratuitement
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
        <a
          href="/register"
          className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white md:hidden"
        >
          Essayer
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
        <h1 className="mx-auto max-w-4xl text-4xl leading-tight font-extrabold tracking-tight text-white sm:text-5xl lg:text-7xl lg:leading-[1.1]">
          Le logiciel n°1 des{" "}
          <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
            ramoneurs professionnels
          </span>
        </h1>

        {/* Subheadline */}
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-300 sm:text-xl">
          Certificats, factures, planning, clients — tout votre metier dans un
          seul outil. Gagnez du temps et restez conforme.
        </p>

        {/* CTAs */}
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <a
            href="/register"
            className="group inline-flex items-center gap-2.5 rounded-full bg-blue-600 px-8 py-4 text-base font-semibold text-white shadow-2xl shadow-blue-600/30 transition-all hover:bg-blue-500 hover:shadow-blue-500/40 hover:-translate-y-0.5"
          >
            Essayer gratuitement
            <ArrowRight className="h-4.5 w-4.5 transition-transform group-hover:translate-x-0.5" />
          </a>
          <a
            href="#comment-ca-marche"
            className="inline-flex items-center gap-2.5 rounded-full border border-white/20 bg-white/5 px-8 py-4 text-base font-semibold text-white backdrop-blur transition-all hover:border-white/30 hover:bg-white/10"
          >
            Voir la demo
            <ChevronRight className="h-4.5 w-4.5" />
          </a>
        </div>

        {/* Hero visual — mockup placeholder */}
        <div className="relative mx-auto mt-16 max-w-5xl lg:mt-20">
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-slate-800 to-slate-900 shadow-2xl shadow-black/50">
            <div className="flex items-center gap-2 border-b border-white/5 bg-slate-800/80 px-5 py-3.5">
              <div className="h-3 w-3 rounded-full bg-red-400/60" />
              <div className="h-3 w-3 rounded-full bg-yellow-400/60" />
              <div className="h-3 w-3 rounded-full bg-green-400/60" />
              <div className="ml-4 h-5 w-64 rounded bg-white/5" />
            </div>
            <div className="grid grid-cols-12 gap-0">
              {/* Sidebar mock */}
              <div className="col-span-3 hidden border-r border-white/5 p-5 md:block">
                <div className="mb-6 flex items-center gap-2">
                  <div className="h-7 w-7 rounded-lg bg-blue-600/30" />
                  <div className="h-3 w-16 rounded bg-white/10" />
                </div>
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className={`mb-2 flex items-center gap-2.5 rounded-lg px-3 py-2.5 ${
                      i === 0 ? "bg-blue-600/15" : ""
                    }`}
                  >
                    <div
                      className={`h-4 w-4 rounded ${i === 0 ? "bg-blue-400/40" : "bg-white/8"}`}
                    />
                    <div
                      className={`h-2.5 rounded ${i === 0 ? "w-20 bg-blue-400/30" : "bg-white/8"} ${
                        i === 1
                          ? "w-24"
                          : i === 2
                            ? "w-16"
                            : i === 3
                              ? "w-20"
                              : i === 4
                                ? "w-28"
                                : "w-18"
                      }`}
                    />
                  </div>
                ))}
              </div>

              {/* Main content mock */}
              <div className="col-span-12 p-6 md:col-span-9 md:p-8">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <div className="mb-2 h-5 w-48 rounded bg-white/12" />
                    <div className="h-3 w-32 rounded bg-white/6" />
                  </div>
                  <div className="h-9 w-36 rounded-lg bg-blue-600/30" />
                </div>
                {/* Stats cards */}
                <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
                  {[
                    "bg-blue-500/10",
                    "bg-green-500/10",
                    "bg-purple-500/10",
                    "bg-amber-500/10",
                  ].map((bg, i) => (
                    <div
                      key={i}
                      className={`rounded-xl ${bg} border border-white/5 p-4`}
                    >
                      <div className="mb-2 h-3 w-12 rounded bg-white/8" />
                      <div className="h-6 w-16 rounded bg-white/15" />
                    </div>
                  ))}
                </div>
                {/* Table mock */}
                <div className="rounded-xl border border-white/5 bg-white/[0.02]">
                  <div className="flex items-center gap-4 border-b border-white/5 px-5 py-3">
                    {["w-32", "w-24", "w-20", "w-28", "w-16"].map((w, i) => (
                      <div
                        key={i}
                        className={`h-2.5 ${w} rounded bg-white/8`}
                      />
                    ))}
                  </div>
                  {[...Array(4)].map((_, row) => (
                    <div
                      key={row}
                      className="flex items-center gap-4 border-b border-white/[0.03] px-5 py-3.5 last:border-0"
                    >
                      {["w-32", "w-24", "w-20", "w-28", "w-16"].map((w, i) => (
                        <div
                          key={i}
                          className={`h-2.5 ${w} rounded bg-white/5`}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Glow effect */}
          <div className="pointer-events-none absolute -inset-4 rounded-3xl bg-gradient-to-b from-blue-600/5 via-transparent to-transparent" />
        </div>
      </div>
    </section>
  );
}

function SocialProofBar() {
  return (
    <section className="border-y border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-7xl px-6 py-6">
        <div className="flex flex-col items-center justify-center gap-6 sm:flex-row sm:gap-12">
          <div className="flex items-center gap-2.5 text-sm font-medium text-slate-700">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
              <Shield className="h-4 w-4 text-green-600" />
            </div>
            Conforme au decret 2023-641
          </div>
          <div className="hidden h-5 w-px bg-slate-300 sm:block" />
          <div className="flex items-center gap-2.5 text-sm font-medium text-slate-700">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
              <ClipboardCheck className="h-4 w-4 text-blue-600" />
            </div>
            Certificats officiels
          </div>
          <div className="hidden h-5 w-px bg-slate-300 sm:block" />
          <div className="flex items-center gap-2.5 text-sm font-medium text-slate-700">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100">
              <FileText className="h-4 w-4 text-purple-600" />
            </div>
            Signature electronique
          </div>
          <div className="hidden h-5 w-px bg-slate-300 sm:block" />
          <div className="flex items-center gap-2.5 text-sm font-medium text-slate-700">
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className="h-4 w-4 fill-amber-400 text-amber-400"
                />
              ))}
            </div>
            4.9/5 satisfaction
          </div>
        </div>
      </div>
    </section>
  );
}

const features = [
  {
    icon: ClipboardCheck,
    title: "Certificats de ramonage",
    description:
      "Certificats conformes au decret 2023-641, personnalisables avec votre logo et signature electronique.",
    color: "blue" as const,
  },
  {
    icon: Calendar,
    title: "Planning & Secteurs",
    description:
      "Organisez vos tournees par zone geographique. Vue \"Ma journee\" pour ne rien oublier.",
    color: "purple" as const,
  },
  {
    icon: FileText,
    title: "Facturation",
    description:
      "Devis, factures, relances automatiques. Export comptable en un clic.",
    color: "green" as const,
  },
  {
    icon: Users,
    title: "Gestion clients",
    description:
      "Fiches clients completes avec historique, type de cheminee, rappels annuels.",
    color: "amber" as const,
  },
  {
    icon: Shield,
    title: "Contrats d'entretien",
    description:
      "Gerez vos contrats annuels, suivez les visites realisees et les echeances.",
    color: "rose" as const,
  },
  {
    icon: Smartphone,
    title: "Mobile & Tablette",
    description:
      "Interface adaptee mobile et tablette. Utilisable directement chez le client.",
    color: "cyan" as const,
  },
];

const colorMap = {
  blue: {
    bg: "bg-blue-50",
    iconBg: "bg-blue-100",
    icon: "text-blue-600",
    border: "border-blue-100",
    hoverBorder: "hover:border-blue-200",
  },
  purple: {
    bg: "bg-purple-50",
    iconBg: "bg-purple-100",
    icon: "text-purple-600",
    border: "border-purple-100",
    hoverBorder: "hover:border-purple-200",
  },
  green: {
    bg: "bg-green-50",
    iconBg: "bg-green-100",
    icon: "text-green-600",
    border: "border-green-100",
    hoverBorder: "hover:border-green-200",
  },
  amber: {
    bg: "bg-amber-50",
    iconBg: "bg-amber-100",
    icon: "text-amber-600",
    border: "border-amber-100",
    hoverBorder: "hover:border-amber-200",
  },
  rose: {
    bg: "bg-rose-50",
    iconBg: "bg-rose-100",
    icon: "text-rose-600",
    border: "border-rose-100",
    hoverBorder: "hover:border-rose-200",
  },
  cyan: {
    bg: "bg-cyan-50",
    iconBg: "bg-cyan-100",
    icon: "text-cyan-600",
    border: "border-cyan-100",
    hoverBorder: "hover:border-cyan-200",
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
            Chaque fonctionnalite a ete concue avec des ramoneurs, pour des
            ramoneurs. Simplifiez votre quotidien.
          </p>
        </div>

        {/* Features grid */}
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:mt-20">
          {features.map((feature) => {
            const colors = colorMap[feature.color];
            return (
              <div
                key={feature.title}
                className={`group relative rounded-2xl border ${colors.border} ${colors.hoverBorder} bg-white p-8 transition-all duration-200 hover:shadow-lg hover:shadow-gray-200/50 hover:-translate-y-0.5`}
              >
                <div
                  className={`mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl ${colors.iconBg}`}
                >
                  <feature.icon className={`h-6 w-6 ${colors.icon}`} />
                </div>
                <h3 className="mb-2.5 text-lg font-semibold text-gray-900">
                  {feature.title}
                </h3>
                <p className="text-[15px] leading-relaxed text-gray-500">
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

const steps = [
  {
    number: "1",
    title: "Creez votre compte",
    description:
      "30 secondes, aucune carte bancaire requise. Commencez immediatement.",
    icon: Zap,
  },
  {
    number: "2",
    title: "Ajoutez vos clients",
    description:
      "Importez votre fichier existant ou creez vos fiches clients une a une.",
    icon: Users,
  },
  {
    number: "3",
    title: "Travaillez sereinement",
    description:
      "Certificats, factures, planning — tout est automatise et conforme.",
    icon: Check,
  },
];

function HowItWorksSection() {
  return (
    <section
      id="comment-ca-marche"
      className="bg-gradient-to-b from-slate-50 to-white py-24 lg:py-32"
    >
      <div className="mx-auto max-w-7xl px-6">
        {/* Section header */}
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-green-50 px-4 py-1.5 text-sm font-medium text-green-700">
            <ArrowRight className="h-4 w-4" />
            Simple comme bonjour
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">
            Pret en{" "}
            <span className="text-blue-600">3 etapes</span>
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-gray-500">
            Pas de formation necessaire. Si vous savez utiliser un smartphone,
            vous savez utiliser Bistry.
          </p>
        </div>

        {/* Steps */}
        <div className="relative mx-auto mt-16 max-w-4xl lg:mt-20">
          {/* Connector line */}
          <div className="absolute top-16 right-16 left-16 hidden h-0.5 bg-gradient-to-r from-blue-200 via-blue-300 to-blue-200 lg:block" />

          <div className="grid gap-8 lg:grid-cols-3 lg:gap-12">
            {steps.map((step) => (
              <div
                key={step.number}
                className="relative flex flex-col items-center text-center"
              >
                {/* Step number */}
                <div className="relative mb-6">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 text-2xl font-bold text-white shadow-xl shadow-blue-600/25">
                    {step.number}
                  </div>
                  <div className="absolute -inset-2 rounded-3xl bg-blue-100/50" style={{ zIndex: -1 }} />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-gray-900">
                  {step.title}
                </h3>
                <p className="text-[15px] leading-relaxed text-gray-500">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

const planFeatures = [
  "Clients illimites",
  "Certificats illimites",
  "Facturation & devis",
  "Planning & secteurs",
  "Rappels automatiques",
  "Export comptable",
  "Contrats d'entretien",
  "Support email prioritaire",
  "Mises a jour incluses",
];

function PricingSection() {
  return (
    <section id="tarifs" className="bg-white py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6">
        {/* Section header */}
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-amber-50 px-4 py-1.5 text-sm font-medium text-amber-700">
            <Star className="h-4 w-4" />
            Tarif simple
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">
            Un seul tarif,{" "}
            <span className="text-blue-600">tout inclus</span>
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-gray-500">
            Pas de surprise, pas de frais caches. Tout est inclus dans votre
            abonnement.
          </p>
        </div>

        {/* Pricing card */}
        <div className="mx-auto mt-16 max-w-lg lg:mt-20">
          <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/50">
            {/* Top accent */}
            <div className="h-1.5 bg-gradient-to-r from-blue-500 via-blue-600 to-cyan-500" />

            <div className="p-10 sm:p-12">
              {/* Plan name */}
              <div className="mb-8 text-center">
                <div className="mb-2 text-sm font-semibold tracking-wide text-blue-600 uppercase">
                  Professionnel
                </div>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-6xl font-extrabold tracking-tight text-gray-900">
                    29
                  </span>
                  <span className="text-2xl font-semibold text-gray-400">
                    &euro;
                  </span>
                  <span className="ml-1 text-lg text-gray-400">/mois</span>
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  par utilisateur, sans engagement
                </p>
              </div>

              {/* Divider */}
              <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

              {/* Features list */}
              <ul className="mt-8 space-y-4">
                {planFeatures.map((feat) => (
                  <li key={feat} className="flex items-center gap-3">
                    <div className="flex h-5.5 w-5.5 shrink-0 items-center justify-center rounded-full bg-green-100">
                      <Check className="h-3.5 w-3.5 text-green-600" />
                    </div>
                    <span className="text-[15px] text-gray-700">{feat}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <a
                href="/register"
                className="group mt-10 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-blue-600/25 transition-all hover:from-blue-500 hover:to-blue-600 hover:shadow-blue-500/30 hover:-translate-y-0.5"
              >
                Commencer maintenant
                <ArrowRight className="h-4.5 w-4.5 transition-transform group-hover:translate-x-0.5" />
              </a>

              <p className="mt-4 text-center text-sm text-gray-400">
                30 jours d&apos;essai gratuit &middot; Aucune carte bancaire
                requise
              </p>
            </div>
          </div>
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
          Simplifiez votre activite de ramoneur{" "}
          <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
            des aujourd&apos;hui
          </span>
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-slate-300">
          Rejoignez les professionnels qui font confiance a Bistry pour gerer
          leur activite au quotidien.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <a
            href="/register"
            className="group inline-flex items-center gap-2.5 rounded-full bg-blue-600 px-8 py-4 text-base font-semibold text-white shadow-2xl shadow-blue-600/30 transition-all hover:bg-blue-500 hover:shadow-blue-500/40 hover:-translate-y-0.5"
          >
            Essayer gratuitement
            <ArrowRight className="h-4.5 w-4.5 transition-transform group-hover:translate-x-0.5" />
          </a>
          <a
            href="/login"
            className="inline-flex items-center gap-2.5 rounded-full border border-white/20 bg-white/5 px-8 py-4 text-base font-semibold text-white backdrop-blur transition-all hover:border-white/30 hover:bg-white/10"
          >
            Se connecter
          </a>
        </div>
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
              Certificats, factures, planning — tout en un.
            </p>
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
              href="#"
              className="text-sm text-gray-400 transition-colors hover:text-gray-600"
            >
              Mentions legales
            </a>
            <a
              href="#"
              className="text-sm text-gray-400 transition-colors hover:text-gray-600"
            >
              Confidentialite
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
      <FeaturesSection />
      <HowItWorksSection />
      <PricingSection />
      <CtaSection />
      <Footer />
    </div>
  );
}
