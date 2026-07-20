import {
  addDays,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth as dfIsSameMonth,
  isToday as dfIsToday,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { ptBR } from "date-fns/locale";

export const WEEKDAY_LABELS = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"];

/** Sempre retorna 42 dias (6 semanas), igual ao protótipo, pra manter a grade estável. */
export function getCalendarDays(year: number, month: number): Date[] {
  const monthStart = startOfMonth(new Date(year, month - 1, 1));
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 0 });

  const days: Date[] = [];
  for (let i = 0; i < 42; i++) {
    days.push(addDays(gridStart, i));
  }
  return days;
}

export function formatMonthLabel(year: number, month: number): string {
  const label = format(new Date(year, month - 1, 1), "MMMM yyyy", { locale: ptBR });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function isSameMonthAs(date: Date, year: number, month: number): boolean {
  return dfIsSameMonth(date, new Date(year, month - 1, 1));
}

export function isToday(date: Date): boolean {
  return dfIsToday(date);
}

export function toDateKey(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

export function formatFullDate(dateKey: string): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  return format(new Date(y, m - 1, d), "d 'de' MMMM, yyyy", { locale: ptBR });
}

export { isSameDay, endOfMonth, endOfWeek };
