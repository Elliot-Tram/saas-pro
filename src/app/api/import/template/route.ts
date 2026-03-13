import { NextResponse } from "next/server";

export async function GET() {
  const BOM = "\uFEFF";
  const csv = `Prénom;Nom;Email;Téléphone;Adresse;Ville;Code postal;Secteur;Type cheminée;Combustible;Notes
Jean;Dupont;jean@exemple.fr;06 12 34 56 78;12 rue des Lilas;Annecy;74000;Annecy Nord;Insert;Bois;Client fidèle
Marie;Martin;marie@exemple.fr;06 98 76 54 32;5 avenue du Lac;Thônes;74230;Thônes;Poêle à bois;Bois;`;

  return new NextResponse(BOM + csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="modele-import-bistry.csv"',
    },
  });
}
