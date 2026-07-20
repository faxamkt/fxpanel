export const POST_STATUS_VALUES = [
  "Copy V4",
  "Layout V4",
  "Falta material",
  "Em aprovação Cliente",
  "Ajustar",
  "Aprovado para publicação",
  "Publicado",
] as const;

export type PostStatus = (typeof POST_STATUS_VALUES)[number];

export const POST_TIPO_VALUES = ["Social media", "Vídeo", "E-mail"] as const;
export type PostTipo = (typeof POST_TIPO_VALUES)[number];

export const POST_FORMATO_VALUES = ["Estático", "Carrossel", "Reels"] as const;
export type PostFormato = (typeof POST_FORMATO_VALUES)[number];

export const APPROVAL_STEP_TIPO_VALUES = ["Temática", "Texto", "Arte"] as const;
export type ApprovalStepTipo = (typeof APPROVAL_STEP_TIPO_VALUES)[number];

export type AutorTipo = "admin" | "cliente";

export interface Client {
  id: string;
  nome: string;
  slug: string;
  token_acesso: string;
  criado_em: string;
}

export interface ApprovalStep {
  id: string;
  post_id: string;
  tipo: ApprovalStepTipo;
  aprovado: boolean;
  atualizado_em: string;
}

export interface Post {
  id: string;
  client_id: string;
  titulo: string;
  tipo: PostTipo;
  formato: PostFormato;
  data_agendada: string; // yyyy-mm-dd
  briefing: string;
  status: PostStatus;
  link_copy: string | null;
  link_imagem: string | null;
  link_video: string | null;
  link_drive: string | null;
  criado_em: string;
  atualizado_em: string;
  approval_steps: ApprovalStep[];
}

/** Visão enxuta de uma etapa de aprovação, como retornada pelas funções RPC do portal do cliente. */
export interface ClientApprovalStep {
  id: string;
  tipo: ApprovalStepTipo;
  aprovado: boolean;
}

/** Visão de post exposta ao cliente via RPC (sem client_id/criado_em, que não interessam nesse contexto). */
export interface ClientPost {
  id: string;
  titulo: string;
  tipo: PostTipo;
  formato: PostFormato;
  data_agendada: string;
  briefing: string;
  status: PostStatus;
  link_copy: string | null;
  link_imagem: string | null;
  link_video: string | null;
  link_drive: string | null;
  approval_steps: ClientApprovalStep[];
}

export interface Comment {
  id: string;
  post_id: string;
  autor: string;
  autor_tipo: AutorTipo;
  mensagem: string;
  criado_em: string;
}

export interface NewPostInput {
  client_id: string;
  titulo: string;
  tipo: PostTipo;
  formato: PostFormato;
  data_agendada: string;
  briefing: string;
  status: PostStatus;
}

export interface UpdatePostInput {
  id: string;
  titulo: string;
  tipo: PostTipo;
  formato: PostFormato;
  data_agendada: string;
  briefing: string;
  status: PostStatus;
  link_copy: string | null;
  link_imagem: string | null;
  link_video: string | null;
  link_drive: string | null;
}
