"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertCircleIcon, CheckCircle2Icon, SendIcon, RotateCcwIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SecretInput } from "@/components/admin/secret-input";
import { cn } from "@/lib/utils";
import {
  DEFAULT_NOTIFY_TEMPLATE,
  renderTemplate,
  stripHtml,
  type LeadPayload,
} from "@/lib/telegram-shared";

interface TelegramConfigResponse {
  bot_token_masked: string | null;
  chat_id: string | null;
  notify_template: string;
}

const SAMPLE_LEAD: LeadPayload = {
  name: "Мария Иванова",
  phone: "79652345678",
  contactMethod: "telegram",
  message: "Хочу на растяжку, новичок",
  source: "Пробное занятие (главная)",
};

type SaveState = { kind: "idle" } | { kind: "ok"; text: string } | { kind: "error"; text: string };

export function TelegramSettingsForm() {
  const [config, setConfig] = useState<TelegramConfigResponse | null>(null);
  const [botToken, setBotToken] = useState("");
  const [chatId, setChatId] = useState("");
  const [template, setTemplate] = useState(DEFAULT_NOTIFY_TEMPLATE);
  const [saveState, setSaveState] = useState<SaveState>({ kind: "idle" });
  const [testState, setTestState] = useState<SaveState>({ kind: "idle" });
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    fetch("/api/admin/telegram")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("load failed"))))
      .then((data: TelegramConfigResponse) => {
        setConfig(data);
        setChatId(data.chat_id ?? "");
        setTemplate(data.notify_template ?? DEFAULT_NOTIFY_TEMPLATE);
      })
      .catch(() => setSaveState({ kind: "error", text: "Не удалось загрузить настройки" }));
  }, []);

  const preview = useMemo(() => {
    try {
      return stripHtml(renderTemplate(template, SAMPLE_LEAD));
    } catch {
      return "Ошибка в шаблоне";
    }
  }, [template]);

  const previewLines = preview.split("\n").filter((line, i) => line.trim() !== "" || (preview.split("\n")[i - 1] ?? "").trim() !== "");

  const handleSave = useCallback(async () => {
    if (saving) return;
    setSaving(true);
    setSaveState({ kind: "idle" });

    try {
      const response = await fetch("/api/admin/telegram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bot_token: botToken || undefined,
          chat_id: chatId,
          notify_template: template,
        }),
      });
      const data = (await response.json().catch(() => null)) as
        | (TelegramConfigResponse & { ok?: boolean; error?: string })
        | null;

      if (response.ok && data?.ok) {
        setConfig(data);
        setBotToken("");
        setChatId(data.chat_id ?? "");
        setSaveState({ kind: "ok", text: "Настройки сохранены" });
      } else {
        setSaveState({ kind: "error", text: data?.error ?? "Не удалось сохранить" });
      }
    } catch {
      setSaveState({ kind: "error", text: "Нет соединения с сервером" });
    } finally {
      setSaving(false);
    }
  }, [botToken, chatId, template, saving]);

  const handleTest = useCallback(async () => {
    if (testing) return;
    setTesting(true);
    setTestState({ kind: "idle" });

    try {
      const response = await fetch("/api/admin/telegram/test", { method: "POST" });
      const data = (await response.json().catch(() => null)) as { ok?: boolean; error?: string } | null;

      if (response.ok && data?.ok) {
        setTestState({ kind: "ok", text: "Тестовое сообщение отправлено в канал" });
      } else {
        setTestState({ kind: "error", text: data?.error ?? "Не удалось отправить" });
      }
    } catch {
      setTestState({ kind: "error", text: "Нет соединения с сервером" });
    } finally {
      setTesting(false);
    }
  }, [testing]);

  if (!config) {
    return <p className="text-sm text-muted-foreground">Загрузка настроек…</p>;
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="space-y-4 rounded-2xl border bg-card p-6">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">Токен бота</span>
          <SecretInput
            value={botToken}
            onChange={setBotToken}
            placeholder={
              config.bot_token_masked
                ? `Текущий: ${config.bot_token_masked}`
                : "Не задан — вставьте токен от @BotFather"
            }
          />
          <span className="text-xs text-muted-foreground">
            Оставьте пустым, чтобы не менять текущий токен.
          </span>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">ID канала</span>
          <input
            type="text"
            name="telegram-chat-id"
            value={chatId}
            onChange={(e) => setChatId(e.target.value)}
            placeholder="-1004211742893 или @channel_name"
            autoComplete="off"
            className="h-11 rounded-xl border border-border bg-background px-4 text-sm tabular-nums outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary"
          />
          <span className="text-xs text-muted-foreground">
            Формат: -100… для канала, @username для публичного канала или число для чата.
          </span>
        </label>
      </div>

      <div className="space-y-3 rounded-2xl border bg-card p-6">
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm font-medium">Шаблон уведомления</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setTemplate(DEFAULT_NOTIFY_TEMPLATE)}
            title="Вернуть шаблон по умолчанию"
          >
            <RotateCcwIcon className="size-3.5" />
            Сбросить
          </Button>
        </div>
        <textarea
          value={template}
          onChange={(e) => setTemplate(e.target.value.slice(0, 2000))}
          rows={9}
          className="w-full resize-y rounded-xl border border-border bg-background px-4 py-3 font-mono text-xs leading-relaxed outline-none transition-colors focus:border-primary"
        />
        <p className="text-xs leading-relaxed text-muted-foreground">
          Плейсхолдеры: {"{{name}}"}, {"{{phone}}"}, {"{{phone_link}}"}, {"{{method}}"},{" "}
          {"{{message_line}}"}, {"{{source}}"}, {"{{datetime}}"}. Разметка HTML (parse_mode).
        </p>

        <div>
          <p className="mb-2 text-xs font-medium text-muted-foreground">
            Превью (пример данных)
          </p>
          <div className="whitespace-pre-line rounded-xl border border-dashed bg-background p-4 text-xs leading-relaxed">
            {previewLines.join("\n")}
          </div>
        </div>
      </div>

      {saveState.kind !== "idle" && <StateLine state={saveState} />}
      {testState.kind !== "idle" && <StateLine state={testState} />}

      <div className="flex flex-wrap gap-3">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Сохраняем…" : "Сохранить настройки"}
        </Button>
        <Button variant="outline" onClick={handleTest} disabled={testing}>
          <SendIcon className="size-4" />
          {testing ? "Отправляем…" : "Отправить тестовое"}
        </Button>
      </div>
    </div>
  );
}

function StateLine({ state }: { state: SaveState }) {
  if (state.kind === "idle") return null;
  return (
    <div
      className={cn(
        "flex items-start gap-2 rounded-xl border p-3 text-sm",
        state.kind === "ok"
          ? "border-primary/30 bg-primary/5 text-primary"
          : "border-destructive/30 bg-destructive/5 text-destructive"
      )}
    >
      {state.kind === "ok" ? (
        <CheckCircle2Icon className="mt-0.5 size-4 shrink-0" />
      ) : (
        <AlertCircleIcon className="mt-0.5 size-4 shrink-0" />
      )}
      {state.text}
    </div>
  );
}
