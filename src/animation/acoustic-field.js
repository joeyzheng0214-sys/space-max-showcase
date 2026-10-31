const clamp=v=>Math.max(0,Math.min(1,Number(v)||0));
const coord=v=>Math.max(-1,Math.min(1,Number(v)||0));
export const RIPPLE_LIFETIME=2.4;
// Approximate the actual six wisp centerlines, so directional origins stay inside the cloud.
export function mapSource(input={},phase=0){
 let p=input.position??input.sourcePosition;
 if(!p&&input.direction){p=input.direction;const len=Math.hypot(p.x||0,p.y||0);if(len>1)p={x:p.x/len,y:p.y/len};}
 if(!p&&Number.isFinite(input.azimuth)){const a=input.azimuth*Math.PI/180;p={x:Math.cos(a)*.82,y:Math.sin(a)*.82};}
 p=p??{x:0,y:0};const desired={x:coord(p.x)*1.35,y:coord(p.y)*1.35};let nearest,best=Infinity;
 for(let lane=0;lane<6;lane++)for(let i=0;i<=24;i++){const v=(i/24*2-1)*(1.25+.35*Math.sin(lane*1.7))+.2*Math.cos(lane*2),f=v*2+phase*.2+lane*.78;const x=-v*.4+.65*Math.sin(f)+.4*Math.sin(v*3.6-lane*.9)+(lane-2.5)*.24+.08*Math.sin(v*5+phase*.35+lane*1.3),y=v+.16*Math.sin(f*1.4+lane);const d=(x-desired.x)**2+(y-desired.y)**2;if(d<best){best=d;nearest={x,y};}}
 return nearest;
}
export class AcousticField {
 constructor(){this.amplitude=0;this.rate=0;this.target={amplitude:0,speakingRate:0,isSpeechActive:false};this.events=[];this.sources=[];this.clock=0;this.serial=0;this.lastOnset=-10;this.previous=0;this.sourceMemory=new Map();this.secondary={enabled:false,seed:1};this.randomState=1;this.decor=null;this.nextDecor=4;}
 random(){this.randomState=(Math.imul(this.randomState,1664525)+1013904223)>>>0;return this.randomState/4294967296;}
 configureSecondary({enabled=this.secondary.enabled,seed,force=false}={}){this.secondary.enabled=!!enabled;if(seed!==undefined){this.randomState=Number(seed)>>>0;this.secondary.seed=this.randomState;this.nextDecor=this.clock+3.5+this.random()*2;}if(force)this.nextDecor=this.clock;if(!enabled)this.decor=null;}
 setFeatures({amplitude=0,speakingRate=0,isSpeechActive=false,sourcePosition,direction,azimuth}){this.target={amplitude:clamp(amplitude),speakingRate:clamp(speakingRate),isSpeechActive:!!isSpeechActive};this.setSources([{id:'voice',...this.target,position:sourcePosition,direction,azimuth}]);}
 setSources(sources){if(!Array.isArray(sources))throw new TypeError('Expected acoustic sources');const ids=new Set();this.sources=sources.slice(0,2).map((s,i)=>{const id=String(s.id??i);if(ids.has(id))throw new TypeError('Acoustic source ids must be unique');ids.add(id);let m=this.sourceMemory.get(id);if(!m)m={id,amplitude:0,rate:0,next:this.clock,x:null,y:null};Object.assign(m,{input:{position:s.position,direction:s.direction,azimuth:s.azimuth},targetAmplitude:clamp(s.amplitude)*(i? .45:1),targetRate:clamp(s.speakingRate),active:!!s.isSpeechActive,role:i?'secondary':'primary'});return m;});this.sourceMemory=new Map(this.sources.map(s=>[s.id,s]));if(this.sources.length>1)this.decor=null;}
 setEnvelope(value){const a=clamp(value);if(a>.045&&this.previous<=.045){const gap=this.clock-this.lastOnset;if(gap>.12&&gap<3)this.estimatedRate=clamp((1/gap-.5)/5);this.lastOnset=this.clock;}this.previous=a;this.setFeatures({amplitude:a,speakingRate:this.estimatedRate??.35,isSpeechActive:a>.025});}
 update(dt,listening,phase=0){this.clock+=dt;const k=1-Math.exp(-dt*7),move=1-Math.exp(-dt*4);this.events=this.events.filter(e=>this.clock-e.born<RIPPLE_LIFETIME);
 for(const s of this.sources){const target=mapSource(s.input,phase);if(s.x===null){s.x=target.x;s.y=target.y;}else{s.x+=(target.x-s.x)*move;s.y+=(target.y-s.y)*move;}s.amplitude+=(s.targetAmplitude-s.amplitude)*k;s.rate+=(s.targetRate-s.rate)*k;}
 const primary=this.sources[0],speaking=!!(listening&&primary?.active);
 if(!listening||!this.secondary.enabled||this.sources.length>1)this.decor=null;
 if(this.decor&&this.clock>=this.decor.until){this.decor=null;this.nextDecor=this.clock+3.5+this.random()*2.5;}
 if(speaking&&this.secondary.enabled&&this.sources.length<2&&!this.decor&&this.clock>=this.nextDecor){let p;for(let i=0;i<12;i++){p=mapSource({position:{x:this.random()*1.7-.85,y:this.random()*1.7-.85}},phase);if(Math.hypot(p.x-primary.x,p.y-primary.y)>.65)break;}this.decor={id:'decorative',role:'secondary',x:p.x,y:p.y,amplitude:primary.amplitude*.38,rate:primary.rate,next:this.clock,until:this.clock+2.8+this.random()*1.2,active:true};}
 if(this.decor){this.decor.amplitude+=(primary.amplitude*.38-this.decor.amplitude)*k;this.decor.active=speaking;}
 const emitters=[...this.sources,...(this.decor?[this.decor]:[])];
 for(const s of emitters){if(listening&&s.active&&s.amplitude>.005&&this.clock>=s.next&&this.events.length<8){this.events.push({born:this.clock,strength:s.amplitude,x:s.x,y:s.y,sourceId:s.id,role:s.role});this.serial++;s.next=this.clock+(s.role==='secondary'?1.05:1)/(.85+2.45*s.rate);}else if(!listening)s.next=this.clock;}
 this.amplitude=primary?.amplitude??0;this.rate=primary?.rate??0;return this.events;}
 uniforms(){const data=new Float32Array(32);for(let i=0;i<8;i++){const e=this.events[i];data.set(e?[this.clock-e.born,e.strength,e.x,e.y]:[-10,0,0,0],i*4);}return data;}
 debug(){return {emitters:[...this.sources,...(this.decor?[this.decor]:[])].map(s=>({id:s.id,role:s.role,x:s.x,y:s.y,active:s.active})),wavefronts:this.events.length,secondaryEnabled:this.secondary.enabled,seed:this.secondary.seed};}
}
