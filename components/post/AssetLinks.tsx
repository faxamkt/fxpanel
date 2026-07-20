import { TextInput, FieldLabel } from "@/components/ui/Field";

export interface AssetLinksValue {
  link_copy: string | null;
  link_imagem: string | null;
  link_video: string | null;
  link_drive: string | null;
}

const ASSET_FIELDS: { key: keyof AssetLinksValue; label: string; icon: string }[] = [
  { key: "link_copy", label: "Link da Copy", icon: "📄" },
  { key: "link_imagem", label: "Link Imagem/Capa", icon: "🖼" },
  { key: "link_video", label: "Link do Vídeo", icon: "🎬" },
  { key: "link_drive", label: "Link Google Drive", icon: "📁" },
];

export function AssetLinksEditable({
  value,
  onChange,
}: {
  value: AssetLinksValue;
  onChange: (next: AssetLinksValue) => void;
}) {
  return (
    <div className="mb-3.5">
      <FieldLabel>Links de assets</FieldLabel>
      <div className="space-y-2">
        {ASSET_FIELDS.map(({ key, label, icon }) => (
          <TextInput
            key={key}
            placeholder={`${icon} ${label}`}
            value={value[key] ?? ""}
            onChange={(e) => onChange({ ...value, [key]: e.target.value })}
          />
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
