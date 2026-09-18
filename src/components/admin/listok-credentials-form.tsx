"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { AlertCircleIcon, CheckCircle2Icon, CopyIcon, CheckIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SecretInput } from "@/components/admin/secret-input";

interface ListokCredentialsFormProps {
  clientIdMasked: string | null;
  redirectUri: string;
  baseUrl: string | null;
}

export function ListokCredentialsForm({
  clientIdMasked,
  redirectUri,
  baseUrl,
}: ListokCredentialsFormProps) {
  const router = useRouter();
  const [clientId, setClientId] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [saving, setSaving] = useState(false);
  const [state, setState] = useState<{ kind: "idle" | "ok" | "error"; text: string }>({
    kind: "idle",
  });
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(redirectUri);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    setState({ kind: "idle" });

    try {
      const response = await fetch("/api/admin/listok", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: clientId || undefined,
          client_secret: clientSecret || undefined,
        }),
      });
      const data = (await response.json().catch(() => null)) as
        | { ok?: boolean; error?: string }
        | null;

      if (response.ok && data?.ok) {
        setState({ kind: "ok", text: "Учётные данные сохранены" });
        setClientId("");
        setClientSecret("");
        router.refresh();
      } else {
        setState({ kind: "error", text: data?.error ?? "Не удалось сохранить" });
      }
    } catch {
      setState({ kind: "error", text: "Нет соединения с сервером" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border bg-card p-6">
      <div>
        <h2 className="text-lg font-semibold">Учётные данные API</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          ID интеграции и секретный ключ из CRM Listok
        </p>
      </div>

      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm">
        <p className="font-medium">Где получить</p>
        <ol className="mt-2 list-decimal space-y-1 pl-5 text-muted-foreground">
          <li>
            В CRM Listok откройте раздел <b>Интеграции → API интеграции</b> и создайте интеграцию.
          </li>
          <li>
            В поле «Ссылка перенаправления» укажите:
            <span className="mt-1.5 flex items-center gap-2">
              <code className="block min-w-0 flex-1 truncate rounded-lg border bg-background px-2.5 py-1.5 text-xs">
                {redirectUri}
              </code>
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                onClick={handleCopy}
                aria-label="Скопировать ссылку перенаправления"
              >
                {copied ? <CheckIcon className="size-3.5" /> : <CopyIcon className="size-3.5" />}
              </Button>
            </span>
          </li>
          <li>
            Полученные «ID интеграции» и «Секретный ключ» вставьте в поля ниже и сохраните.
          </li>
        </ol>
      </div>

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">ID интеграции</span>
        <input
          type="text"
          name="listok-integration-id"
          value={clientId}
          onChange={(e) => setClientId(e.target.value.trim())}
          placeholder={clientIdMasked ? `Текущий: ${clientIdMasked}` : "Например: a2c3546c-…"}
          autoComplete="off"
          className="h-11 rounded-xl border border-border bg-background px-4 text-sm outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary"
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">Секретный ключ</span>
        <SecretInput
          value={clientSecret}
          onChange={setClientSecret}
          placeholder="Вставьте секретный ключ"
        />
        <span className="text-xs text-muted-foreground">
          Оставьте оба поля пустыми, чтобы не менять текущие значения.
        </span>
      </label>

      {baseUrl && (
        <p className="text-xs text-muted-foreground">
          Адрес CRM: <code>{baseUrl}</code> (настраивается переменной LISTOK_BASE_URL)
        </p>
      )}

      {state.kind !== "idle" && (
        <div
          className={`flex items-start gap-2 rounded-xl border p-3 text-sm ${
            state.kind === "ok"
              ? "border-primary/30 bg-primary/5 text-primary"
              : "border-destructive/30 bg-destructive/5 text-destructive"
          }`}
        >
          {state.kind === "ok" ? (
            <CheckCircle2Icon className="mt-0.5 size-4 shrink-0" />
          ) : (
            <AlertCircleIcon className="mt-0.5 size-4 shrink-0" />
          )}
          {state.text}
        </div>
      )}

      <Button type="submit" disabled={saving}>
        {saving ? "Сохраняем…" : "Сохранить учётные данные"}
      </Button>
    </form>
  );
}
