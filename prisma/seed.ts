import {
  PrismaClient,
  UserRole,
  VehicleStatus,
  RentalContractStatus,
  FineStatus,
} from "@prisma/client";
import { hashPassword } from "../src/lib/auth/password";
import { normalizeLicensePlate } from "../src/config/fines";

const prisma = new PrismaClient();

async function main() {
  const company = await prisma.company.upsert({
    where: { slug: "demo-agency" },
    update: {},
    create: {
      name: "Agence Demo Location",
      slug: "demo-agency",
      email: "contact@demo-agency.fr",
      phone: "+33 1 23 45 67 89",
      address: "12 rue de la Location, 75001 Paris",
    },
  });

  const adminPassword = await hashPassword("Admin123!");
  const staffPassword = await hashPassword("Staff123!");

  await prisma.user.upsert({
    where: {
      companyId_email: {
        companyId: company.id,
        email: "admin@demo-agency.fr",
      },
    },
    update: {},
    create: {
      companyId: company.id,
      email: "admin@demo-agency.fr",
      passwordHash: adminPassword,
      firstName: "Jean",
      lastName: "Dupont",
      role: UserRole.ADMIN,
    },
  });

  await prisma.user.upsert({
    where: {
      companyId_email: {
        companyId: company.id,
        email: "staff@demo-agency.fr",
      },
    },
    update: {},
    create: {
      companyId: company.id,
      email: "staff@demo-agency.fr",
      passwordHash: staffPassword,
      firstName: "Marie",
      lastName: "Martin",
      role: UserRole.STAFF,
    },
  });

  // Clients
  const client1 = await prisma.client.upsert({
    where: { id: "seed-client-alice" },
    update: {},
    create: {
      id: "seed-client-alice",
      companyId: company.id,
      firstName: "Alice",
      lastName: "Bernard",
      email: "alice.bernard@email.fr",
      phone: "+33 6 11 22 33 44",
      drivingLicenseNumber: "12AB34567",
      address: "5 avenue Victor Hugo, Lyon",
    },
  });

  const client2 = await prisma.client.upsert({
    where: { id: "seed-client-bob" },
    update: {},
    create: {
      id: "seed-client-bob",
      companyId: company.id,
      firstName: "Bob",
      lastName: "Moreau",
      email: "bob.moreau@email.fr",
      phone: "+33 6 55 66 77 88",
      drivingLicenseNumber: "98XY76543",
      address: "18 rue Nationale, Lille",
    },
  });

  // Véhicules
  const plate1 = normalizeLicensePlate("AB-123-CD");
  const plate2 = normalizeLicensePlate("EF-456-GH");

  const vehicle1 = await prisma.vehicle.upsert({
    where: {
      companyId_licensePlate: {
        companyId: company.id,
        licensePlate: plate1,
      },
    },
    update: {},
    create: {
      companyId: company.id,
      licensePlate: plate1,
      make: "Peugeot",
      model: "208",
      year: 2022,
      color: "Blanc",
      status: VehicleStatus.RENTED,
      currentMileage: 24500,
    },
  });

  const vehicle2 = await prisma.vehicle.upsert({
    where: {
      companyId_licensePlate: {
        companyId: company.id,
        licensePlate: plate2,
      },
    },
    update: {},
    create: {
      companyId: company.id,
      licensePlate: plate2,
      make: "Renault",
      model: "Clio",
      year: 2021,
      color: "Gris",
      status: VehicleStatus.AVAILABLE,
      currentMileage: 41200,
    },
  });

  const now = new Date();

  // Contrat 1 — Alice, Peugeot, ACTIVE (couvre amende matched)
  const contract1Start = new Date(now);
  contract1Start.setDate(contract1Start.getDate() - 3);
  contract1Start.setHours(10, 0, 0, 0);

  const contract1End = new Date(now);
  contract1End.setDate(contract1End.getDate() + 4);
  contract1End.setHours(18, 0, 0, 0);

  const contract1 = await prisma.rentalContract.upsert({
    where: {
      companyId_contractNumber: {
        companyId: company.id,
        contractNumber: "LOC-2026-001",
      },
    },
    update: {},
    create: {
      companyId: company.id,
      clientId: client1.id,
      vehicleId: vehicle1.id,
      contractNumber: "LOC-2026-001",
      status: RentalContractStatus.ACTIVE,
      startAt: contract1Start,
      expectedEndAt: contract1End,
      dailyPrice: 45,
      depositAmount: 500,
      startMileage: 24000,
    },
  });

  // Contrat 2 — Bob, Clio, COMPLETED (passé)
  const contract2Start = new Date(now);
  contract2Start.setDate(contract2Start.getDate() - 30);
  contract2Start.setHours(9, 0, 0, 0);

  const contract2ExpectedEnd = new Date(now);
  contract2ExpectedEnd.setDate(contract2ExpectedEnd.getDate() - 25);
  contract2ExpectedEnd.setHours(17, 0, 0, 0);

  const contract2ActualEnd = new Date(contract2ExpectedEnd);

  await prisma.rentalContract.upsert({
    where: {
      companyId_contractNumber: {
        companyId: company.id,
        contractNumber: "LOC-2026-002",
      },
    },
    update: {},
    create: {
      companyId: company.id,
      clientId: client2.id,
      vehicleId: vehicle2.id,
      contractNumber: "LOC-2026-002",
      status: RentalContractStatus.COMPLETED,
      startAt: contract2Start,
      expectedEndAt: contract2ExpectedEnd,
      actualEndAt: contract2ActualEnd,
      dailyPrice: 38,
      depositAmount: 400,
      startMileage: 40500,
      endMileage: 41200,
    },
  });

  // Contrat 3 — Alice, Clio, COMPLETED (historique sur véhicule 2)
  const contract3Start = new Date(now);
  contract3Start.setDate(contract3Start.getDate() - 60);
  contract3Start.setHours(8, 0, 0, 0);

  const contract3End = new Date(now);
  contract3End.setDate(contract3End.getDate() - 55);
  contract3End.setHours(20, 0, 0, 0);

  await prisma.rentalContract.upsert({
    where: {
      companyId_contractNumber: {
        companyId: company.id,
        contractNumber: "LOC-2025-089",
      },
    },
    update: {},
    create: {
      companyId: company.id,
      clientId: client1.id,
      vehicleId: vehicle2.id,
      contractNumber: "LOC-2025-089",
      status: RentalContractStatus.COMPLETED,
      startAt: contract3Start,
      expectedEndAt: contract3End,
      actualEndAt: contract3End,
      dailyPrice: 35,
      depositAmount: 350,
      startMileage: 39800,
      endMileage: 40100,
    },
  });

  // Amende 1 — rapprochée automatiquement (Alice / Peugeot / contrat actif)
  const violation1 = new Date(now);
  violation1.setDate(violation1.getDate() - 1);
  violation1.setHours(14, 32, 0, 0);

  await prisma.fine.upsert({
    where: { id: "seed-fine-matched" },
    update: {},
    create: {
      id: "seed-fine-matched",
      companyId: company.id,
      vehicleId: vehicle1.id,
      rentalContractId: contract1.id,
      licensePlate: plate1,
      violationAt: violation1,
      violationType: "Excès de vitesse",
      amount: 135,
      referenceNumber: "ANTAI-2026-78432",
      issuingAuthority: "ANTAI",
      status: FineStatus.MATCHED,
      matchedAt: new Date(),
      notes: "Rapprochement auto — contrat LOC-2026-001",
    },
  });

  // Amende 2 — non rapprochée (plaque inconnue ou hors période)
  const violation2 = new Date(now);
  violation2.setDate(violation2.getDate() - 2);
  violation2.setHours(9, 15, 0, 0);

  await prisma.fine.upsert({
    where: { id: "seed-fine-new" },
    update: {},
    create: {
      id: "seed-fine-new",
      companyId: company.id,
      licensePlate: plate2,
      violationAt: violation2,
      violationType: "Stationnement",
      amount: 35,
      referenceNumber: "PV-2026-9912",
      issuingAuthority: "Ville de Paris",
      status: FineStatus.NEW,
      notes: "Véhicule disponible — aucun contrat actif à cette date",
    },
  });

  console.log("Seed completed:");
  console.log("  Company:", company.name);
  console.log("  Admin: admin@demo-agency.fr / Admin123!");
  console.log("  Staff: staff@demo-agency.fr / Staff123!");
  console.log("  Clients: Alice Bernard, Bob Moreau");
  console.log("  Vehicles:", plate1, plate2);
  console.log("  Contracts: LOC-2026-001 (active), LOC-2026-002, LOC-2025-089");
  console.log("  Fines: 1 matched, 1 new (unmatched)");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
