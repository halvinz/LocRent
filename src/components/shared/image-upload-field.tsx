"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Camera, Loader2, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { UploadFolder } from "@/lib/storage/upload";

interface ImageUploadFieldProps {
  label: string;
  value?: string;
  onChange: (url: string) => void;
  folder: UploadFolder;
  error?: string;
}

async function uploadFile(file: File, folder: UploadFolder): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", folder);

  const response = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });

  const payload = (await response.json()) as { url?: string; error?: string };
  if (!response.ok || !payload.url) {
    throw new Error(payload.error ?? "Échec de l'envoi de la photo");
  }

  return payload.url;
}

export function ImageUploadField({
  label,
  value,
  onChange,
  folder,
  error,
}: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFiles(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const url = await uploadFile(file, folder);
      onChange(url);
      toast.success("Photo ajoutée");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur d'envoi");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {value ? (
        <div className="space-y-3 rounded-lg border p-3">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-md bg-muted">
            <Image
              src={value}
              alt={label}
              fill
              className="object-contain"
              unoptimized
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={uploading}
              onClick={() => inputRef.current?.click()}
            >
              {uploading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Upload className="mr-2 h-4 w-4" />
              )}
              Remplacer
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={uploading}
              onClick={() => onChange("")}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Retirer
            </Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className="flex w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-6 text-sm text-muted-foreground transition-colors hover:border-primary hover:bg-muted/40 disabled:opacity-50"
        >
          {uploading ? (
            <Loader2 className="h-8 w-8 animate-spin" />
          ) : (
            <Camera className="h-8 w-8" />
          )}
          <span>Choisir une photo ou prendre une photo</span>
          <span className="text-xs">JPG, PNG, WebP — max 5 Mo</span>
        </button>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}

interface PhotoUploadListProps {
  photos: { url: string; caption?: string }[];
  onChange: (photos: { url: string; caption?: string }[]) => void;
  folder: UploadFolder;
  maxPhotos?: number;
}

export function PhotoUploadList({
  photos,
  onChange,
  folder,
  maxPhotos = 20,
}: PhotoUploadListProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return;

    const remaining = maxPhotos - photos.length;
    if (remaining <= 0) {
      toast.error(`Maximum ${maxPhotos} photos`);
      return;
    }

    const selected = Array.from(files).slice(0, remaining);
    setUploading(true);

    try {
      const uploaded: { url: string; caption?: string }[] = [];
      for (const file of selected) {
        const url = await uploadFile(file, folder);
        uploaded.push({ url, caption: "" });
      }
      onChange([...photos, ...uploaded]);
      toast.success(
        uploaded.length > 1
          ? `${uploaded.length} photos ajoutées`
          : "Photo ajoutée",
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur d'envoi");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function updateCaption(index: number, caption: string) {
    onChange(
      photos.map((photo, i) => (i === index ? { ...photo, caption } : photo)),
    );
  }

  function removePhoto(index: number) {
    onChange(photos.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-4">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {photos.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          {photos.map((photo, index) => (
            <div key={`${photo.url}-${index}`} className="space-y-2 rounded-lg border p-3">
              <div className="relative aspect-[4/3] overflow-hidden rounded-md bg-muted">
                <Image
                  src={photo.url}
                  alt={photo.caption || `Photo ${index + 1}`}
                  fill
                  className="object-contain"
                  unoptimized
                />
              </div>
              <input
                type="text"
                value={photo.caption ?? ""}
                onChange={(e) => updateCaption(index, e.target.value)}
                placeholder="Légende (optionnelle)"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removePhoto(index)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Retirer
              </Button>
            </div>
          ))}
        </div>
      )}

      {photos.length < maxPhotos && (
        <Button
          type="button"
          variant="outline"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Camera className="mr-2 h-4 w-4" />
          )}
          Ajouter des photos
        </Button>
      )}

      <p className="text-xs text-muted-foreground">
        {photos.length}/{maxPhotos} photo{photos.length > 1 ? "s" : ""} — JPG,
        PNG, WebP, max 5 Mo chacune
      </p>
    </div>
  );
}
