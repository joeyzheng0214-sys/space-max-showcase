import type { ComponentType } from "react";
import type { AnimationProps } from "../../types";
export function SpaceMaxAnimation({
  agentState,
  Animation,
}: {
  agentState: AnimationProps["agentState"];
  Animation?: ComponentType<AnimationProps>;
}) {
  return (
    <div
      className="animation-host"
      data-agent-state={agentState}
      aria-label={`Space Max animation: ${agentState}`}
    >
      {Animation ? <Animation agentState={agentState} /> : null}
    </div>
  );
}
