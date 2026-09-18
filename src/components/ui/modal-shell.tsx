"use client";

import { useEffect, type ReactNode } from "react";
import { XIcon } from "lucide-react";

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
