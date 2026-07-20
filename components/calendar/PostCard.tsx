import { PostFormato, PostStatus, PostTipo } from "@/lib/types";
import { STATUS_STYLES } from "@/lib/status";
import { cn } from "@/lib/utils";

export interface PostCardSummary {
  id: string;
  titulo: string;
  tipo: PostTipo;
  formato: PostFormato;
  status: PostStatus;
}

export function PostCard({ post, onClick }: { post: PostCardSummary; onClick: () => void }) {
  const style = STATUS_STYLES[post.status];
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "mb-1.5 block w-full cursor-pointer rounded-md border-l-[3px] px-2 py-1.5 text-left text-[11px] transition-transform hover:-translate-y-px",
        style.card,
        style.border
      )}
    >
      <div className="mb-0.5 flex items-center gap-1 font-bold">{post.titulo}</div>
      <div className={cn("text-[10px]", post.status === "Publicado" ? "text-faxa-cinza-claro/70" : "text-faxa-cinza-3")}>
        {post.tipo} · {post.formato}
      </div>
      <div className={cn("mt-1 inline-block text-[9.5px] font-bold", style.label)}>{post.status}</div>
    </button>
  );
}
