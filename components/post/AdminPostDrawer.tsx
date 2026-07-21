"use client";

import { useEffect, useState, useTransition } from "react";
import { Drawer } from "@/components/ui/Drawer";
import { FieldWrap, Row2, Select, TextInput, Textarea } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { ApprovalSteps } from "@/components/post/ApprovalSteps";
import { AssetLinksEditable, AssetLinksValue } from "@/components/post/AssetLinks";
import { CommentsThread } from "@/components/post/CommentsThread";
import {
  Comment,
  POST_FORMATO_VALUES,
  POST_STATUS_VALUES,
  POST_TIPO_VALUES,
  Post,
  PostFormato,
  PostStatus,
  PostTipo,
} from "@/lib/types";
import {
  addAdminComment,
  createPost,
  deletePost,
  getPostComments,
  toggleApprovalStep,
  updatePost,
} from "@/lib/actions/posts";

export interface AdminPostDrawerProps {
  open: boolean;
  clientId: string;
  post: Post | null;
  defaultDate: string | null;
  adminName: string;
  onClose: () => void;
  onSaved: () => void;
  onDeleted: () => void;
}

interface FormState {
  titulo: string;
  tipo: PostTipo;
  formato: PostFormato;
  data_agendada: string;
  briefing: string;
  status: PostStatus;
}

function emptyForm(defaultDate: string | null): FormState {
  return {
    titulo: "",
    tipo: "Social media",
    formato: "Estático",
    data_agendada: defaultDate ?? new Date().toISOString().slice(0, 10),
    briefing: "",
    status: "Copy V4",
  };
}

function formFromPost(post: Post): FormState {
  return {
    titulo: post.titulo,
    tipo: post.tipo,
    formato: post.formato,
    data_agendada: post.data_agendada,
    briefing: post.briefing,
    status: post.status,
  };
}

export function AdminPostDrawer({
  open,
  clientId,
  post,
  defaultDate,
  adminName,
  onClose,
  onSaved,
  onDeleted,
}: AdminPostDrawerProps) {
  const isEdit = Boolean(post);
  const [form, setForm] = useState<FormState>(() => (post ? formFromPost(post) : emptyForm(defaultDate)));
  const [assets, setAssets] = useState<AssetLinksValue>({
    link_copy: post?.link_copy ?? null,
    link_imagem: post?.link_imagem ?? null,
    link_video: post?.link_video ?? null,
    link_drive: post?.link_drive ?? null,
  });
  const [steps, setSteps] = useState(post?.approval_steps ?? []);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isPending, startTransition] = useTransition();
  const [isLoadingComments, startCommentsTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // O AdminShell troca a `key` deste componente a cada post/dia diferente,
  // então o estado acima já nasce correto no mount — não precisa de effect pra resetar.

  useEffect(() => {
    if (!open || !post) return;
    startCommentsTransition(async () => {
      setComments(await getPostComments(post.id));
    });
  }, [open, post]);

  function handleToggleStep(stepId: string, aprovado: boolean) {
    setSteps((prev) => prev.map((s) => (s.id === stepId ? { ...s, aprovado } : s)));
    startTransition(async () => {
      await toggleApprovalStep(stepId, aprovado);
    });
  }

  async function handleAddComment(mensagem: string) {
    if (!post) return;
    await addAdminComment(post.id, adminName, mensagem);
    const updated = await getPostComments(post.id);
    setComments(updated);
  }

  function handleSave() {
    if (!form.titulo.trim()) {
      setError("Informe o nome da tarefa.");
      return;
    }
    setError(null);
    startTransition(async () => {
      try {
        if (isEdit && post) {
          await updatePost({ id: post.id, ...form, ...assets });
        } else {
          await createPost({ client_id: clientId, ...form });
        }
        onSaved();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Erro ao salvar.");
      }
    });
  }

  function handleDelete() {
    if (!post) return;
    if (!confirm("Excluir esta demanda? Essa ação não pode ser desfeita.")) return;
    startTransition(async () => {
      await deletePost(post.id);
      onDeleted();
    });
  }

  return (
    <Drawer
      open={open}
      title={isEdit ? form.titulo || "Editar demanda" : "Nova Demanda"}
      onClose={onClose}
      footer={
        <div className="space-y-2">
          {error && <p className="text-xs text-faxa-alerta">{error}</p>}
          <Button variant="dark" className="w-full justify-center" onClick={handleSave} disabled={isPending}>
            Salvar Demanda
          </Button>
          {isEdit && (
            <Button variant="ghost" className="w-full justify-center" onClick={handleDelete} disabled={isPending}>
              Excluir demanda
            </Button>
          )}
        </div>
      }
    >
      <FieldWrap label="Nome da tarefa">
        <TextInput
          placeholder="Temática da postagem..."
          value={form.titulo}
          onChange={(e) => setForm({ ...form, titulo: e.target.value })}
        />
      </FieldWrap>

      <Row2>
        <FieldWrap label="Tipo">
          <Select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value as PostTipo })}>
            {POST_TIPO_VALUES.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </Select>
        </FieldWrap>
        <FieldWrap label="Formato">
          <Select
            value={form.formato}
            onChange={(e) => setForm({ ...form, formato: e.target.value as PostFormato })}
          >
            {POST_FORMATO_VALUES.map((f) => (
              <option key={f}>{f}</option>
            ))}
          </Select>
        </FieldWrap>
      </Row2>

      <FieldWrap label="Data agendada">
        <TextInput
          type="date"
          value={form.data_agendada}
          onChange={(e) => setForm({ ...form, data_agendada: e.target.value })}
        />
      </FieldWrap>

      <FieldWrap label="Briefing">
        <Textarea
          placeholder="Diretrizes e informações relevantes..."
          value={form.briefing}
          onChange={(e) => setForm({ ...form, briefing: e.target.value })}
        />
      </FieldWrap>

      <FieldWrap label="Status">
        <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as PostStatus })}>
          {POST_STATUS_VALUES.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </Select>
      </FieldWrap>

      {isEdit && post && (
        <>
          <ApprovalSteps steps={steps} onToggle={handleToggleStep} />
          <AssetLinksEditable value={assets} onChange={setAssets} postId={post.id} />
          <CommentsThread comments={comments} loading={isLoadingComments} onSubmit={handleAddComment} />
        </>
      )}
    </Drawer>
  );
}
