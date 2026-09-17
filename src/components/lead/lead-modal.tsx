"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { CheckCircle2Icon, AlertCircleIcon } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { PhoneIcon } from "lucide-react";
import { TelegramIcon, MaxIcon } from "@/components/lead/messenger-icons";
import { cn } from "@/lib/utils";
import { contactData } from "@/data/mock";

const METHODS = [
  { value: "telegram", label: "Telegram", icon: TelegramIcon },
  { value: "max", label: "MAX", icon: MaxIcon },
  { value: "call", label: "Звонок", icon: PhoneIcon },
] as const;

type MethodValue = (typeof METHODS)[number]["value"];

function formatPhoneInput(raw: string): { digits: string; display: string } {
  let d = raw.replace(/\D/g, "");
  if (d.length > 0 && (d[0] === "8" || d[0] === "9")) d = `7${d.slice(d[0] === "8" ? 1 : 0)}`;
  if (d.length > 0 && d[0] !== "7") d = `7${d}`;
  d = d.slice(0, 11);

  const p = d.slice(1);
  let display = "+7";
  if (p.length > 0) display += ` (${p.slice(0, 3)}`;
  if (p.length >= 3) display += ")";
  if (p.length > 3) display += ` ${p.slice(3, 6)}`;
  if (p.length >= 6) display += `-${p.slice(6, 8)}`;
  if (p.length >= 8) display += `-${p.slice(8, 10)}`;

  return { digits: d, display };
}

interface LeadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  source: string;
}

export function LeadModal({ open, onOpenChange, source }: LeadModalProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [method, setMethod] = useState<MethodValue>("telegram");
  const [message, setMessage] = useState("");
  const [consent, setConsent] = useState(false);
  const [company, setCompany] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const phoneDigits = formatPhoneInput(phone).digits;
  const nameValid = name.trim().length >= 2;
  const phoneValid = phoneDigits.length === 11;
  const canSubmit = nameValid && phoneValid && consent && status !== "sending";

  const reset = () => {
    setName("");
    setPhone("");
    setMethod("telegram");
    setMessage("");
    setConsent(false);
    setCompany("");
    setStatus("idle");
    setError(null);
  };

  const handleOpenChange = (next: boolean) => {
    onOpenChange(next);
    if (!next && status === "success") reset();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setStatus("sending");
    setError(null);

    try {
      const response = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone: phoneDigits,
          contactMethod: method,
          message: message.trim() || undefined,
          source,
          consent,
          company,
        }),
      });
      const data = (await response.json().catch(() => null)) as { ok?: boolean; error?: string } | null;

      if (response.ok && data?.ok) {
        setStatus("success");
      } else {
        setStatus("error");
        setError(data?.error ?? "Что-то пошло не так. Попробуйте ещё раз.");
      }
    } catch {
      setStatus("error");
      setError("Нет соединения. Проверьте интернет и попробуйте ещё раз.");
    }
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent
        side="bottom"
        className="mx-auto max-h-[92svh] w-full max-w-lg overflow-y-auto rounded-t-3xl border-0 px-6 pb-8 pt-6 md:bottom-auto md:top-1/2 md:-translate-y-1/2 md:rounded-3xl md:shadow-2xl"
      >
        <SheetHeader className="p-0 text-left">
          <SheetTitle className="font-display text-2xl font-semibold">
            {status === "success" ? "Заявка отправлена" : "Запись на пробное занятие"}
          </SheetTitle>
          <SheetDescription>
            {status === "success"
              ? "Администратор свяжется с вами в течение дня."
              : "Для новых клиентов. Уже занимаетесь? Напишите нам в Telegram или WhatsApp — администратор запишет вас на любое занятие."}
          </SheetDescription>
        </SheetHeader>

        {status === "success" ? (
          <div className="mt-6 flex flex-col items-center gap-4 text-center">
            <CheckCircle2Icon className="size-12 text-primary" />
            <p className="text-sm text-muted-foreground">
              Мы свяжемся с вами удобным способом:{" "}
              <span className="font-medium text-foreground">
                {METHODS.find((m) => m.value === method)?.label}
              </span>
            </p>
            <Button onClick={() => handleOpenChange(false)} className="mt-2">
              Отлично
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium">
                ФИО <span className="text-primary">*</span>
              </span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value.slice(0, 80))}
                placeholder="Например: Иванова Мария Сергеевна"
                autoComplete="name"
                className="h-11 rounded-xl border border-border bg-card px-4 text-sm outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary"
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium">
                Телефон <span className="text-primary">*</span>
              </span>
              <input
                type="tel"
                inputMode="tel"
                value={phone}
                onChange={(e) => setPhone(formatPhoneInput(e.target.value).display)}
                onFocus={() => {
                  if (!phone) setPhone("+7 (");
                }}
                placeholder="+7 (___) ___-__-__"
                autoComplete="tel"
                className="h-11 rounded-xl border border-border bg-card px-4 text-sm tabular-nums outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary"
              />
            </label>

            <fieldset className="flex flex-col gap-1.5">
              <legend className="text-sm font-medium">
                Удобный способ связи <span className="text-primary">*</span>
              </legend>
              <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Способ связи">
                {METHODS.map((m) => {
                  const Icon = m.icon;
                  return (
                    <button
                      key={m.value}
                      type="button"
                      role="radio"
                      aria-checked={method === m.value}
                      onClick={() => setMethod(m.value)}
                      className={cn(
                        "flex h-16 flex-col items-center justify-center gap-1.5 rounded-xl border text-xs transition-colors",
                        method === m.value
                          ? "border-primary bg-primary/10 font-medium text-primary"
                          : "border-border bg-card text-foreground/70 hover:border-primary/40"
                      )}
                    >
                      <Icon className="size-5" />
                      {m.label}
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium">Пожелания</span>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value.slice(0, 1000))}
                placeholder="Направление, цели, особенности здоровья или травмы"
                rows={3}
                className="resize-none rounded-xl border border-border bg-card px-4 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary"
              />
            </label>

            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              name="company"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden
              className="hidden"
            />

            <label className="flex cursor-pointer items-start gap-2.5">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-0.5 size-4 shrink-0 accent-[#a2675a]"
              />
              <span className="text-xs leading-relaxed text-muted-foreground">
                Согласен(на) на обработку персональных данных в соответствии с{" "}
                <Link href="/privacy" className="underline underline-offset-2 hover:text-foreground">
                  политикой конфиденциальности
                </Link>{" "}
                <span className="text-primary">*</span>
              </span>
            </label>

            {status === "error" && error && (
              <div className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                <AlertCircleIcon className="mt-0.5 size-4 shrink-0" />
                <span>
                  {error}{" "}
                  <a
                    href={`tel:${contactData.phone.replace(/\D/g, "")}`}
                    className="font-medium underline underline-offset-2"
                  >
                    {contactData.phone}
                  </a>
                </span>
              </div>
            )}

            <Button type="submit" size="lg" disabled={!canSubmit} className="mt-1 w-full">
              {status === "sending" ? "Отправляем…" : "Отправить заявку"}
            </Button>
          </form>
        )}
      </SheetContent>
    </Sheet>
  );
}
