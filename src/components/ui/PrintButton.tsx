"use client";

export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      style={{
        background: "#2563eb",
        color: "white",
        border: "none",
        padding: "8px 24px",
        borderRadius: "8px",
        fontSize: "14px",
        fontWeight: 600,
        cursor: "pointer",
      }}
    >
      Imprimer / Sauvegarder PDF
    </button>
  );
}
