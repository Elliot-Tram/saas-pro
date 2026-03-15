import { getSession } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getSession();
  if (!session || session.email !== process.env.ADMIN_EMAIL) {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  }

  const csv = `Entreprise;Téléphone;Email;Adresse;Ville;Code postal;Google Maps;Site web
Ramonage Dupont;06 12 34 56 78;contact@dupont.fr;12 rue des Lilas;Lille;59000;https://maps.google.com/...;https://dupont-ramonage.fr`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": "attachment; filename=prospects-template.csv",
    },
  });
}
