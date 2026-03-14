"use client";

import { useEffect, useState } from "react";

export function CertificateAnimation() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setStep(1), 400),
      setTimeout(() => setStep(2), 1200),
      setTimeout(() => setStep(3), 2000),
      setTimeout(() => setStep(4), 2800),
      setTimeout(() => setStep(5), 3800),
      setTimeout(() => setStep(6), 4800),
      setTimeout(() => setStep(0), 9000),
    ];
    return () => timers.forEach(clearTimeout);
  }, [step === 0 ? step : null]);

  return (
    <div className="relative">
      <div className="absolute inset-0 -m-6 rounded-3xl bg-blue-400/8 blur-2xl" />

      <div className="relative mx-auto w-[320px] sm:w-[360px]">
        <div className="rounded-xl bg-white border border-gray-200 shadow-2xl overflow-hidden relative">
          {/* Notification — slides down from top of the certificate */}
          <div
            className="absolute top-0 left-3 right-3 z-30 transition-all duration-500 ease-out"
            style={{
              opacity: step >= 6 ? 1 : 0,
              transform: step >= 6 ? "translateY(8px)" : "translateY(-60px)",
            }}
          >
            <div className="bg-white/95 backdrop-blur-xl rounded-xl border border-gray-200 shadow-xl px-3 py-2.5 flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
              </div>
              <div className="min-w-0">
                <div className="text-[10px] font-bold text-gray-900">Certificat envoy&eacute;</div>
                <div className="text-[8px] text-gray-500 truncate">sophie.durand@gmail.com</div>
              </div>
              <div className="text-[8px] text-gray-400 flex-shrink-0">maintenant</div>
            </div>
          </div>

          {/* Accent bar */}
          <div className="h-1.5 bg-gradient-to-r from-[#0f2b46] to-blue-600" />

          <div className="px-5 pt-4 pb-3">
            {/* Title */}
            <div className="text-center mb-3">
              <div className="text-[13px] font-bold text-[#0f2b46] uppercase tracking-widest">Certificat de ramonage</div>
              <div className="w-8 h-0.5 bg-blue-600 mx-auto mt-1.5" />
              <div className="text-[8px] text-gray-400 mt-1">N° CERT-2026-0042 — 14/03/2026</div>
            </div>

            {/* Company */}
            <div className="flex items-center gap-2 mb-3">
              <img src="/logo-concept-2.svg" alt="" className="h-5 w-5 rounded" />
              <div>
                <div className="text-[9px] font-bold text-[#0f2b46]">Ramonage Martin SARL</div>
                <div className="text-[7px] text-gray-400">74000 Annecy — SIRET : 823 456 789 00012</div>
              </div>
            </div>

            {/* Client — step 1 */}
            <div
              className="border-l-2 border-gray-200 pl-3 mb-3 transition-all duration-500"
              style={{ opacity: step >= 1 ? 1 : 0, transform: step >= 1 ? "translateX(0)" : "translateX(-10px)" }}
            >
              <div className="text-[7px] text-gray-400 uppercase tracking-wider font-semibold">Client</div>
              <div className="text-[10px] font-bold text-gray-900">Sophie Durand</div>
              <div className="text-[8px] text-gray-500">42 chemin du Lac, 74940 Annecy-le-Vieux</div>
            </div>

            {/* Installation — step 2 */}
            <div
              className="grid grid-cols-2 gap-x-4 mb-3 transition-all duration-500"
              style={{ opacity: step >= 2 ? 1 : 0, transform: step >= 2 ? "translateX(0)" : "translateX(-10px)" }}
            >
              <div>
                <div className="text-[6.5px] text-gray-400 uppercase tracking-wider font-semibold">Type d&apos;appareil</div>
                <div className="text-[9px] font-semibold text-gray-900">Insert — Bois</div>
              </div>
              <div>
                <div className="text-[6.5px] text-gray-400 uppercase tracking-wider font-semibold">Conduit</div>
                <div className="text-[9px] font-semibold text-gray-900">Maçonné — Ø 200 mm</div>
              </div>
            </div>

            {/* Results — step 3 */}
            <div
              className="bg-gray-50 rounded-lg p-3 mb-3 transition-all duration-400"
              style={{ opacity: step >= 3 ? 1 : 0, transform: step >= 3 ? "scale(1)" : "scale(0.9)" }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[7px] text-gray-400 uppercase tracking-wider font-semibold">Vacuité du conduit</div>
                  <span className="inline-block mt-1 px-2.5 py-0.5 bg-emerald-50 text-emerald-700 text-[9px] font-extrabold rounded border border-emerald-200 transition-all duration-300" style={{ transform: step >= 3 ? "scale(1)" : "scale(0)", transitionDelay: "200ms" }}>CONFORME</span>
                </div>
                <div className="text-right">
                  <div className="text-[7px] text-gray-400 uppercase tracking-wider font-semibold">État général</div>
                  <span className="inline-block mt-1 px-2.5 py-0.5 bg-emerald-50 text-emerald-700 text-[9px] font-extrabold rounded border border-emerald-200 transition-all duration-300" style={{ transform: step >= 3 ? "scale(1)" : "scale(0)", transitionDelay: "400ms" }}>BON ÉTAT</span>
                </div>
              </div>
            </div>

            {/* Anomalies */}
            <div className="flex items-center gap-2 mb-3 pl-1" style={{ opacity: step >= 3 ? 1 : 0, transition: "opacity 0.3s", transitionDelay: "500ms" }}>
              <div className="h-4 w-4 rounded-full bg-emerald-50 flex items-center justify-center">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
              </div>
              <div className="text-[9px] font-semibold text-emerald-700">Aucune anomalie constatée</div>
            </div>

            {/* Signatures */}
            <div className="border-t border-gray-100 pt-3 transition-all duration-500" style={{ opacity: step >= 4 ? 1 : 0 }}>
              <div className="grid grid-cols-2 gap-4">
                {/* Pro signature */}
                <div className="text-center">
                  <div className="text-[7px] font-semibold text-gray-500 mb-1">Le professionnel</div>
                  <div className="h-12 border border-dashed border-gray-300 rounded bg-gray-50 flex items-center justify-center overflow-hidden">
                    <svg width="110" height="38" viewBox="0 0 110 38">
                      <path d="M6 30 C6 30, 8 6, 14 10 C18 13, 10 28, 14 24 L18 18" fill="none" stroke="#1a1a1a" strokeWidth="1.2" strokeLinecap="round" strokeDasharray="70" strokeDashoffset={step >= 4 ? 0 : 70} style={{ transition: "stroke-dashoffset 0.5s ease-out" }} />
                      <path d="M18 18 C22 8, 28 6, 30 14 C32 20, 26 24, 32 18 L38 10 C42 4, 44 16, 48 12 C52 8, 50 20, 56 14" fill="none" stroke="#1a1a1a" strokeWidth="1.2" strokeLinecap="round" strokeDasharray="120" strokeDashoffset={step >= 4 ? 0 : 120} style={{ transition: "stroke-dashoffset 0.7s ease-out 0.3s" }} />
                      <path d="M54 16 C58 10, 62 8, 66 14 C68 18, 64 22, 70 16 C74 10, 78 8, 84 14 C88 18, 86 22, 92 16 L98 12" fill="none" stroke="#1a1a1a" strokeWidth="1" strokeLinecap="round" strokeDasharray="100" strokeDashoffset={step >= 4 ? 0 : 100} style={{ transition: "stroke-dashoffset 0.6s ease-out 0.6s" }} />
                      <path d="M10 34 Q40 36, 70 33 Q85 32, 100 34" fill="none" stroke="#1a1a1a" strokeWidth="0.7" strokeLinecap="round" strokeDasharray="95" strokeDashoffset={step >= 4 ? 0 : 95} style={{ transition: "stroke-dashoffset 0.3s ease-out 0.9s" }} />
                    </svg>
                  </div>
                  <div className="text-[7px] text-gray-400 mt-0.5">J-P. Martin</div>
                </div>

                {/* Client signature */}
                <div className="text-center">
                  <div className="text-[7px] font-semibold text-gray-500 mb-1">Le client</div>
                  <div className="h-12 border border-dashed border-gray-300 rounded bg-gray-50 flex items-center justify-center overflow-hidden">
                    <svg width="110" height="38" viewBox="0 0 110 38">
                      <path d="M12 22 C12 14, 20 8, 22 16 C24 24, 16 28, 20 20 C24 12, 28 8, 26 18" fill="none" stroke="#1a1a1a" strokeWidth="1.3" strokeLinecap="round" strokeDasharray="80" strokeDashoffset={step >= 5 ? 0 : 80} style={{ transition: "stroke-dashoffset 0.5s ease-out" }} />
                      <path d="M30 12 C30 12, 32 8, 32 20 M34 16 C38 10, 42 8, 44 16 C46 22, 40 24, 46 18 C50 12, 54 10, 56 18 C58 24, 54 26, 60 18 C64 10, 68 12, 70 18" fill="none" stroke="#1a1a1a" strokeWidth="1.1" strokeLinecap="round" strokeDasharray="140" strokeDashoffset={step >= 5 ? 0 : 140} style={{ transition: "stroke-dashoffset 0.7s ease-out 0.2s" }} />
                      <path d="M68 20 C72 14, 76 10, 80 16 C82 20, 78 24, 84 16 L90 10 C92 8, 96 14, 98 18" fill="none" stroke="#1a1a1a" strokeWidth="1" strokeLinecap="round" strokeDasharray="70" strokeDashoffset={step >= 5 ? 0 : 70} style={{ transition: "stroke-dashoffset 0.5s ease-out 0.5s" }} />
                    </svg>
                  </div>
                  <div className="text-[7px] text-gray-400 mt-0.5">S. Durand</div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 border-t border-gray-100 px-5 py-1.5 text-center">
            <div className="text-[6.5px] text-gray-400">Décret n°2023-641 — Généré avec Bistry</div>
          </div>
        </div>
      </div>
    </div>
  );
}
