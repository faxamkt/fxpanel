"use client";

import { useRef, useState } from "react";
import { TextInput, FieldLabel } from "@/components/ui/Field";
import { uploadPostAsset } from "@/lib/supabase/storage";

export interface AssetLinksValue {
  link_copy: string | null;
  link_imagem: string | null;
  link_video: string | null;
  link_drive: string | null;
}

const ASSET_FIELDS: { key: keyof AssetLinksValue; label: string; icon: string; accept?: string }[] = [
  { key: "link_copy", label: "Link da Copy", icon: "📄", accept: ".pdf,.doc,.docx,.txt" },
  { key: "link_imagem", label: "Link Imagem/Capa", icon: "🖼", accept: "image/*" },
  { key: "link_video", label: "Link do Vídeo", icon: "🎬", accept: "video/*" },
  { key: "link_drive", label: "Link Google Drive", icon: "📁" },
];

export function AssetLinksEditable({
  value,
  onChange,
  postId,
  onUploadingChange,
}: {
  value: AssetLinksValue;
  onChange: (next: AssetLinksValue) => void;
  postId?: string;
  onUploadingChange?: (uploading: boolean) => void;
}) {
  const draftId = useRef<string | null>(null);
  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(key: keyof AssetLinksValue, file: File) {
    setUploadingField(key);
    onUploadingChange?.(true);
    setError(null);
    try {
      draftId.current ??= crypto.randomUUID();
      const url = await uploadPostAsset(file, postId ?? draftId.current, key);
      onChange({ ...value, [key]: url });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao enviar arquivo.");
    } finally {
      setUploadingField(null);
      onUploadingChange?.(false);
    }
  }

  return (
    <div className="mb-3.5">
      <FieldLabel>Links de assets</FieldLabel>
      {error && <p className="mb-2 text-xs text-faxa-alerta">{error}</p>}
      <div className="space-y-2">
        {ASSET_FIELDS.map(({ key, label, icon, accept }) => (
          <div key={key}>
          <div className="flex items-center gap-2">
            <TextInput
              placeholder={`${icon} ${label}`}
              value={value[key] ?? ""}
              onChange={(e) => onChange({ ...value, [key]: e.target.value })}
              aria-label={label}
              disabled={uploadingField !== null}
              className="min-w-0 flex-1"
            />
            {assetUrl(value[key]) ? (
              <a
                href={assetUrl(value[key])!}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Abrir ${label}`}
                title={`Abrir ${label}`}
                className="shrink-0 rounded-lg border border-faxa-cinza-claro px-2.5 py-2 text-xs font-semibold text-faxa-cinza-3 hover:border-faxa-amarelo hover:text-faxa-preto"
              >
                ↗
              </a>
            ) : (
              <button type="button" disabled aria-label={`Abrir ${label}`} className="shrink-0 rounded-lg border border-faxa-cinza-claro px-2.5 py-2 text-xs text-faxa-cinza-3 opacity-40">↗</button>
            )}
            <label className="shrink-0 cursor-pointer rounded-lg border border-faxa-cinza-claro px-2.5 py-2 text-xs font-semibold text-faxa-cinza-3 hover:border-faxa-amarelo hover:text-faxa-preto has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-50">
              {uploadingField === key ? "Enviando…" : "Upload"}
              <input
                type="file"
                accept={accept}
                className="hidden"
                disabled={uploadingField !== null}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  e.target.value = "";
                  if (file) handleFile(key, file);
                }}
              />
            </label>
          </div>
          {key === "link_imagem" && <ImagePreview key={value.link_imagem} url={value.link_imagem} />}
          </div>
        ))}
      </div>
    </div>
  );
}

export function AssetLinksReadOnly({ value }: { value: AssetLinksValue }) {
  return (
    <div className="mb-3.5">
      {ASSET_FIELDS.map(({ key, label, icon }) => {
        const url = value[key];
        const content = (
          <>
            <span>
              {icon} {label}
            </span>
            <span>{url ? "→" : "—"}</span>
          </>
        );
        const rowClass =
          "mb-2 flex items-center justify-between rounded-lg border border-faxa-cinza-claro px-2.5 py-2 text-sm text-faxa-cinza-3 last:mb-0";
        return url ? (
          <a
            key={key}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className={`${rowClass} hover:border-faxa-amarelo hover:text-faxa-preto`}
          >
            {content}
          </a>
        ) : (
          <div key={key} className={rowClass}>
            {content}
          </div>
        );
      })}
    </div>
  );
}

function assetUrl(value: string | null): string | null {
  if (!value?.trim()) return null;
  try {
    const url = new URL(value.trim());
    return ["http:", "https:"].includes(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
}

function ImagePreview({ url }: { url: string | null }) {
  const [failed, setFailed] = useState(false);
  const src = assetUrl(url);
  if (!src) return null;
  if (failed) return <p className="mt-2 text-xs text-faxa-cinza-3">Não foi possível carregar a miniatura. Use um link direto para a imagem.</p>;
  return (
    <a href={src} target="_blank" rel="noopener noreferrer" className="mt-2 block w-fit overflow-hidden rounded-lg border border-faxa-cinza-claro" aria-label="Abrir imagem em tamanho original">
      {/* URLs de assets são externas e dinâmicas; a prévia carrega diretamente no navegador. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="Miniatura da imagem ou capa" className="max-h-40 max-w-full object-contain" onError={() => setFailed(true)} />
    </a>
  );
}
