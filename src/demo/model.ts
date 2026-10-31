import data from './demo-data.json' with {type:'json'};
import type {ScheduleItem,ScheduleProposal,AgentState} from '../types';
import type {FatigueReading} from '../fatigue/model';
export const DEMO_STATES:AgentState[]=['idle','listening','thinking','speaking'];
export const scenarios=[
 {id:'briefing',label:'Mission briefing',prompt:'What is on my schedule?',reply:'Demo briefing: your fictional day balances research, equipment checks, and recovery. Select an hour in the schedule to explore the sample fatigue indicator.'},
 {id:'recovery',label:'Recovery check-in',prompt:'I feel tired. Can we make room for recovery?',reply:'Demo response: let’s protect a recovery break. This is a preset text scenario, not a live assessment. You can preview a small schedule adjustment before deciding.',adjust:true},
 {id:'adjust',label:'Adjust schedule',prompt:'Move my experiment one hour later.',reply:'Demo preview: I can swap the 08:00–10:00 experiment and the 10:00–11:00 recovery break. Review the highlighted schedule, then accept the local change or keep the original.',adjust:true}
];
export function initialSchedules():Record<number,ScheduleItem[]> {return Object.fromEntries(data.days.map(d=>[d.day,d.events.map(e=>({...e} as ScheduleItem))]));}
export function demoFatigue(day:number,hour:number):FatigueReading {return data.days.find(d=>d.day===day)?.fatigue[hour] as FatigueReading ?? {};}
export function resolveScenario(text:string){return /move|adjust|later|shift|调整|推迟/i.test(text)?scenarios[2]:/tired|fatigue|rest|recovery|累|休息/i.test(text)?scenarios[1]:scenarios[0];}
export function createProposal(events:ScheduleItem[],day:number):ScheduleProposal|null {
 const before=events.find(e=>e.title==='Scientific experiment'),rest=events.find(e=>e.title==='Recovery break');
 if(!before||!rest||before.startTime!=='08:00')return null;
 const after={...before,startTime:'09:00',endTime:'11:00',proposed:true};
 const restAfter={...rest,startTime:'08:00',endTime:'09:00',proposed:true};
 const changes=[{before,after},{before:rest,after:restAfter}];
 return {id:`demo-day-${day}`,day,taskId:before.id,title:'Demo schedule adjustment',baseRevision:0,before,after,summary:'Demo only · Recovery 08:00–09:00; experiment 09:00–11:00. Changes last until reset or refresh.',expiresAt:Infinity,changes,previewEvents:events.map(e=>changes.find(c=>c.before.id===e.id)?.after??{...e})};
}
export function applyDecision(events:ScheduleItem[],proposal:ScheduleProposal,decision:'accept'|'reject'):ScheduleItem[]{return (decision==='accept'?proposal.previewEvents:events).map(e=>({...e,proposed:false}));}
