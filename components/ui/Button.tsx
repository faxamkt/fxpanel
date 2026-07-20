import { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "yellow" | "outline" | "dark" | "success" | "danger" | "ghost";
}

const VARIANT_CLASSES: Record<NonNullable<ButtonProps["variant"]>, string> = {
  yellow: "bg-faxa-amarelo text-faxa-preto hover:bg-faxa-amarelo-escuro",
  outline:
    "bg-transparent text-faxa-branco border border-faxa-cinza-2 hover:border-faxa-amarelo hover:text-faxa-amarelo",
  dark: "bg-faxa-preto text-faxa-branco hover:bg-black",
  success: "bg-faxa-sucesso text-faxa-branco hover:brightness-95",
  danger: "bg-faxa-alerta text-faxa-branco hover:brightness-95",
  ghost: "bg-transparent text-faxa-cinza-3 hover:text-faxa-preto",
};

export function Button({ variant = "yellow", className, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold cursor-pointer transition-colors disabled:cursor-not-allowed disabled:opacity-50",
        VARIANT_CLASSES[variant],
        className
      )}
      {...props}
    />
  );
}
