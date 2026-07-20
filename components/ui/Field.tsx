import {
  InputHTMLAttributes,
  LabelHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";
import { cn } from "@/lib/utils";

export function FieldWrap({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="mb-3.5">
      <FieldLabel>{label}</FieldLabel>
      {children}
    </div>
  );
}

export function FieldLabel(props: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      {...props}
      className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-faxa-cinza-3"
    />
  );
}

const controlClasses =
  "w-full rounded-lg border border-faxa-cinza-claro bg-faxa-cinza-bg px-2.5 py-2 text-sm text-faxa-preto outline-none focus:border-faxa-amarelo disabled:text-faxa-cinza-3 disabled:cursor-not-allowed";

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn(controlClasses, props.className)} />;
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={cn(controlClasses, "min-h-[70px] resize-y", props.className)} />;
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={cn(controlClasses, "cursor-pointer", props.className)} />;
}

export function Row2({ children }: { children: ReactNode }) {
  return <div className="flex gap-2.5">{children}</div>;
}
