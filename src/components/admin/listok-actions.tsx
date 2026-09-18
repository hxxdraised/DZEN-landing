"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { PlugZapIcon, UnplugIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ListokActions({ connected }: { connected: boolean }) {
  const router = useRouter();
  const [disconnecting, setDisconnecting] = useState(false);

  const handleDisconnect = async () => {
    if (disconnecting) return;
    setDisconnecting(true);
    await fetch("/api/admin/listok/disconnect", { method: "POST" }).catch(() => undefined);
    setDisconnecting(false);
    router.refresh();
  };

  return (
    <div className="flex flex-wrap gap-3">
      <Button onClick={() => (window.location.href = "/api/listok/auth")}>
        <PlugZapIcon className="size-4" />
        {connected ? "Обновить авторизацию" : "Подключить Listok"}
      </Button>
      {connected && (
        <Button variant="outline" onClick={handleDisconnect} disabled={disconnecting}>
          <UnplugIcon className="size-4" />
          {disconnecting ? "Отключаем…" : "Отключить"}
        </Button>
      )}
    </div>
  );
}
