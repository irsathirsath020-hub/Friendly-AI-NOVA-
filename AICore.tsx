import { cn } from "@/lib/utils";
import { Focus, Radio, Sparkles } from "lucide-react";

export type AssistantState = "idle" | "thinking" | "responding" | "error";

type AICoreProps = {
  state: AssistantState;
  onActivate: () => void;
};

const stateCopy: Record<AssistantState, string> = {
  idle: "Awaiting signal",
  thinking: "Processing context",
  responding: "Forming response",
  error: "Signal interrupted",
};

export function AICore({ state, onActivate }: AICoreProps) {
  return (
    <button
      type="button"
      className={cn("ai-core-scene", `ai-core--${state}`)}
      onClick={onActivate}
      aria-label="Open the AI assistant conversation"
    >
      <span className="core-reticle core-reticle--one" aria-hidden="true" />
      <span className="core-reticle core-reticle--two" aria-hidden="true" />
      <span className="core-orbit core-orbit--one" aria-hidden="true"><i /></span>
      <span className="core-orbit core-orbit--two" aria-hidden="true"><i /></span>
      <span className="core-aura" aria-hidden="true" />
      <span className="core-shell" aria-hidden="true">
        <span className="core-grid" />
        <span className="core-pupil" />
        <span className="core-glint" />
      </span>
      <span className="core-float-card core-float-card--left" aria-hidden="true">
        <Radio size={12} />
        <span>NEURAL LINK</span>
      </span>
      <span className="core-float-card core-float-card--right" aria-hidden="true">
        <Focus size={12} />
        <span>FOCUS READY</span>
      </span>
      <span className="core-status" aria-live="polite">
        <Sparkles size={12} />
        {stateCopy[state]}
      </span>
    </button>
  );
}
