"use client";

import { useEffect, useState, useTransition } from "react";
import { Drawer } from "@/components/ui/Drawer";
import { FieldWrap, Row2, TextInput, Textarea } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { ApprovalSteps } from "@/components/post/ApprovalSteps";
import { AssetLinksReadOnly } from "@/components/post/AssetLinks";
import { CommentsThread } from "@/components/post/CommentsThread";
import { Comment, ClientPost } from "@/lib/types";
import { formatFullDate } from "@/lib/calendar";
import { approvePost, getClientPostComments, requestAdjustment } from "@/lib/actions/client-portal";

export interface ClientPostDrawerProps {
  open: boolean;
  token: string;
  post: ClientPost | null;
  onClose: () => void;
  onChanged: () => void;
}

export function ClientPostDrawer({ open, token, post, onClose, onChanged }: ClientPostDrawerProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoadingComments, startCommentsTransition] = useTransition();
  const [askingAdjustment, setAskingAdjustment] = useState(false);
  const [adjustmentMsg, setAdjustmentMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // O ClientShell troca a `key` deste componente a cada post selecionado,
  // então askingAdjustment/adjustmentMsg/error já nascem zerados no mount.

  useEffect(() => {
    if (!open || !post) return;
    startCommentsTransition(async () => {
      setComments(await getClientPostComments(token, post.id));
    });
  }, [open, post, token]);

  if (!post) {
    return <Drawer open={open} title="" onClose={onClose}><span /></Drawer>;
  }

  async function handleApprove() {
    if (!post) return;
    setSubmitting(true);
    setError(null);
    try {
      await approvePost(token, post.id);
      onChanged();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao aprovar.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSendAdjustment() {
    if (!post || !adjustmentMsg.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      await requestAdjustment(token, post.id, adjustmentMsg.trim());
      onChanged();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao enviar solicitação.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Drawer
      open={open}
      title={post.titulo}
      onClose={onClose}
      footer={
        askingAdjustment ? (
          <div className="space-y-2">
            <Textarea
              autoFocus
              placeholder="Descreva o que precisa ser ajustado..."
              value={adjustmentMsg}
              onChange={(e) => setAdjustmentMsg(e.target.value)}
            />
            {error && <p className="text-xs text-faxa-alerta">{error}</p>}
            <div className="flex gap-2.5">
              <Button variant="ghost" className="flex-1 justify-center" onClick={() => setAskingAdjustment(false)}>
                Cancelar
              </Button>
              <Button
                variant="danger"
                className="flex-1 justify-center"
                onClick={handleSendAdjustment}
                disabled={submitting || !adjustmentMsg.trim()}
              >
                Enviar solicitação
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {error && <p className="text-xs text-faxa-alerta">{error}</p>}
            <div className="flex gap-2.5">
              <Button variant="success" className="flex-1 justify-center" onClick={handleApprove} disabled={submitting}>
                ✓ Aprovar
              </Button>
              <Button
                variant="danger"
                className="flex-1 justify-center"
                onClick={() => setAskingAdjustment(true)}
                disabled={submitting}
              >
                Pedir ajuste
              </Button>
            </div>
          </div>
        )
      }
    >
      <Row2>
        <FieldWrap label="Tipo">
          <TextInput value={post.tipo} disabled />
        </FieldWrap>
        <FieldWrap label="Formato">
          <TextInput value={post.formato} disabled />
        </FieldWrap>
      </Row2>

      <FieldWrap label="Data agendada">
        <TextInput value={formatFullDate(post.data_agendada)} disabled />
      </FieldWrap>

      <FieldWrap label="Briefing">
        <Textarea value={post.briefing} disabled />
      </FieldWrap>

      <FieldWrap label="Status atual">
        <TextInput value={post.status} disabled />
      </FieldWrap>

      <ApprovalSteps steps={post.approval_steps} readOnly />
      <AssetLinksReadOnly value={post} />
      <CommentsThread comments={comments} loading={isLoadingComments} />

      <p className="text-[11px] text-faxa-cinza-3">
        Comentários e aprovação ficam disponíveis para o cliente diretamente aqui.
      </p>
    </Drawer>
  );
}
