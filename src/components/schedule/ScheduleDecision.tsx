import type { ScheduleProposal } from '../../types';
export function ScheduleDecision({proposal,ready,busy,onDecision}:{proposal:ScheduleProposal|null;ready:boolean;busy:boolean;onDecision:(decision:'accept'|'reject')=>void}){
 if(!proposal||!ready)return null;
 return <div className="schedule-decision" aria-label="Schedule adjustment decision">
  <strong>Demo · Schedule Adjustment Preview</strong><p>{proposal.summary}</p>
  <div className="decision-slots">
   <button className="decision-accept" disabled={busy} onClick={()=>onDecision('accept')}>Accept Change</button>
   <button className="decision-keep" disabled={busy} onClick={()=>onDecision('reject')}>Keep Original</button>
  </div>
 </div>;
}
