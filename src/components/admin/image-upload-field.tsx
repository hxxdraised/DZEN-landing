"use client";

import { useRef, useState } from "react";
import { UploadIcon, Trash2Icon, LinkIcon, AlertCircleIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const MAX_DIMENSION = 1600;
const WEBP_QUALITY = 0.85;

async function compressImage(file: File): Promise<File> {
  if (!file.type.startsWith("image/")) return file;

  const bitmap = await createImageBitmap(file).catch(() => null);
  if (!bitmap) return file;

  const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
  if (scale === 1 && file.type === "image/webp" && file.size <= 1024 * 1024) {
    bitmap.close();
    return file;
  }

  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    return file;
  }
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/webp", WEBP_QUALITY)
  );
  if (!blob || blob.size >= file.size) return file;

  return new File([blob], `${file.name.replace(/\.[^.]+$/, "")}.webp`, { type: "image/webp" });
}

interface ImageUploadFieldProps {
  value: string;
  onChange: (url: string) => void;
  prefix: "directions" | "team";
  aspect?: "4/3" | "square" | "portrait";
  manualLabel?: string;
}

export function ImageUploadField({
  value,
  onChange,
  prefix,
  aspect = "4/3",
  manualLabel = "вставить ссылку вручную",
}: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [manualMode, setManualMode] = useState(false);

  const upload = async (file: File) => {
    setUploading(true);
    setError(null);
    try {
      const compressed = await compressImage(file);
      const form = new FormData();
      form.append("file", compressed);
      form.append("prefix", prefix);

      const response = await fetch("/api/admin/upload", { method: "POST", body: form });
      const data = (await response.json().catch(() => null)) as { url?: string; error?: string } | null;

      if (response.ok && data?.url) {
        onChange(data.url);
        setManualMode(false);
      } else {
        setError(data?.error ?? "Не удалось загрузить файл");
      }
    } catch {
      setError("Ошибка загрузки");
    } finally {
      setUploading(false);
    }
  };

  const handleFiles = (files: FileList | null) => {
    const file = files?.[0];
    if (file) void upload(file);
  };

  return (
    <div className="space-y-2">
      <div
        className={cn(
          "relative overflow-hidden rounded-xl border border-dashed transition-colors",
          dragOver ? "border-primary bg-primary/5" : "border-border bg-muted/30",
          aspect === "4/3" && "aspect-[4/3]",
          aspect === "square" && "aspect-square max-w-56",
          aspect === "portrait" && "aspect-[4/5] max-h-72"
        )}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFiles(e.dataTransfer.files);
        }}
      >
        {value ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={value} alt="Предпросмотр" className="size-full object-cover" draggable={false} />
            <button
              type="button"
              aria-label="Удалить фото"
              title="Удалить фото (файл удалится из хранилища при сохранении)"
              onClick={() => onChange("")}
              className="absolute right-2 top-2 rounded-full bg-background/85 p-1.5 text-muted-foreground backdrop-blur transition-colors hover:text-destructive"
            >
              <Trash2Icon className="size-4" />
            </button>
          </>
        ) : (
          <button
            type="button"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
            className="flex size-full flex-col items-center justify-center gap-2 text-muted-foreground/60 transition-colors hover:text-primary disabled:opacity-50"
          >
            <UploadIcon className="size-7" />
            <span className="text-xs">
              {uploading ? "Загружаем…" : "Перетащите фото или нажмите"}
            </span>
            <span className="text-[10px] text-muted-foreground/50">
              JPEG / PNG / WebP до 5 МБ, сожмём автоматически
            </span>
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = "";
        }}
      />

      {error && (
        <p className="flex items-center gap-1.5 text-xs text-destructive">
          <AlertCircleIcon className="size-3.5" />
          {error}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-2 text-xs">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="text-primary underline-offset-2 hover:underline disabled:opacity-50"
        >
          выбрать файл
        </button>
        <span className="text-muted-foreground/40">·</span>
        <button
          type="button"
          onClick={() => setManualMode((v) => !v)}
          className="inline-flex items-center gap-1 text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
        >
          <LinkIcon className="size-3" />
          {manualLabel}
        </button>
      </div>

      {manualMode && (
        <div className="flex gap-2">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://…"
            className="h-10 min-w-0 flex-1 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary"
          />
          <Button type="button" variant="outline" size="sm" onClick={() => setManualMode(false)}>
            Готово
          </Button>
        </div>
      )}
    </div>
  );
}
