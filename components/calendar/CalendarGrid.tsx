import { getCalendarDays, isSameMonthAs, isToday, toDateKey, WEEKDAY_LABELS } from "@/lib/calendar";
import { PostCard, PostCardSummary } from "./PostCard";
import { cn } from "@/lib/utils";

export interface CalendarPost extends PostCardSummary {
  data_agendada: string;
}

export interface CalendarGridProps {
  year: number;
  month: number;
  posts: CalendarPost[];
  isAdmin: boolean;
  onAddDay?: (dateKey: string) => void;
  onPostClick: (postId: string) => void;
}

export function CalendarGrid({ year, month, posts, isAdmin, onAddDay, onPostClick }: CalendarGridProps) {
  const days = getCalendarDays(year, month);
  const postsByDay = new Map<string, CalendarPost[]>();
  for (const post of posts) {
    const list = postsByDay.get(post.data_agendada) ?? [];
    list.push(post);
    postsByDay.set(post.data_agendada, list);
  }

  return (
    <div className="overflow-x-auto">
      <div className="grid min-w-[720px] grid-cols-7 overflow-hidden rounded-[10px] border border-faxa-cinza-claro bg-faxa-branco">
        {WEEKDAY_LABELS.map((label) => (
          <div
            key={label}
            className="bg-faxa-preto py-2.5 text-center text-[11px] font-bold tracking-wider text-faxa-cinza-claro"
          >
            {label}
          </div>
        ))}

        {days.map((date) => {
          const dateKey = toDateKey(date);
          const inMonth = isSameMonthAs(date, year, month);
          const today = isToday(date);
          const dayPosts = postsByDay.get(dateKey) ?? [];

          return (
            <div
              key={dateKey}
              className={cn(
                "group relative min-h-[118px] border-r border-b border-faxa-cinza-claro/70 p-2 last:border-r-0",
                inMonth ? "bg-faxa-branco" : "bg-faxa-cinza-bg/60 text-faxa-cinza-3/60"
              )}
            >
              <div
                className={cn(
                  "mb-1.5 text-xs font-semibold text-faxa-cinza-3",
                  today && "flex h-5 w-5 items-center justify-center rounded-full bg-faxa-amarelo text-faxa-preto"
                )}
              >
                {date.getDate()}
              </div>

              {isAdmin && inMonth && onAddDay && (
                <button
                  onClick={() => onAddDay(dateKey)}
                  aria-label="Nova demanda"
                  className="absolute top-1.5 right-1.5 hidden h-5 w-5 cursor-pointer items-center justify-center rounded-full bg-faxa-preto text-xs leading-none text-faxa-amarelo group-hover:flex"
                >
                  +
                </button>
              )}

              {dayPosts.map((post) => (
                <PostCard key={post.id} post={post} onClick={() => onPostClick(post.id)} />
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
