"use client";

import type { VariantProps } from "class-variance-authority";
import { Button } from "@/components/ui/button";
import { useLead } from "@/components/lead/lead-provider";

type ButtonVariant = NonNullable<VariantProps<typeof Button>["variant"]>;
type ButtonSize = NonNullable<VariantProps<typeof Button>["size"]>;

interface LeadButtonProps {
  source: string;
  label?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children?: React.ReactNode;
}

export function LeadButton({
  source,
  label = "Записаться",
  variant = "default",
  size = "default",
  className,
  children,
}: LeadButtonProps) {
  const { open } = useLead();

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      className={className}
      onClick={() => open(source)}
    >
      {children ?? label}
    </Button>
  );
}
