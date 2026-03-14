import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Clean existing data
  await prisma.certificate.deleteMany();
  await prisma.invoiceItem.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.quoteItem.deleteMany();
  await prisma.quote.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.contract.deleteMany();
  await prisma.client.deleteMany();
  await prisma.user.deleteMany();
  await prisma.team.deleteMany();

  // Create team with company info
  const team = await prisma.team.create({
    data: {
      name: "Ramonage Martin",
      company: "Ramonage Martin SARL",
      phone: "06 12 34 56 78",
      siret: "823 456 789 00012",
      address: "15 rue des Artisans",
      city: "Annecy",
      postalCode: "74000",
      qualification: "Qualibat RGE — CTM Ramoneur",
      insurerName: "MAAF Pro",
      insuranceNumber: "RC-2024-887456",
    },
  });

  // Create admin user
  const password = await bcrypt.hash("demo1234", 12);
  const user = await prisma.user.create({
    data: {
      name: "Jean-Pierre Martin",
      email: "jp.martin@ramonage-martin.fr",
      password,
      role: "admin",
      teamId: team.id,
    },
  });

  // Create second team member
  const lucas = await prisma.user.create({
    data: {
      name: "Lucas Martin",
      email: "lucas@ramonage-martin.fr",
      password: await bcrypt.hash("demo1234", 12),
      role: "member",
      teamId: team.id,
    },
  });

  // Create clients
  const clients = await Promise.all([
    prisma.client.create({
      data: {
        firstName: "Sophie", lastName: "Durand",
        email: "sophie.durand@gmail.com", phone: "06 98 76 54 32",
        address: "42 chemin du Lac", city: "Annecy-le-Vieux", postalCode: "74940",
        sector: "Annecy",
        chimneyType: "Insert", fuelType: "Bois",
        lastVisit: new Date("2025-11-15"), nextReminder: new Date("2026-11-15"),
        notes: "Chien dans le jardin, sonner 2 fois. Accès par le côté gauche.",
        teamId: team.id,
      },
    }),
    prisma.client.create({
      data: {
        firstName: "Marc", lastName: "Lefebvre",
        email: "marc.lefebvre@orange.fr", phone: "04 50 12 34 56",
        address: "8 route de Thônes", city: "Alex", postalCode: "74290",
        sector: "Thônes / Talloires",
        chimneyType: "Poêle à bois", fuelType: "Bois",
        lastVisit: new Date("2025-03-20"), nextReminder: new Date("2026-03-20"),
        notes: "2 conduits à ramoner. Préfère les RDV le matin.",
        teamId: team.id,
      },
    }),
    prisma.client.create({
      data: {
        firstName: "Catherine", lastName: "Moreau",
        email: "c.moreau@free.fr", phone: "06 45 67 89 01",
        address: "3 place de la Mairie", city: "Talloires", postalCode: "74290",
        sector: "Thônes / Talloires",
        chimneyType: "Foyer ouvert", fuelType: "Bois",
        lastVisit: new Date("2025-01-10"),
        notes: "Maison ancienne, conduit maçonné. Attention aux tuiles fragiles.",
        teamId: team.id,
      },
    }),
    prisma.client.create({
      data: {
        firstName: "Pierre", lastName: "Bernard",
        phone: "06 11 22 33 44",
        address: "27 avenue de Genève", city: "Annemasse", postalCode: "74100",
        sector: "Annecy",
        chimneyType: "Poêle à granulés", fuelType: "Granulés",
        lastVisit: new Date("2026-01-08"), nextReminder: new Date("2027-01-08"),
        teamId: team.id,
      },
    }),
    prisma.client.create({
      data: {
        firstName: "Isabelle", lastName: "Petit",
        email: "isabelle.petit@laposte.net", phone: "06 55 44 33 22",
        address: "12 impasse des Sapins", city: "Cran-Gevrier", postalCode: "74960",
        sector: "Cran-Gevrier / Seynod",
        chimneyType: "Chaudière", fuelType: "Fioul",
        lastVisit: new Date("2025-09-22"), nextReminder: new Date("2026-09-22"),
        teamId: team.id,
      },
    }),
    prisma.client.create({
      data: {
        firstName: "François", lastName: "Rousseau",
        email: "f.rousseau@gmail.com", phone: "06 77 88 99 00",
        address: "5 rue du Mont-Blanc", city: "Chamonix", postalCode: "74400",
        sector: "Chamonix",
        chimneyType: "Insert", fuelType: "Bois",
        lastVisit: new Date("2024-12-05"),
        notes: "Chalet en altitude, accès difficile en hiver.",
        teamId: team.id,
      },
    }),
    prisma.client.create({
      data: {
        firstName: "Marie", lastName: "Girard",
        email: "marie.girard@hotmail.fr", phone: "06 33 22 11 00",
        address: "18 boulevard du Fier", city: "Annecy", postalCode: "74000",
        sector: "Cran-Gevrier / Seynod",
        chimneyType: "Poêle à bois", fuelType: "Bois",
        lastVisit: new Date("2026-02-20"), nextReminder: new Date("2027-02-20"),
        teamId: team.id,
      },
    }),
    prisma.client.create({
      data: {
        firstName: "Antoine", lastName: "Thomas",
        email: "a.thomas@proton.me", phone: "06 99 88 77 66",
        address: "2 chemin des Érables", city: "Seynod", postalCode: "74600",
        sector: "Seynod",
        chimneyType: "Foyer ouvert", fuelType: "Bois",
        teamId: team.id,
      },
    }),
    prisma.client.create({
      data: {
        firstName: "Nathalie", lastName: "Lambert",
        email: "n.lambert@gmail.com", phone: "04 50 98 76 54",
        address: "9 allée des Tilleuls", city: "Rumilly", postalCode: "74150",
        sector: "Rumilly",
        chimneyType: "Chaudière", fuelType: "Gaz",
        lastVisit: new Date("2025-06-15"), nextReminder: new Date("2026-06-15"),
        teamId: team.id,
      },
    }),
    prisma.client.create({
      data: {
        firstName: "Robert", lastName: "Dupuis",
        phone: "06 12 45 78 90",
        address: "34 route des Bauges", city: "Faverges", postalCode: "74210",
        sector: "Faverges",
        chimneyType: "Poêle à bois", fuelType: "Bois",
        lastVisit: new Date("2025-02-28"),
        notes: "Personne âgée, prévoir plus de temps.",
        teamId: team.id,
      },
    }),
  ]);

  const [sophie, marc, catherine, pierre, isabelle, francois, marie, antoine, nathalie, robert] = clients;

  // Create appointments — today + upcoming + past
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];

  await Promise.all([
    // Today's appointments (assigned to admin)
    prisma.appointment.create({
      data: {
        title: "Ramonage annuel",
        description: "Insert bois, conduit maçonné",
        date: new Date(`${todayStr}T08:30:00`),
        endDate: new Date(`${todayStr}T09:30:00`),
        status: "scheduled",
        clientId: sophie.id, assignedToId: user.id, teamId: team.id,
      },
    }),
    prisma.appointment.create({
      data: {
        title: "Ramonage + contrôle conduit",
        description: "2 conduits à vérifier",
        date: new Date(`${todayStr}T10:00:00`),
        endDate: new Date(`${todayStr}T11:30:00`),
        status: "scheduled",
        clientId: marc.id, assignedToId: user.id, teamId: team.id,
      },
    }),
    // Today's appointments (assigned to Lucas)
    prisma.appointment.create({
      data: {
        title: "Ramonage chaudière fioul",
        date: new Date(`${todayStr}T14:00:00`),
        endDate: new Date(`${todayStr}T15:00:00`),
        status: "scheduled",
        clientId: isabelle.id, assignedToId: lucas.id, teamId: team.id,
      },
    }),
    prisma.appointment.create({
      data: {
        title: "Diagnostic conduit",
        description: "Premier diagnostic, devis à établir",
        date: new Date(`${todayStr}T16:00:00`),
        endDate: new Date(`${todayStr}T16:45:00`),
        status: "scheduled",
        clientId: antoine.id, assignedToId: lucas.id, teamId: team.id,
      },
    }),
    // Upcoming (mix of admin and Lucas)
    prisma.appointment.create({
      data: {
        title: "Ramonage poêle à granulés",
        date: addDays(today, 2, 9, 0),
        endDate: addDays(today, 2, 10, 0),
        status: "scheduled",
        clientId: pierre.id, assignedToId: lucas.id, teamId: team.id,
      },
    }),
    prisma.appointment.create({
      data: {
        title: "Ramonage annuel",
        date: addDays(today, 3, 8, 30),
        endDate: addDays(today, 3, 9, 30),
        status: "scheduled",
        clientId: nathalie.id, assignedToId: user.id, teamId: team.id,
      },
    }),
    prisma.appointment.create({
      data: {
        title: "Ramonage chalet",
        description: "Accès par la route forestière",
        date: addDays(today, 5, 10, 0),
        endDate: addDays(today, 5, 12, 0),
        status: "scheduled",
        clientId: francois.id, assignedToId: user.id, teamId: team.id,
      },
    }),
    // Past completed
    prisma.appointment.create({
      data: {
        title: "Ramonage annuel",
        date: addDays(today, -5, 9, 0),
        endDate: addDays(today, -5, 10, 0),
        status: "completed",
        clientId: marie.id, assignedToId: lucas.id, teamId: team.id,
      },
    }),
    prisma.appointment.create({
      data: {
        title: "Ramonage + certificat",
        date: addDays(today, -12, 14, 0),
        endDate: addDays(today, -12, 15, 30),
        status: "completed",
        clientId: pierre.id, assignedToId: user.id, teamId: team.id,
      },
    }),
  ]);

  // Create invoices
  const inv1 = await prisma.invoice.create({
    data: {
      number: "FAC-2026-0001",
      status: "paid",
      date: new Date("2026-01-15"),
      dueDate: new Date("2026-02-15"),
      subtotal: 85, taxRate: 20, tax: 17, total: 102,
      clientId: pierre.id, teamId: team.id,
      items: {
        create: [
          { description: "Ramonage poêle à granulés", quantity: 1, unitPrice: 85, total: 85 },
        ],
      },
    },
  });

  const inv2 = await prisma.invoice.create({
    data: {
      number: "FAC-2026-0002",
      status: "paid",
      date: new Date("2026-02-05"),
      dueDate: new Date("2026-03-05"),
      subtotal: 150, taxRate: 20, tax: 30, total: 180,
      clientId: marc.id, teamId: team.id,
      items: {
        create: [
          { description: "Ramonage conduit n°1", quantity: 1, unitPrice: 75, total: 75 },
          { description: "Ramonage conduit n°2", quantity: 1, unitPrice: 75, total: 75 },
        ],
      },
    },
  });

  await prisma.invoice.create({
    data: {
      number: "FAC-2026-0003",
      status: "paid",
      date: new Date("2026-02-20"),
      dueDate: new Date("2026-03-20"),
      subtotal: 95, taxRate: 20, tax: 19, total: 114,
      clientId: marie.id, teamId: team.id,
      items: {
        create: [
          { description: "Ramonage poêle à bois", quantity: 1, unitPrice: 75, total: 75 },
          { description: "Certificat de ramonage", quantity: 1, unitPrice: 20, total: 20 },
        ],
      },
    },
  });

  // Overdue invoice
  await prisma.invoice.create({
    data: {
      number: "FAC-2026-0004",
      status: "sent",
      date: new Date("2026-01-20"),
      dueDate: new Date("2026-02-20"),
      subtotal: 120, taxRate: 20, tax: 24, total: 144,
      clientId: catherine.id, teamId: team.id,
      items: {
        create: [
          { description: "Ramonage foyer ouvert", quantity: 1, unitPrice: 90, total: 90 },
          { description: "Débistrage partiel", quantity: 1, unitPrice: 30, total: 30 },
        ],
      },
    },
  });

  // Recent sent invoice (not overdue)
  await prisma.invoice.create({
    data: {
      number: "FAC-2026-0005",
      status: "sent",
      date: new Date("2026-03-10"),
      dueDate: new Date("2026-04-10"),
      subtotal: 75, taxRate: 20, tax: 15, total: 90,
      clientId: sophie.id, teamId: team.id,
      items: {
        create: [
          { description: "Ramonage insert bois", quantity: 1, unitPrice: 75, total: 75 },
        ],
      },
    },
  });

  // Draft invoice
  await prisma.invoice.create({
    data: {
      number: "FAC-2026-0006",
      status: "draft",
      date: new Date("2026-03-12"),
      subtotal: 160, taxRate: 20, tax: 32, total: 192,
      clientId: francois.id, teamId: team.id,
      items: {
        create: [
          { description: "Ramonage insert", quantity: 1, unitPrice: 90, total: 90 },
          { description: "Remplacement chapeau de cheminée", quantity: 1, unitPrice: 70, total: 70 },
        ],
      },
    },
  });

  // Create quotes
  await prisma.quote.create({
    data: {
      number: "DEV-2026-0001",
      status: "accepted",
      date: new Date("2026-02-01"),
      validUntil: new Date("2026-03-01"),
      subtotal: 350, taxRate: 20, tax: 70, total: 420,
      clientId: francois.id, teamId: team.id,
      items: {
        create: [
          { description: "Ramonage complet chalet (2 conduits)", quantity: 1, unitPrice: 180, total: 180 },
          { description: "Remplacement chapeau inox", quantity: 1, unitPrice: 120, total: 120 },
          { description: "Déplacement zone montagne", quantity: 1, unitPrice: 50, total: 50 },
        ],
      },
    },
  });

  await prisma.quote.create({
    data: {
      number: "DEV-2026-0002",
      status: "sent",
      date: new Date("2026-03-08"),
      validUntil: new Date("2026-04-08"),
      subtotal: 95, taxRate: 20, tax: 19, total: 114,
      clientId: antoine.id, teamId: team.id,
      items: {
        create: [
          { description: "Ramonage foyer ouvert + certificat", quantity: 1, unitPrice: 95, total: 95 },
        ],
      },
    },
  });

  // Create certificates
  await prisma.certificate.create({
    data: {
      number: "CERT-2026-0001",
      date: new Date("2026-01-08"),
      clientQuality: "proprietaire",
      chimneyType: "Poêle à granulés",
      chimneyLocation: "Salon, RDC",
      fuelType: "Granulés",
      applianceBrand: "MCZ",
      applianceModel: "Ego 2.0",
      method: "mecanique_haut",
      conduitType: "Tubé inox",
      conduitDiameter: "80 mm",
      conduitLength: "6 m",
      condition: "bon_etat",
      vacuumTest: true,
      anomalies: undefined,
      observations: "Conduit en bon état général. Légère accumulation de suie, nettoyage effectué.",
      recommendations: "Maintenir la fréquence de ramonage annuelle.",
      periodicity: "annuel",
      nextVisit: new Date("2027-01-08"),
      clientId: pierre.id, teamId: team.id,
    },
  });

  await prisma.certificate.create({
    data: {
      number: "CERT-2026-0002",
      date: new Date("2026-02-20"),
      clientQuality: "proprietaire",
      chimneyType: "Poêle à bois",
      chimneyLocation: "Séjour, RDC",
      fuelType: "Bois",
      applianceBrand: "Invicta",
      applianceModel: "Chamane",
      method: "mecanique_haut",
      conduitType: "Tubé flexible",
      conduitDiameter: "150 mm",
      conduitLength: "9 m",
      condition: "bon_etat",
      vacuumTest: true,
      observations: "RAS. Conduit propre après intervention.",
      periodicity: "annuel",
      nextVisit: new Date("2027-02-20"),
      clientId: marie.id, teamId: team.id,
    },
  });

  await prisma.certificate.create({
    data: {
      number: "CERT-2026-0003",
      date: new Date("2026-02-05"),
      clientQuality: "proprietaire",
      chimneyType: "Insert",
      chimneyLocation: "Salon, 1er étage",
      fuelType: "Bois",
      method: "mecanique_bas",
      conduitType: "Maçonné",
      conduitDiameter: "200 mm",
      conduitLength: "12 m",
      condition: "a_surveiller",
      vacuumTest: true,
      anomalies: ["anomaly_bistre", "anomaly_etancheite"],
      observations: "Présence de bistre sur les 3 premiers mètres du conduit. Micro-fissures détectées au niveau de la traversée de plancher.",
      recommendations: "Prévoir un débistrage complet dans les 6 prochains mois. Surveiller l'étanchéité au prochain passage.",
      periodicity: "semestriel",
      nextVisit: new Date("2026-08-05"),
      clientId: marc.id, teamId: team.id,
    },
  });

  // Create contracts
  await prisma.contract.create({
    data: {
      number: "CTR-2026-0001",
      status: "active",
      startDate: new Date("2026-01-01"),
      endDate: new Date("2026-12-31"),
      amount: 150,
      description: "Contrat annuel — 2 passages (automne + printemps), ramonage + certificat inclus",
      autoRenew: true,
      visits: 2,
      visitsDone: 1,
      clientId: sophie.id, teamId: team.id,
    },
  });

  await prisma.contract.create({
    data: {
      number: "CTR-2026-0002",
      status: "active",
      startDate: new Date("2026-01-01"),
      endDate: new Date("2026-12-31"),
      amount: 180,
      description: "Contrat annuel — 2 conduits, 1 passage par an",
      autoRenew: true,
      visits: 1,
      visitsDone: 0,
      clientId: marc.id, teamId: team.id,
    },
  });

  await prisma.contract.create({
    data: {
      number: "CTR-2025-0001",
      status: "expired",
      startDate: new Date("2025-01-01"),
      endDate: new Date("2025-12-31"),
      amount: 85,
      description: "Contrat annuel — poêle à granulés",
      autoRenew: false,
      visits: 1,
      visitsDone: 1,
      clientId: nathalie.id, teamId: team.id,
    },
  });

  console.log("Seed complete!");
  console.log(`   1 team: ${team.name}`);
  console.log(`   2 users: jp.martin@ramonage-martin.fr / demo1234 (admin), lucas@ramonage-martin.fr / demo1234 (member)`);
  console.log(`   ${clients.length} clients`);
  console.log(`   9 appointments (4 today)`);
  console.log(`   6 invoices (3 paid, 1 overdue, 1 pending, 1 draft)`);
  console.log(`   2 quotes`);
  console.log(`   3 certificates`);
  console.log(`   3 contracts`);
}

function addDays(base: Date, days: number, hour: number, min: number): Date {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  d.setHours(hour, min, 0, 0);
  return d;
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
