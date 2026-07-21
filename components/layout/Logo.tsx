import Image from "next/image";

export function Logo({ subtitle }: { subtitle: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <Image src="/logo.png" alt="faxa" width={34} height={34} className="shrink-0" priority />
      <div>
        <div className="text-[15px] font-bold tracking-wide">faxa · Calendário Editorial</div>
        <div className="text-[11px] text-faxa-cinza-3">{subtitle}</div>
      </div>
    </div>
  );
}
