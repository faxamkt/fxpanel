import { formatMonthLabel } from "@/lib/calendar";

export interface MonthNavProps {
  year: number;
  month: number;
  onPrev: () => void;
  onNext: () => void;
  badge?: string;
}

export function MonthNav({ year, month, onPrev, onNext, badge }: MonthNavProps) {
  return (
    <div className="flex items-center justify-center gap-4.5 border-b border-faxa-cinza-claro bg-faxa-branco py-4">
      <button
        onClick={onPrev}
        aria-label="Mês anterior"
        className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-faxa-cinza-claro bg-faxa-cinza-bg text-sm text-faxa-preto hover:border-faxa-amarelo"
      >
        ‹
      </button>
      <h2 className="m-0 text-[17px] tracking-wide capitalize">{formatMonthLabel(year, month)}</h2>
      <button
        onClick={onNext}
        aria-label="Próximo mês"
        className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-faxa-cinza-claro bg-faxa-cinza-bg text-sm text-faxa-preto hover:border-faxa-amarelo"
      >
        ›
      </button>
      {badge && (
        <span className="ml-3.5 rounded-full bg-faxa-cinza-bg px-2.5 py-1 text-[11px] text-faxa-cinza-3">
          {badge}
        </span>
      )}
    </div>
  );
}
