"use server";

import { prisma } from "@/lib/db";
import { getSession, hashPassword } from "@/lib/auth";

export async function createProspectAccount(
  _prevState: unknown,
  formData: FormData
) {
  const session = await getSession();
  if (!session || session.email !== process.env.ADMIN_EMAIL) {
    return { error: "Accès non autorisé" };
  }

  const company = formData.get("company") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const phone = formData.get("phone") as string;
  const address = formData.get("address") as string;
  const city = formData.get("city") as string;
  const postalCode = formData.get("postalCode") as string;
  const siret = formData.get("siret") as string;
  const logo = formData.get("logo") as string;
  const seedDemo = formData.get("seedDemo") === "on";

  if (!company || !email || !password) {
    return { error: "Nom de l'entreprise, email et mot de passe sont requis" };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "Un compte existe déjà avec cet email" };
  }

  const hashedPassword = await hashPassword(password);

  await prisma.$transaction(async (tx) => {
    const team = await tx.team.create({
      data: {
        name: company,
        company,
        phone: phone || null,
        address: address || null,
        city: city || null,
        postalCode: postalCode || null,
        siret: siret || null,
        logo: logo || null,
        source: "prospect",
      },
    });

    const user = await tx.user.create({
      data: {
        name: company,
        email,
        password: hashedPassword,
        role: "admin",
        teamId: team.id,
      },
    });

    // Seed demo data if requested
    if (seedDemo) {
      const clientCity = city || "Paris";

      const client1 = await tx.client.create({
        data: {
          firstName: "Marie",
          lastName: "Dupont",
          email: "marie.dupont@exemple.fr",
          phone: "06 12 34 56 78",
          address: "12 rue des Lilas",
          city: clientCity,
          postalCode: "75001",
          chimneyType: "Insert",
          fuelType: "Bois",
          sector: clientCity,
          teamId: team.id,
        },
      });

      const client2 = await tx.client.create({
        data: {
          firstName: "Pierre",
          lastName: "Martin",
          phone: "06 98 76 54 32",
          address: "8 avenue de la Gare",
          city: clientCity,
          postalCode: "75002",
          chimneyType: "Poêle à bois",
          fuelType: "Bois",
          sector: clientCity,
          teamId: team.id,
        },
      });

      const client3 = await tx.client.create({
        data: {
          firstName: "Sophie",
          lastName: "Bernard",
          email: "sophie.bernard@exemple.fr",
          phone: "06 55 44 33 22",
          address: "3 place du Marché",
          city: clientCity,
          postalCode: "75003",
          chimneyType: "Foyer ouvert",
          fuelType: "Bois",
          sector: clientCity,
          teamId: team.id,
        },
      });

      // Create a sample certificate
      await tx.certificate.create({
        data: {
          number: "CERT-2026-0001",
          date: new Date(),
          clientQuality: "proprietaire",
          chimneyType: "Insert",
          chimneyLocation: "Salon, RDC",
          fuelType: "Bois",
          method: "mecanique_haut",
          conduitType: "Maçonné",
          conduitDiameter: "200 mm",
          conduitLength: "8 m",
          condition: "bon_etat",
          vacuumTest: true,
          observations: "Conduit en bon état général. Ramonage effectué sans difficulté.",
          recommendations: "Maintenir la fréquence de ramonage annuelle.",
          periodicity: "annuel",
          nextVisit: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          clientId: client1.id,
          teamId: team.id,
        },
      });

      // Create a sample invoice
      const invoice = await tx.invoice.create({
        data: {
          number: "FAC-2026-0001",
          status: "paid",
          date: new Date(),
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          subtotal: 75,
          taxRate: 20,
          tax: 15,
          total: 90,
          clientId: client1.id,
          teamId: team.id,
        },
      });

      await tx.invoiceItem.create({
        data: {
          description: "Ramonage insert bois + certificat",
          quantity: 1,
          unitPrice: 75,
          total: 75,
          invoiceId: invoice.id,
        },
      });

      // Create a scheduled appointment for today
      const now = new Date();
      const todayAt10 = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 10, 0);
      const todayAt11 = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 11, 0);

      await tx.appointment.create({
        data: {
          title: "Ramonage annuel",
          description: "Insert bois, conduit maçonné",
          date: todayAt10,
          endDate: todayAt11,
          status: "scheduled",
          clientId: client2.id,
          assignedToId: user.id,
          teamId: team.id,
        },
      });

      // Create another appointment tomorrow
      const tomorrowAt9 = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 9, 0);
      const tomorrowAt10 = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 10, 0);

      await tx.appointment.create({
        data: {
          title: "Ramonage foyer ouvert",
          date: tomorrowAt9,
          endDate: tomorrowAt10,
          status: "scheduled",
          clientId: client3.id,
          assignedToId: user.id,
          teamId: team.id,
        },
      });
    }
  });

  return {
    success: true,
    email,
    password,
    company,
    seeded: seedDemo,
  };
}
