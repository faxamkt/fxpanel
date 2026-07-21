"use client";

import { useState } from "react";
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
}: {
  value: AssetLinksValue;
  onChange: (next: AssetLinksValue) => void;
  postId: string;
}) {
  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(key: keyof AssetLinksValue, file: File) {
    setUploadingField(key);
    setError(null);
    try {
      const url = await uploadPostAsset(file, postId, key);
      onChange({ ...value, [key]: url });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao enviar arquivo.");
    } finally {
      setUploadingField(null);
    }
  }

  return (
    <div className="mb-3.5">
      <FieldLabel>Links de assets</FieldLabel>
      {error && <p className="mb-2 text-xs text-faxa-alerta">{error}</p>}
      <div className="space-y-2">
        {ASSET_FIELDS.map(({ key, label, icon, accept }) => (
          <div key={key} className="flex items-center gap-2">
            <TextInput
              placeholder={`${icon} ${label}`}
              value={value[key] ?? ""}
              onChange={(e) => onChange({ ...value, [key]: e.target.value })}
              className="flex-1"
            />
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
