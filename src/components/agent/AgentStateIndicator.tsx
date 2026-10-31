import type { AgentState } from "../../types";
export function AgentStateIndicator({
  agentState,
}: {
  agentState: AgentState;
}) {
  return (
    <div className="agent-state" role="status" aria-live="polite">
      <span>● {agentState[0].toUpperCase() + agentState.slice(1)}</span>
    </div>
  );
}
