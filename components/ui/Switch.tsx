"use client";

import { cn } from "@/lib/utils";

export interface SwitchProps {
  on: boolean;
  onChange?: (value: boolean) => void;
  disabled?: boolean;
  label?: string;
}

export function Switch({ on, onChange, disabled }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      disabled={disabled}
      onClick={() => onChange?.(!on)}
      className={cn(
        "relative h-5 w-[38px] shrink-0 rounded-full transition-colors",
        on ? "bg-faxa-amarelo" : "bg-faxa-cinza-claro",
        disabled ? "cursor-not-allowed opacity-70" : "cursor-pointer"
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 h-4 w-4 rounded-full bg-faxa-branco transition-all",
          on ? "left-[20px]" : "left-0.5"
        )}
      />
    </button>
  );
}
