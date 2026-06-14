import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { ValidationError } from "@/lib/errors";

export const UPLOAD_MAX_BYTES = 5 * 1024 * 1024;
export const UPLOAD_FOLDERS = ["licenses", "inspections"] as const;
export type UploadFolder = (typeof UPLOAD_FOLDERS)[number];

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
]);

const EXT_BY_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/heic": "heic",
  "image/heif": "heif",
};

function getExtension(mimeType: string, originalName: string): string {
  const fromMime = EXT_BY_MIME[mimeType];
  if (fromMime) return fromMime;

  const fromName = originalName.split(".").pop()?.toLowerCase();
  if (fromName && /^[a-z0-9]+$/.test(fromName)) return fromName;

  return "jpg";
}

function getSupabaseAdmin(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;
  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function getPublicBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
    "http://localhost:3000"
  );
}

export function validateUploadInput(
  file: File | { size: number; type: string; name: string },
  folder: string,
): { mimeType: string; extension: string } {
  if (!UPLOAD_FOLDERS.includes(folder as UploadFolder)) {
    throw new ValidationError("Dossier de destination invalide");
  }

  if (file.size <= 0) {
    throw new ValidationError("Fichier vide");
  }

  if (file.size > UPLOAD_MAX_BYTES) {
    throw new ValidationError("La photo ne doit pas dépasser 5 Mo");
  }

  const mimeType = file.type || "application/octet-stream";
  if (!ALLOWED_MIME_TYPES.has(mimeType)) {
    throw new ValidationError(
      "Format non supporté. Utilisez JPG, PNG ou WebP.",
    );
  }

  return {
    mimeType,
    extension: getExtension(mimeType, file.name),
  };
}

async function uploadToLocal(params: {
  companyId: string;
  folder: UploadFolder;
  buffer: Buffer;
  extension: string;
}): Promise<string> {
  const filename = `${randomUUID()}.${params.extension}`;
  const relativeDir = path.join("uploads", params.companyId, params.folder);
  const absoluteDir = path.join(process.cwd(), "public", relativeDir);
  await mkdir(absoluteDir, { recursive: true });
  await writeFile(path.join(absoluteDir, filename), params.buffer);

  const relativePath = `/${relativeDir.replace(/\\/g, "/")}/${filename}`;
  return `${getPublicBaseUrl()}${relativePath}`;
}

async function uploadToSupabase(params: {
  companyId: string;
  folder: UploadFolder;
  buffer: Buffer;
  extension: string;
  mimeType: string;
}): Promise<string> {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    throw new ValidationError(
      "Stockage cloud non configuré. Ajoutez SUPABASE_SERVICE_ROLE_KEY.",
    );
  }

  const bucket = process.env.SUPABASE_STORAGE_BUCKET ?? "uploads";
  const storagePath = `${params.companyId}/${params.folder}/${randomUUID()}.${params.extension}`;

  const { error } = await supabase.storage
    .from(bucket)
    .upload(storagePath, params.buffer, {
      contentType: params.mimeType,
      upsert: false,
    });

  if (error) {
    throw new ValidationError(
      `Échec de l'envoi vers le stockage : ${error.message}`,
    );
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(storagePath);
  return data.publicUrl;
}

export async function storeUploadedImage(params: {
  companyId: string;
  folder: UploadFolder;
  buffer: Buffer;
  mimeType: string;
  originalName: string;
}): Promise<string> {
  const { extension } = validateUploadInput(
    {
      size: params.buffer.length,
      type: params.mimeType,
      name: params.originalName,
    },
    params.folder,
  );

  const supabase = getSupabaseAdmin();
  if (supabase) {
    return uploadToSupabase({
      companyId: params.companyId,
      folder: params.folder,
      buffer: params.buffer,
      extension,
      mimeType: params.mimeType,
    });
  }

  if (process.env.NODE_ENV === "production") {
    throw new ValidationError(
      "Configurez SUPABASE_SERVICE_ROLE_KEY pour joindre des photos en production.",
    );
  }

  return uploadToLocal({
    companyId: params.companyId,
    folder: params.folder,
    buffer: params.buffer,
    extension,
  });
}
