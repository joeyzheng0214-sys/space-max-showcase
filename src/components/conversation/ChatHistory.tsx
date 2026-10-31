import { useEffect, useRef } from "react";
import type { ChatMessage } from "../../types";
export function ChatHistory({messages}:{messages:ChatMessage[]}){
 const end=useRef<HTMLDivElement>(null);
 useEffect(()=>{if(end.current?.parentElement)end.current.parentElement.scrollTop=end.current.parentElement.scrollHeight;},[messages]);
 return <div className="chat-history" role="log" aria-label="Chat History" aria-live="polite">
  {messages.map(m=><div key={m.id} className={`message-row ${m.role}`}><div className="message" aria-label={`${m.role}: ${m.content||'demo message'}`}>
   {m.content||<div className="message-skeleton" aria-hidden="true"><i/><i/></div>}
  </div></div>)}<div ref={end}/>
 </div>;
}
