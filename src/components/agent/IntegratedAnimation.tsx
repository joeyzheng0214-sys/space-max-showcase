import {useEffect,useRef,useState} from 'react';
import {mountVoiceBall,type VoiceBall,type VoiceBallState} from '../../animation/voice-ball.js';
import type {AnimationProps} from '../../types';

export function IntegratedAnimation({agentState}:AnimationProps){
 const host=useRef<HTMLDivElement>(null),ball=useRef<VoiceBall|undefined>(undefined);
 const [error,setError]=useState('');
 useEffect(()=>{
  try{ball.current=mountVoiceBall(host.current!,{initialState:'IDLE'});}catch{setError('Animation unavailable. Enable WebGL to show Space Max.');}

  return()=>{ball.current?.dispose();ball.current=undefined;};
 },[]);
 useEffect(()=>{
  ball.current?.setState(agentState.toUpperCase() as VoiceBallState);
  // Synthetic visual modulation only. No audio devices or media are connected.
  if(agentState !== 'speaking'){ball.current?.setAudioEnvelope(0);return;}
  let frame=0;
  const tick=(ms:number)=>{ball.current?.setAudioEnvelope(0.35+0.25*Math.sin(ms/130)+0.15*Math.sin(ms/47));frame=requestAnimationFrame(tick);};
  frame=requestAnimationFrame(tick);
  return()=>{cancelAnimationFrame(frame);ball.current?.setAudioEnvelope(0);};
 },[agentState]);
 return <div ref={host} className="integrated-animation" data-animation-state={agentState}>{error&&<p role="status">{error}</p>}</div>;
}
