import type { ComponentType } from "react";
import type { AgentState, AnimationProps, ScheduleProposal } from "../../types";
import { SpaceMaxAnimation } from "./SpaceMaxAnimation";
import { AgentStateIndicator } from "./AgentStateIndicator";
import { ScheduleDecision } from "../schedule/ScheduleDecision";
import { LiveCaptions } from "./LiveCaptions";
export function AgentPanel({
  agentState,
  proposal, decisionReady, decisionBusy, onDecision,
  currentCaption,
  Animation,
  error,
  onDismiss,
}: {
  agentState: AgentState;
  proposal: ScheduleProposal | null; decisionReady: boolean; decisionBusy: boolean;
  onDecision:(decision:"accept"|"reject")=>void;
  currentCaption: string;
  Animation?: ComponentType<AnimationProps>;
  error: string | null;
  onDismiss: () => void;
}) {
  return (
    <main className="agent-column">
      <section className="agent-panel panel" aria-label="Space Max animation">
      <header className="agent-header">
        <h1>SPACE MAX</h1>
      </header>
      <div className="animation-stage">
        <SpaceMaxAnimation agentState={agentState} Animation={Animation} />
        <AgentStateIndicator agentState={agentState} />
      </div>
      </section>
      <div className="caption-region">
        <LiveCaptions completed={agentState === "idle"} text={currentCaption} visible={!!currentCaption && (agentState === "speaking" || agentState === "idle")} />
        <ScheduleDecision proposal={proposal} ready={decisionReady} busy={decisionBusy} onDecision={onDecision} />
        {error && <div className="response-error" role="alert">{error}<button className="error-dismiss" onClick={onDismiss}>Dismiss</button></div>}
      </div>
    </main>
  );
}
