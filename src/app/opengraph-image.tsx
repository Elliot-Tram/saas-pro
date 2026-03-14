import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Bistry — Logiciel de gestion pour ramoneurs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background:
            "linear-gradient(135deg, #0f172a 0%, #0f2b46 50%, #1e3a5f 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui",
        }}
      >
        <div
          style={{
            fontSize: 72,
            fontWeight: 800,
            color: "white",
            marginBottom: 20,
            letterSpacing: "-0.02em",
          }}
        >
          Bistry
        </div>
        <div
          style={{
            fontSize: 32,
            color: "#94a3b8",
            textAlign: "center",
            maxWidth: 800,
            lineHeight: 1.4,
          }}
        >
          Le logiciel des ramoneurs professionnels
        </div>
        <div
          style={{
            display: "flex",
            gap: 16,
            marginTop: 40,
          }}
        >
          <div
            style={{
              background: "#059669",
              color: "white",
              padding: "8px 24px",
              borderRadius: 8,
              fontSize: 20,
              fontWeight: 700,
            }}
          >
            Certificats
          </div>
          <div
            style={{
              background: "#2563eb",
              color: "white",
              padding: "8px 24px",
              borderRadius: 8,
              fontSize: 20,
              fontWeight: 700,
            }}
          >
            Factures
          </div>
          <div
            style={{
              background: "#d97706",
              color: "white",
              padding: "8px 24px",
              borderRadius: 8,
              fontSize: 20,
              fontWeight: 700,
            }}
          >
            Planning
          </div>
        </div>
        <div
          style={{
            fontSize: 18,
            color: "#64748b",
            marginTop: 30,
          }}
        >
          bistry.fr — Essai gratuit 14 jours
        </div>
      </div>
    ),
    { ...size }
  );
}
