import { PostStatus } from "./types";

interface StatusStyle {
  card: string;
  border: string;
  label: string;
  legendDot: string;
}

export const STATUS_STYLES: Record<PostStatus, StatusStyle> = {
  "Copy FX": {
    card: "bg-faxa-copy-bg",
    border: "border-l-faxa-amarelo",
    label: "text-faxa-amarelo-escuro",
    legendDot: "bg-faxa-amarelo",
  },
  "Layout FX": {
    card: "bg-faxa-layout-bg",
    border: "border-l-faxa-cinza-2",
    label: "text-faxa-cinza-2",
    legendDot: "bg-faxa-cinza-2",
  },
  "Falta material": {
    card: "bg-faxa-alerta-bg",
    border: "border-l-faxa-alerta",
    label: "text-faxa-alerta",
    legendDot: "bg-faxa-alerta",
  },
  "Em aprovação Cliente": {
    card: "bg-faxa-aprovacao-bg",
    border: "border-l-faxa-cinza-3",
    label: "text-faxa-aprovacao",
    legendDot: "bg-faxa-aprovacao",
  },
  Ajustar: {
    card: "bg-faxa-alerta-bg",
    border: "border-l-faxa-alerta",
    label: "text-faxa-alerta",
    legendDot: "bg-faxa-alerta",
  },
  "Aprovado para publicação": {
    card: "bg-faxa-sucesso-bg",
    border: "border-l-faxa-sucesso",
    label: "text-faxa-sucesso",
    legendDot: "bg-faxa-sucesso",
  },
  Publicado: {
    card: "bg-faxa-preto text-faxa-branco",
    border: "border-l-faxa-amarelo",
    label: "text-faxa-amarelo",
    legendDot: "bg-faxa-preto",
  },
};

export const STATUS_LEGEND: { status: PostStatus; label: string }[] = [
  { status: "Copy FX", label: "Copy FX" },
  { status: "Layout FX", label: "Layout FX" },
  { status: "Falta material", label: "Falta material / Ajustar" },
  { status: "Em aprovação Cliente", label: "Em aprovação Cliente" },
  { status: "Aprovado para publicação", label: "Aprovado" },
  { status: "Publicado", label: "Publicado" },
];
