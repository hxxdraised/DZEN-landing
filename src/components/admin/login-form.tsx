"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { AlertCircleIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SecretInput } from "@/components/admin/secret-input";

export function LoginForm() {
  const router = useRouter();
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!login || !password || loading) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login, password }),
      });
      const data = (await response.json().catch(() => null)) as { ok?: boolean; error?: string } | null;

      if (response.ok && data?.ok) {
        router.replace("/admin");
        router.refresh();
      } else {
        setError(data?.error ?? "Ошибка входа");
      }
    } catch {
      setError("Нет соединения с сервером");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">Логин</span>
        <input
          type="text"
          value={login}
          onChange={(e) => setLogin(e.target.value)}
          autoComplete="username"
          className="h-11 rounded-xl border border-border bg-card px-4 text-sm outline-none transition-colors focus:border-primary"
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">Пароль</span>
        <SecretInput
          value={password}
          onChange={setPassword}
          placeholder="Введите пароль"
          autoComplete="current-password"
        />
      </label>

      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          <AlertCircleIcon className="mt-0.5 size-4 shrink-0" />
          {error}
        </div>
      )}

      <Button type="submit" size="lg" disabled={!login || !password || loading} className="w-full">
        {loading ? "Проверяем…" : "Войти"}
      </Button>
    </form>
  );
}
