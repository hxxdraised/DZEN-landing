"use client";

import { useEffect, type ReactNode } from "react";
import { XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function SaveBar({
  dirty,
  saving,
  onSave,
  onReset,
}: {
  dirty: boolean;
  saving: boolean;
  onSave: () => void;
  onReset: () => void;
}) {
  if (!dirty) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-card/95 backdrop-blur">
      <div className="container mx-auto flex flex-wrap items-center justify-between gap-3 px-4 py-3">
        <p className="text-sm text-muted-foreground">Есть несохранённые изменения</p>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={onReset} disabled={saving}>
            Отменить
          </Button>
          <Button size="sm" onClick={onSave} disabled={saving}>
            {saving ? "Сохраняем…" : "Сохранить изменения"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function useUnloadGuard(dirty: boolean) {
  useEffect(() => {
    if (!dirty) return;
    const guard = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", guard);
    return () => window.removeEventListener("beforeunload", guard);
  }, [dirty]);
}

export function ModalShell({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 md:items-center md:p-6"
      onClick={onClose}
    >
      <div
        className="max-h-[92svh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-card p-6 shadow-2xl md:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="font-display text-xl font-semibold">{title}</h3>
          <button
            type="button"
            aria-label="Закрыть"
            onClick={onClose}
            className="rounded-full p-1.5 text-muted-foreground/70 hover:bg-accent hover:text-foreground"
          >
            <XIcon className="size-5" />
          </button>
        </div>
        <div className="mt-5">{children}</div>
      </div>
    </div>
  );
}

export function EditorIconButton({
  label,
  onClick,
  danger = false,
  children,
}: {
  label: string;
  onClick: () => void;
  danger?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      className={cn(
        "rounded-full p-1.5 text-muted-foreground/70 transition-colors hover:bg-accent hover:text-foreground",
        danger && "hover:text-destructive"
      )}
    >
      {children}
    </button>
  );
}
