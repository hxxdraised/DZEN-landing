"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

const WIDGET_SCRIPT_SRC = "https://otzyvist.ru/w.js";

interface ReviewsWidgetProps {
  widgetId: string;
  className?: string;
}

export function ReviewsWidget({ widgetId, className }: ReviewsWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    let cancelled = false;

    const loadScript = () => {
      if (cancelled) return;

      document
        .querySelectorAll<HTMLScriptElement>(`script[src="${WIDGET_SCRIPT_SRC}"]`)
        .forEach((s) => s.remove());

      const script = document.createElement("script");
      script.src = WIDGET_SCRIPT_SRC;
      script.async = true;
      document.body.appendChild(script);
    };

    if (typeof IntersectionObserver === "undefined") {
      loadScript();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          observer.disconnect();
          loadScript();
        }
      },
      { rootMargin: "600px" }
    );
    observer.observe(node);

    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, []);

  return <div ref={containerRef} className={cn("rw-widget", className)} data-widget={widgetId} />;
}
