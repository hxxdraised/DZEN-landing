import type { Metadata } from "next";
import { LoginForm } from "@/components/admin/login-form";

export const metadata: Metadata = {
  title: "Вход в админ-панель",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-secondary/30 px-4">
      <div className="w-full max-w-sm rounded-2xl border bg-card p-8 shadow-sm">
        <h1 className="font-display text-2xl font-semibold">Админ-панель DZEN</h1>
        <p className="mt-1 mb-6 text-sm text-muted-foreground">
          Войдите, чтобы управлять сайтом и интеграциями
        </p>
        <LoginForm />
      </div>
    </div>
  );
}
