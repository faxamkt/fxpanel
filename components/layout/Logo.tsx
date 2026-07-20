export function Logo({ subtitle }: { subtitle: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex h-8.5 w-8.5 items-center justify-center rounded-lg bg-faxa-amarelo text-lg font-extrabold text-faxa-preto">
        f
      </div>
      <div>
        <div className="text-[15px] font-bold tracking-wide">faxa · Calendário Editorial</div>
        <div className="text-[11px] text-faxa-cinza-3">{subtitle}</div>
      </div>
    </div>
  );
}
