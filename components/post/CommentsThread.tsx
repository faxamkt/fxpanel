"use client";

import { useState } from "react";
import { Comment } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Field";
import { cn } from "@/lib/utils";

function formatTimestamp(iso: string) {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function CommentsThread({
  comments,
  loading,
  onSubmit,
}: {
  comments: Comment[];
  loading?: boolean;
  onSubmit?: (mensagem: string) => Promise<void>;
}) {
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);

  async function handleSend() {
    if (!draft.trim() || !onSubmit) return;
    setSending(true);
    try {
      await onSubmit(draft.trim());
      setDraft("");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="mb-3.5">
      <div className="mb-2 text-[11px] font-bold tracking-wide text-faxa-cinza-3 uppercase">
        Comentários
      </div>

      <div className="mb-2.5 space-y-2">
        {loading && <p className="text-xs text-faxa-cinza-3">Carregando comentários…</p>}
        {!loading && comments.length === 0 && (
          <p className="text-xs text-faxa-cinza-3">Nenhum comentário ainda.</p>
        )}
        {comments.map((comment) => (
          <div
            key={comment.id}
            className={cn(
              "rounded-lg border px-3 py-2 text-sm",
              comment.autor_tipo === "cliente"
                ? "border-faxa-amarelo/40 bg-faxa-copy-bg"
                : "border-faxa-cinza-claro bg-faxa-cinza-bg"
            )}
          >
            <div className="mb-0.5 flex items-center justify-between text-[11px] font-semibold text-faxa-cinza-3">
              <span>
                {comment.autor} · {comment.autor_tipo === "cliente" ? "cliente" : "equipe faxa"}
              </span>
              <span>{formatTimestamp(comment.criado_em)}</span>
            </div>
            <p className="text-faxa-preto">{comment.mensagem}</p>
          </div>
        ))}
      </div>

      {onSubmit && (
        <div className="flex gap-2">
          <Textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Escrever um comentário..."
            className="min-h-[44px]"
          />
          <Button variant="dark" onClick={handleSend} disabled={sending || !draft.trim()}>
            Enviar
          </Button>
        </div>
      )}
    </div>
  );
}
