import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { getContractById } from "./contract.service";
import { formatDate, formatDateTime } from "@/lib/utils";

function formatMoney(value: unknown): string {
  if (value == null) return "—";
  const n =
    typeof value === "object" && value !== null && "toString" in value
      ? parseFloat((value as { toString: () => string }).toString())
      : Number(value);
  if (Number.isNaN(n)) return "—";
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(n);
}

export async function generateContractPdf(
  companyId: string,
  contractId: string,
): Promise<Buffer> {
  const contract = await getContractById(companyId, contractId);
  const { company, client, vehicle } = contract;

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  let y = 800;
  const left = 50;
  const line = (text: string, bold = false, size = 10) => {
    page.drawText(text, {
      x: left,
      y,
      size,
      font: bold ? fontBold : font,
      color: rgb(0.1, 0.1, 0.1),
    });
    y -= size + 6;
  };

  page.drawText("CONTRAT DE LOCATION", {
    x: 180,
    y,
    size: 18,
    font: fontBold,
  });
  y -= 28;
  line(`N° ${contract.contractNumber ?? contract.id}`, false, 11);
  y -= 10;

  line("Agence", true, 12);
  line(company.name);
  if (company.address) line(company.address);
  if (company.phone) line(`Tél. ${company.phone}`);
  if (company.email) line(company.email);
  y -= 8;

  line("Client", true, 12);
  line(`${client.firstName} ${client.lastName}`);
  if (client.email) line(client.email);
  if (client.phone) line(client.phone);
  if (client.drivingLicenseNumber) line(`Permis : ${client.drivingLicenseNumber}`);
  y -= 8;

  line("Véhicule", true, 12);
  line(
    `${vehicle.licensePlate} — ${vehicle.make} ${vehicle.model}${vehicle.year ? ` (${vehicle.year})` : ""}`,
  );
  y -= 8;

  line("Période", true, 12);
  line(`Début : ${formatDateTime(contract.startAt)}`);
  line(`Fin prévue : ${formatDateTime(contract.expectedEndAt)}`);
  if (contract.actualEndAt) line(`Retour : ${formatDateTime(contract.actualEndAt)}`);
  y -= 8;

  line("Conditions financières", true, 12);
  line(`Tarif journalier : ${formatMoney(contract.dailyPrice)}`);
  line(`Caution : ${formatMoney(contract.depositAmount)}`);
  if (contract.includedMileage != null) line(`Km inclus : ${contract.includedMileage} km`);
  y -= 8;

  if (contract.startMileage != null || contract.startFuelLevel != null) {
    line("État au départ", true, 12);
    if (contract.startMileage != null) {
      line(`Kilométrage : ${contract.startMileage.toLocaleString("fr-FR")} km`);
    }
    if (contract.startFuelLevel != null) line(`Carburant : ${contract.startFuelLevel} %`);
    y -= 8;
  }

  line("Clauses", true, 12);
  const terms = contract.terms ?? "—";
  const words = terms.split(/\s+/);
  let currentLine = "";
  for (const word of words) {
    const test = currentLine ? `${currentLine} ${word}` : word;
    if (test.length > 90) {
      line(currentLine, false, 9);
      currentLine = word;
    } else {
      currentLine = test;
    }
  }
  if (currentLine) line(currentLine, false, 9);

  y -= 30;
  line("Signatures", true, 11);
  y -= 40;
  line("Le locataire                    L'agence", false, 10);
  y -= 30;
  line("_____________________          _____________________", false, 10);
  y -= 20;
  line(`Document généré le ${formatDate(new Date())} — FleetRent`, false, 8);

  const bytes = await pdfDoc.save();
  return Buffer.from(bytes);
}
