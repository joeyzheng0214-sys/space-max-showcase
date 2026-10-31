import {useEffect,useRef,useState} from 'react';
import {SchedulePanel} from './components/schedule/SchedulePanel';
import {AgentPanel} from './components/agent/AgentPanel';
import {IntegratedAnimation} from './components/agent/IntegratedAnimation';
import {ChatHistory} from './components/conversation/ChatHistory';
import {TextInput} from './components/conversation/TextInput';
import {DEMO_STATES,scenarios,resolveScenario,initialSchedules,demoFatigue,createProposal,applyDecision} from './demo/model';
import type {AgentState,ChatMessage,ScheduleProposal} from './types';
const welcome='Welcome to Space Max. This is a scripted Demo: explore the particle states, fictional schedule, and local adjustment preview. No live AI, microphone, or audio recording.';
const message=(role:ChatMessage['role'],content:string):ChatMessage=>({id:crypto.randomUUID(),role,content,timestamp:new Date().toISOString()});
export function ShowcaseApp(){
 const [schedules,setSchedules]=useState(initialSchedules),[day,setDay]=useState(3),[hour,setHour]=useState(8);
 const [state,setState]=useState<AgentState>('idle'),[caption,setCaption]=useState(welcome),[messages,setMessages]=useState(()=>[message('assistant',welcome)]);
 const [proposal,setProposal]=useState<ScheduleProposal|null>(null),[ready,setReady]=useState(false),[notice,setNotice]=useState('');
 const timers=useRef<ReturnType<typeof setTimeout>[]>([]),sequence=useRef(0);
 const schedule=(fn:()=>void,ms:number)=>{timers.current.push(setTimeout(fn,ms));};
 const stop=()=>{sequence.current++;timers.current.forEach(clearTimeout);timers.current=[];setState('idle');};
 useEffect(()=>()=>{timers.current.forEach(clearTimeout);},[]);
 const run=(scenario:typeof scenarios[number],input=scenario.prompt)=>{
  stop();setProposal(null);setReady(false);setNotice('Demo playback · scripted text and simulated states');setCaption('');
  setMessages(m=>[...m,message('user',input)]);setState('listening');
  const token=sequence.current;
  const pending=scenario.adjust?createProposal(schedules[day],day):null;
  const reply=scenario.reply+(scenario.adjust&&!pending?' This day already has the accepted adjustment. Reset Demo to replay the original.':'');
  schedule(()=>{setState('thinking');},700);
  schedule(()=>{
   if(token!==sequence.current)return;
   setState('speaking');setMessages(m=>[...m,message('assistant',reply)]);
   const words=reply.split(' ');
   words.forEach((_,i)=>schedule(()=>setCaption(words.slice(0,i+1).join(' ')),i*55));
   schedule(()=>{setState('idle');setCaption(reply);setProposal(pending);setReady(!!pending);},words.length*55+350);
  },1500);
 };
 const changeDay=(next:number)=>{stop();setDay(next);setProposal(null);setReady(false);setCaption('Demo · Fictional Day '+next+'. Select a scenario to explore.');setNotice('');};
 const decide=(decision:'accept'|'reject')=>{
  if(!proposal||proposal.day!==day)return;
  setSchedules(s=>({...s,[day]:applyDecision(s[day],proposal,decision)}));setProposal(null);setReady(false);
  const text=decision==='accept'?'Demo change accepted locally. Experiment is now 09:00–11:00. Reset or refresh restores the original.':'Demo · Original schedule kept. Nothing was changed.';
  setCaption(text);setNotice(text);setMessages(m=>[...m,message('assistant',text)]);
 };
 const reset=()=>{stop();setSchedules(initialSchedules());setDay(3);setHour(8);setProposal(null);setReady(false);setCaption(welcome);setMessages([message('assistant',welcome)]);setNotice('Demo reset. All local changes cleared.');};
 return <><header className="showcase-banner"><div><strong>SHOWCASE MODE <span>DEMO</span></strong><p>Scripted conversations · fictional mission data · browser-only changes · no live AI</p></div><button onClick={reset}>Reset Demo</button></header>
 <div className="space-max-app">
  <SchedulePanel scheduleData={proposal?.day===day?proposal.previewEvents:schedules[day]} focusEventId={proposal?.taskId} selectedDay={day} selectedHour={hour} onDayChange={changeDay} onHourChange={setHour} loading={false} fatigue={demoFatigue(day,hour)}/>
  <div className="showcase-center">
   <AgentPanel agentState={state} currentCaption={caption} proposal={proposal} decisionReady={ready} decisionBusy={false} onDecision={decide} Animation={IntegratedAnimation} error={null} onDismiss={()=>{}}/>
   <section className="state-controls" aria-label="Demo animation controls"><span>Demo particle states</span><div>{DEMO_STATES.map(s=><button key={s} aria-pressed={state===s} onClick={()=>{stop();setState(s);setCaption(s==='speaking'?'Demo · Speaking animation uses a simulated visual envelope. No audio is played.':'Demo · '+s+' animation. No microphone or live AI.');}}>{s[0].toUpperCase()+s.slice(1)}</button>)}</div><small>Live Captions · scripted text playback, no recorded audio</small></section>
  </div>
  <aside className="conversation-panel panel dashboard-window" aria-label="Demo conversation"><header className="side-header"><h2>Chat History <span className="demo-tag">Demo</span></h2></header>
   <p className="demo-explainer">Choose a preset, or type a message to select a matching preset. Replies are fixed Demo text.</p>
   <ChatHistory messages={messages}/>
   <div className="demo-scenarios" aria-label="Preset Demo scenarios">{scenarios.map(s=><button key={s.id} onClick={()=>run(s)} disabled={state!=='idle'}>{s.label}<span>↗</span></button>)}</div>
   <TextInput disabled={state!=='idle'} onSend={text=>run(resolveScenario(text),text)}/>
   {state!=='idle'&&<button className="demo-cancel" onClick={()=>{stop();setCaption('Demo playback stopped.');setNotice('Playback stopped.');}}>Stop Demo playback</button>}
   <div className="demo-notice" role="status">{notice||'Local session only · refresh starts fresh.'}</div>
  </aside>
 </div></>;
}
