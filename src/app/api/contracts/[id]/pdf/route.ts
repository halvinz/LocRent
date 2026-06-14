import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { generateContractPdf } from "@/server/services/contract-pdf.service";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } },
) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  try {
    const buffer = await generateContractPdf(
      session.user.companyId,
      params.id,
    );

    const filename = `contrat-${params.id}.pdf`;

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${filename}"`,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Impossible de générer le PDF" },
      { status: 404 },
    );
  }
}
