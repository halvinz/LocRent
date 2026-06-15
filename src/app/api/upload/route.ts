import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getErrorMessage } from "@/lib/errors";
import { prisma } from "@/lib/db/prisma";
import { resolveUserPermissions, hasAnyPermission } from "@/lib/permissions";
import { permissionForUploadFolder } from "@/config/permissions";
import {
  storeUploadedImage,
  UPLOAD_FOLDERS,
  validateUploadInput,
  type UploadFolder,
} from "@/lib/storage/upload";
import { ForbiddenError } from "@/lib/errors";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  try {
    const user = await prisma.user.findFirst({
      where: {
        id: session.user.id,
        companyId: session.user.companyId,
        isActive: true,
      },
      select: { role: true, permissions: true },
    });

    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

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

    const requiredPermission = permissionForUploadFolder(folder);
    if (requiredPermission) {
      const permissions = resolveUserPermissions(user.role, user.permissions);
      if (
        !hasAnyPermission(
          { role: user.role, permissions },
          [requiredPermission],
        )
      ) {
        throw new ForbiddenError("Vous n'avez pas les droits pour joindre ce fichier");
      }
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
