import { STATUS_LEGEND, STATUS_STYLES } from "@/lib/status";

export function Legend() {
  return (
    <div className="flex flex-wrap gap-4 px-6 pb-4.5 text-[11px] text-faxa-cinza-3">
      {STATUS_LEGEND.map(({ status, label }) => (
        <span key={status} className="flex items-center gap-1.5">
          <i className={`inline-block h-2.5 w-2.5 rounded-[3px] ${STATUS_STYLES[status].legendDot}`} />
          {label}
        </span>
      ))}
    </div>
  );
}
