"use client";

import { useEffect, type ReactNode } from "react";
import { XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModalShell } from "@/components/ui/modal-shell";
import { cn } from "@/lib/utils";

export { ModalShell };

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
