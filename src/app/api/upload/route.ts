import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getErrorMessage } from "@/lib/errors";
import {
  storeUploadedImage,
  UPLOAD_FOLDERS,
  validateUploadInput,
  type UploadFolder,
} from "@/lib/storage/upload";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const folder = formData.get("folder");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Fichier requis" }, { status: 400 });
    }

    if (typeof folder !== "string" || !UPLOAD_FOLDERS.includes(folder as UploadFolder)) {
      return NextResponse.json(
        { error: "Dossier de destination invalide" },
        { status: 400 },
      );
    }

    validateUploadInput(file, folder);

    const buffer = Buffer.from(await file.arrayBuffer());
    const url = await storeUploadedImage({
      companyId: session.user.companyId,
      folder: folder as UploadFolder,
      buffer,
      mimeType: file.type || "image/jpeg",
      originalName: file.name,
    });

    return NextResponse.json({ url });
  } catch (error) {
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 400 },
    );
  }
}
