"use client";

import { ReactNode, useEffect } from "react";
import { cn } from "@/lib/utils";

export interface DrawerProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}

export function Drawer({ open, title, onClose, children, footer }: DrawerProps) {
  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/45 transition-opacity",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={onClose}
      />
      <div
        className={cn(
          "fixed top-0 right-0 z-50 flex h-full w-full max-w-[420px] flex-col bg-faxa-branco shadow-2xl transition-transform duration-200 ease-out",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex items-center justify-between border-b-[3px] border-faxa-amarelo bg-faxa-preto px-5 py-4 text-faxa-branco">
          <h3 className="truncate text-[15px] font-semibold">{title}</h3>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="cursor-pointer text-lg text-faxa-branco/80 hover:text-faxa-amarelo"
          >
            ✕
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4.5">{children}</div>
        {footer && <div className="border-t border-faxa-cinza-claro px-5 py-4">{footer}</div>}
      </div>
    </>
  );
}
