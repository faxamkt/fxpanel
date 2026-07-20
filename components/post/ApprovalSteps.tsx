import { ClientApprovalStep } from "@/lib/types";
import { Switch } from "@/components/ui/Switch";

export interface ApprovalStepsProps {
  steps: ClientApprovalStep[];
  readOnly?: boolean;
  onToggle?: (stepId: string, aprovado: boolean) => void;
}

export function ApprovalSteps({ steps, readOnly, onToggle }: ApprovalStepsProps) {
  return (
    <div className="mb-3.5 rounded-lg bg-faxa-cinza-bg p-3">
      <div className="mb-2 text-[11px] font-bold tracking-wide text-faxa-cinza-3 uppercase">
        Etapas de aprovação
      </div>
      {steps.map((step) => (
        <div key={step.id} className="flex items-center justify-between py-1.5 text-sm">
          <span>{step.tipo} aprovada</span>
          <Switch
            on={step.aprovado}
            disabled={readOnly}
            onChange={(value) => onToggle?.(step.id, value)}
          />
        </div>
      ))}
    </div>
  );
}
