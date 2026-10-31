import { ORIGINAL, validateParameters } from './parameters.js';
import { AcousticField } from './acoustic-field.js';
/* Standalone WebGL particle organism. No dependencies or remote assets. */
export class VoiceBall {
 constructor(canvas,{count=62000}={}){
 this.disposed=false;this.shaders=[];this.canvas=canvas;this.gl=canvas.getContext('webgl',{alpha:true,premultipliedAlpha:true,antialias:false,preserveDrawingBuffer:true});if(!this.gl)throw Error('WebGL is unavailable');this.state='idle';this.weights=[1,0,0,0];this.target=[1,0,0,0];this.time=0;this.phase=0;this.envelope=0;this.pointer=[9,9];this.wakes=[];this.snap=-100;this.previousPointer=null;this.pulse=-100;this.frameCount=0;this.count=count;this.parameters={...ORIGINAL,count};this.acoustics=new AcousticField();this.dyeStarted=-100;
 const gl=this.gl;
 const vs=`precision highp float;
 attribute vec4 seed;attribute float age;
 uniform float time,phase,aspect,scale,audio,pulseTime,linePass,snapTime,dyeTime,flowStrength,turbulence,trailLength,trailOpacity,glow,mouseStrength;uniform vec4 state;uniform vec2 pulseOrigin;uniform vec4 wakes[8];uniform vec4 responses[8];
 varying vec4 color;
 const float PI=3.14159265;
 float infused(){float u=seed.x*6.2831853;vec2 site=vec2(cos(u)*1.14,sin(u)*1.18)*mix(.35,1.,pow(seed.y,.3));float path=length(site)+.10*sin(u*3.+seed.y*5.);return .16*smoothstep(.015,.13,dyeTime)+.84*smoothstep(path*.27-.08,path*.27+.25,dyeTime);}
 vec3 shape(float t){
 float u=seed.x*6.2831853;float v=seed.y;float layer=floor(seed.z*7.0);float a=u+t*.025+.16*sin(t*.36+u*2.);
 float edge=mix(pow(v,.19),sqrt(v),.30);float r=mix(edge,sqrt(v)*.88,step(seed.w,.20));
 float contour=1.+.14*sin(3.*a+t*.24)+.10*cos(2.*a-t*.21)+.06*sin(5.*a+t*.15);
 vec3 idle=vec3(cos(a)*r*contour*1.14,sin(a)*r*contour*1.18, sin(a*2.+layer)*.35*r);
 float fold=sin(a*2.+r*4.8+t*.19);idle.xy+=vec2(.24*sin(r*8.+a*2.+t*.3+layer*.4),.27*fold)*r;
 float x=(seed.x*2.-1.)*1.75;
 float strand=(seed.y*2.-1.);float s=x*2.6+t*.32+layer*.54;
 float ribbon=sin(s)*.32+cos(x*4.1-t*.16+layer*.7)*.16;
 float width=.20+.32*(.5+.5*sin(x*3.4+layer*.9+t*.12));
 float twist=strand*2.6+sin(x*2.+t*.2)+layer*.28;
 vec3 silk=vec3(x+sin(twist+x*2.)*.10,ribbon+sin(twist)*width,cos(twist)*width);
 silk.y+=strand*.16*sin(x*5.+t*.4+layer);
 vec3 electric=silk;electric.xy+=.12*vec2(sin(x*11.+strand*8.+t*2.),cos(x*8.-strand*6.-t*1.4));
 // An open, volumetric family of non-periodic wisps, never a shell.
 float lane=floor(seed.z*6.);float zeta=fract(seed.z*6.);
 float g=sqrt(-2.*log(max(.0001,seed.y)))*cos(seed.w*6.283);
 float h=sqrt(-2.*log(max(.0001,seed.y)))*sin(seed.w*6.283);
 float vpos=(seed.x*2.-1.)*(1.25+.35*sin(lane*1.7))+.20*cos(lane*2.);
 float flow=vpos*2.0+t*.20+lane*.78;
 float mistWidth=.13+.20*(.5+.5*sin(vpos*3.2+lane*1.7));
 float diffuse=step(.83,seed.w);
 mistWidth+=diffuse*.40;
 vec3 listening=vec3(-vpos*.40+.65*sin(flow)+.40*sin(vpos*3.6-lane*.9)+g*mistWidth+(lane-2.5)*.24,
 vpos+.16*sin(flow*1.4+lane)+h*mistWidth*.67,
 (zeta-.5)*.85+g*.13);
 listening.x+=.08*sin(vpos*5.+t*.35+lane*1.3);
 // One whole-body structural response, shared by every particle; no corner delays.
 float body=smoothstep(.025,.64,dyeTime);
 float tension=exp(-pow((dyeTime-.10)/.085,2.))*state.y;
 idle.xy-=normalize(idle.xy+.001)*tension*.065;
 return idle*(state.x+state.y*(1.-body))+listening*(state.y*body)+electric*state.z+silk*state.w+vec3(normalize(idle.xy+.001)*body*(1.-body)*1.28*state.y,0.);
 }
 void main(){float lag=age*(.009+state.z*.080+state.w*.19);if(trailLength!=1.)lag*=trailLength;vec3 p=shape(phase-lag);
 if(flowStrength!=1.)p.xy+=vec2(sin(p.y*2.3+phase*.3),cos(p.x*2.7-phase*.2))*.12*(flowStrength-1.);
 if(turbulence!=1.)p.xy+=vec2(sin(p.y*7.+p.z*3.+phase*.45),cos(p.x*6.-phase*.4))*.045*(turbulence-1.);
 // Movement-only directional shear: no radial repulsion or exclusion zone.
 for(int i=0;i<8;i++){vec2 d=p.xy-wakes[i].xy;vec2 impulse=wakes[i].zw;float f=exp(-dot(d,d)*32.);p.xy+=f*(impulse+vec2(-impulse.y,impulse.x)*sin(d.x*12.+d.y*8.)*.35)*.010*mouseStrength;}
 // Circular wavefronts in the projected cloud plane; only field particles reveal them.
 float entryLife=smoothstep(0.,.035,dyeTime)*(1.-smoothstep(.62,.94,dyeTime));
 float entryRadius=.03+max(0.,dyeTime)*3.2;float entryDepth=1./(1.+p.z*.25);
 float entryFront=exp(-pow((length(p.xy*entryDepth)-entryRadius)/.21,2.))*entryLife*state.y;
 p.xy+=normalize(p.xy+.001)*entryFront*.16;
 float resonance=entryFront*.35;vec2 waveShift=vec2(0.);float waveDepth=1./(1.+p.z*.25);
 for(int i=0;i<8;i++){vec4 e=responses[i];if(e.x>=0.){
 vec2 d=p.xy*waveDepth-e.zw;float distance=length(d);
 float radius=.06+e.x*(.52+e.y*.24);
 float delta=distance-radius;float band=delta/(.11+e.y*.055);
 float life=smoothstep(0.,.16,e.x)*(1.-smoothstep(1.75,2.4,e.x))*exp(-e.x*.48)*e.y;
 float crest=exp(-band*band)*life;
 float trough=exp(-pow((delta+.22)/.19,2.))*life*.30;
 waveShift+=normalize(d+vec2(.0001))*(crest-trough)*.15;
 resonance+=crest-trough*.5;
 }}
 resonance=resonance/(1.+abs(resonance)*1.4);
 // Smoothly bound constructive overlap without clipping or whole-form vibration.
 p.xy+=waveShift/(1.+length(waveShift)*3.)/waveDepth*state.y;
 // Brief coherent shudder only when LISTENING is explicitly interrupted by THINKING.
 float snapEnvelope=smoothstep(0.,.035,snapTime)*exp(-max(0.,snapTime)*5.)*(1.-smoothstep(.36,.54,snapTime))*step(0.,snapTime);
 vec2 shiver=vec2(sin(snapTime*115.+p.y*9.),cos(snapTime*97.+p.x*8.))*.040;
 shiver+=vec2(sin(snapTime*137.),sin(snapTime*119.+.7))*.018;
 p.xy+=shiver*snapEnvelope;
 float ring=exp(-pow((length(p.xy-pulseOrigin)-pulseTime*1.25)/.10,2.))*exp(-pulseTime*1.6)*step(0.,pulseTime);p.xy+=normalize(p.xy-pulseOrigin+.001)*ring*.13;
 float depth=1./(1.+p.z*.25);p.xy*=depth;gl_Position=vec4(p.x*scale/aspect,p.y*scale,0.,1.);
 float trail=(state.z+state.w);float opacity=mix(1.,exp(-age*.25)*.45,step(.5,age))*mix(1.,trail,step(.5,age));
 float ridge=.45+.55*pow(abs(cos(seed.y*6.28+seed.z*7.)),4.);float brightness=mix(.42+.58*pow(seed.y,3.),ridge,state.z+state.w);
 vec3 cool=mix(vec3(.62,.81,.92),vec3(.27,.57,1.),state.z*.65);vec3 rose=mix(vec3(.73,.46,.56),vec3(1.,.83,.76),seed.w);vec3 col=mix(cool,rose,state.w*.92+state.y*.08);
 float rosePatch=exp(-pow((p.x-1.05)/.60,2.)-pow((p.y-.15)/.80,2.))*.72+exp(-pow((p.x+.25)/.72,2.)-pow((p.y+.95)/.45,2.))*.55;
 col=mix(col,vec3(1.,.63,.70),min(.85,rosePatch)*state.x*(.35+.65*seed.y));
 float mist=state.y*infused();
 float quiet=state.x+state.y*(1.-infused());
 vec3 pale=mix(vec3(.66,.73,.94),vec3(.82,.74,.91),.5+.5*sin(p.y*2.+p.x*1.6));
 col=mix(col,pale,quiet);
 float dyeFront=4.*infused()*(1.-infused())*state.y;
 float region=clamp(.53+.32*sin(p.y*2.4+seed.z*4.)+p.x*.22,0.,1.);
 vec3 listeningColor=mix(vec3(.16,.38,1.),vec3(.45,.37,.72),smoothstep(.10,.65,region));
 listeningColor=mix(listeningColor,vec3(.88,.62,.72),smoothstep(.48,.88,region));
 listeningColor=mix(listeningColor,vec3(1.,.85,.88),pow(region,8.)*.70+min(.40,resonance*.58));
 col=mix(col,listeningColor,mist);
 float cloudAlpha=(.34+.32*pow(region,2.))*(1.+resonance*2.8);
 float baseAlpha=opacity*brightness*(.65+seed.w*.75)*(1.-state.w*.20-state.z*.3)*(1.+audio*.35);
 col=mix(col,vec3(.42,.43,.95),dyeFront*.46);
 color=vec4(col,mix(baseAlpha,cloudAlpha,mist)*(1.+dyeFront*.22));color.a*=mix(1.,.32*(state.z+state.w),linePass);
 float fineSize=mix(.85+seed.w*.85,3.5+seed.y*4.0,step(.83,seed.w));
 color.a*=mix(1.,mix(1.,.20,step(.83,seed.w)),mist);if(age>.5&&trailOpacity!=1.)color.a*=trailOpacity;if(glow!=1.)color.a*=glow;
 gl_PointSize=mix((1.15+seed.w*1.35)*min(2.,scale*1.8)*mix(1.,.66,step(.5,age)),fineSize*min(1.7,scale*2.),mist);

 }`;
 const fs=`precision highp float;varying vec4 color;uniform float linePass;void main(){float d=length(gl_PointCoord-.5);float a=mix(smoothstep(.5,.12,d),1.,linePass);gl_FragColor=vec4(color.rgb,color.a*a);}`;
 const shader=(type,src)=>{let s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));this.shaders.push(s);return s;};
 this.program=gl.createProgram();gl.attachShader(this.program,shader(gl.VERTEX_SHADER,vs));gl.attachShader(this.program,shader(gl.FRAGMENT_SHADER,fs));gl.linkProgram(this.program);if(!gl.getProgramParameter(this.program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(this.program));gl.useProgram(this.program);
 let data=new Float32Array(count*13*5);let rand=()=>{this.rng=(1664525*(this.rng||42)+1013904223)>>>0;return this.rng/4294967296};for(let i=0;i<count;i++){let s=[rand(),rand(),rand(),rand()];data.set([...s,0],i*5);for(let a=0;a<12;a++)data.set([...s,Math.floor((a+1)/2)],(count+i*12+a)*5);}
 let buffer=this.buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,data,gl.STATIC_DRAW);for(let [n,size,off] of [['seed',4,0],['age',1,16]]){let l=gl.getAttribLocation(this.program,n);gl.enableVertexAttribArray(l);gl.vertexAttribPointer(l,size,gl.FLOAT,false,20,off);}
 this.uniforms={};for(let n of ['time','phase','aspect','scale','audio','pulseTime','state','wakes','linePass','pulseOrigin','snapTime','responses','dyeTime','flowStrength','turbulence','trailLength','trailOpacity','glow','mouseStrength'])this.uniforms[n]=gl.getUniformLocation(this.program,n);
 gl.enable(gl.BLEND);gl.blendFuncSeparate(gl.SRC_ALPHA,gl.ONE,gl.ONE,gl.ONE_MINUS_SRC_ALPHA);gl.clearColor(0,0,0,0);
 this.updatePointer=e=>{const r=canvas.getBoundingClientRect();if(!r.width||!r.height)return;let x=(e.clientX-r.left)/r.width*2-1,y=1-(e.clientY-r.top)/r.height*2;this.pointer=[x*this.aspect/this.scale,y/this.scale];};
 this.onMove=e=>{this.updatePointer(e);if(this.previousPointer){let dx=this.pointer[0]-this.previousPointer[0],dy=this.pointer[1]-this.previousPointer[1];let distance=Math.hypot(dx,dy);if(distance>.0001){let strength=Math.min(.35,distance*5);this.wakes.unshift([...this.pointer,dx/distance*strength,dy/distance*strength]);this.wakes.length=Math.min(8,this.wakes.length);}}this.previousPointer=[...this.pointer];};
 this.onLeave=()=>{this.previousPointer=null;};this.pulseOrigin=[0,0];this.onClick=e=>{this.updatePointer(e);this.pulse=this.time;this.pulseOrigin=[...this.pointer];};canvas.addEventListener('pointermove',this.onMove);canvas.addEventListener('pointerleave',this.onLeave);canvas.addEventListener('pointerdown',this.onClick);const overlay=document.createElement('canvas');Object.assign(overlay.style,{position:'fixed',inset:0,width:'100%',height:'100%',pointerEvents:'none'});this.canvas.after(overlay);this.eventCanvas=overlay;this.eventContext=overlay.getContext('2d');
this.tick=this.tick.bind(this);this.raf=requestAnimationFrame(this.tick);
 }
 setParameters(patch){const valid=validateParameters(patch);if(valid.count!==undefined&&valid.count!==this.count)this.rebuildCount(valid.count);Object.assign(this.parameters,valid);return {...this.parameters};}
 rebuildCount(count){const gl=this.gl;const data=new Float32Array(count*13*5);let rng=42;const rand=()=>{rng=(1664525*rng+1013904223)>>>0;return rng/4294967296;};for(let i=0;i<count;i++){const seed=[rand(),rand(),rand(),rand()];data.set([...seed,0],i*5);for(let a=0;a<12;a++)data.set([...seed,Math.floor((a+1)/2)],(count+i*12+a)*5);}const next=gl.createBuffer();if(!next)throw Error('Unable to allocate particle buffer');gl.bindBuffer(gl.ARRAY_BUFFER,next);gl.bufferData(gl.ARRAY_BUFFER,data,gl.STATIC_DRAW);if(gl.getError()!==gl.NO_ERROR){gl.deleteBuffer(next);gl.bindBuffer(gl.ARRAY_BUFFER,this.buffer);throw Error('Particle allocation failed');}for(const [name,size,off] of [['seed',4,0],['age',1,16]]){const loc=gl.getAttribLocation(this.program,name);gl.vertexAttribPointer(loc,size,gl.FLOAT,false,20,off);}const old=this.buffer;this.buffer=next;this.count=count;gl.deleteBuffer(old);}
 setState(state){const i=['idle','listening','thinking','speaking'].indexOf(state);if(i<0)throw Error('Unknown voice state: '+state);if(state==='listening'&&this.state==='idle'){if(this.time-this.dyeStarted>1.1)this.dyeStarted=this.time;}else if(state==='listening'&&state!==this.state)this.dyeStarted=-100;if(state==='thinking'&&this.state==='listening')this.snap=this.time;else if(state!==this.state)this.snap=-100;this.state=state;this.target=[0,0,0,0];this.target[i]=1;}
 setAudioEnvelope(value){this.envelope=Math.max(0,Math.min(1,Number(value)||0));this.acoustics.setEnvelope(this.envelope);}
 configureSecondaryCenter(options){this.acoustics.configureSecondary(options);}
 getAcousticDebug(){return this.acoustics.debug();}
 setAudioSources(sources){this.acoustics.setSources(sources);this.envelope=Math.max(0,...this.acoustics.sources.map(s=>s.targetAmplitude));}
 setAudioFeatures(features){this.acoustics.setFeatures(features);this.envelope=this.acoustics.target.amplitude;}
 async connectAudio(source){this.audioContext ||= new AudioContext();await this.audioContext.resume();this.analyser ||= this.audioContext.createAnalyser();this.analyser.fftSize=256;this.audioSource?.disconnect();this.audioSource=source instanceof MediaStream?this.audioContext.createMediaStreamSource(source):this.audioContext.createMediaElementSource(source);this.audioSource.connect(this.analyser);if(!(source instanceof MediaStream))this.analyser.connect(this.audioContext.destination);this.audioData=new Uint8Array(256);}
 tick(ms){if(this.disposed)return;if(this.canvas.clientWidth<1||this.canvas.clientHeight<1){this.last=ms;this.raf=requestAnimationFrame(this.tick);return;}let dt=Math.min(.04,(ms-(this.last||ms))/1000);this.last=ms;this.time+=dt;const params=this.parameters;const stateSpeed=params.idleSpeed===1&&params.listeningSpeed===1&&params.thinkingSpeed===1&&params.speakingSpeed===1?1:this.weights.reduce((v,w,i)=>v+w*params[['idleSpeed','listeningSpeed','thinkingSpeed','speakingSpeed'][i]],0);this.phase+=dt*(1+this.weights[2]*1.7+this.envelope*this.weights[3]*.24)*params.globalSpeed*stateSpeed;this.frameCount++;if(this.frameCount%60===0){this.canvas.dataset.frames=this.frameCount;this.canvas.dataset.elapsed=this.time.toFixed(2);this.canvas.dataset.contextLost=this.gl.isContextLost();}for(let i=0;i<4;i++)this.weights[i]+=(this.target[i]-this.weights[i])*(1-Math.exp(-dt*9*params.transitionSpeed));for(let w of this.wakes){w[2]*=Math.exp(-dt*4.2);w[3]*=Math.exp(-dt*4.2);}
 if(this.analyser){this.analyser.getByteTimeDomainData(this.audioData);let sum=0;for(let v of this.audioData)sum+=((v-128)/128)**2;this.setAudioEnvelope(Math.sqrt(sum/256)*4)}
 const gl=this.gl,dpr=Math.min(devicePixelRatio,1.7),w=Math.round(this.canvas.clientWidth*dpr),h=Math.round(this.canvas.clientHeight*dpr);if(this.canvas.width!==w||this.canvas.height!==h){this.canvas.width=w;this.canvas.height=h;gl.viewport(0,0,w,h)}this.aspect=w/h;this.scale=this.aspect<1?.30:this.aspect<1.6?.48:.60;gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);gl.useProgram(this.program);let u=this.uniforms;for(let [k,v] of Object.entries({time:this.time,phase:this.phase,aspect:this.aspect,scale:this.scale,audio:this.envelope,pulseTime:this.time-this.pulse,snapTime:(this.time-this.snap)*params.transitionSpeed,dyeTime:(this.time-this.dyeStarted)*params.transitionSpeed,flowStrength:params.flowStrength,turbulence:params.turbulence,trailLength:params.trailLength,trailOpacity:params.trailOpacity,glow:params.glow,mouseStrength:params.mouseStrength}))gl.uniform1f(u[k],v);this.acoustics.update(dt*params.globalSpeed*stateSpeed,this.state==='listening',this.phase);gl.uniform4fv(u.responses,this.acoustics.uniforms());gl.uniform4fv(u.state,this.weights);gl.uniform2fv(u.pulseOrigin,this.pulseOrigin);let wakes=new Float32Array(32);for(let i=0;i<8;i++)wakes.set(this.wakes[i]||[9,9,0,0],i*4);gl.uniform4fv(u.wakes,wakes);gl.uniform1f(u.linePass,0);gl.drawArrays(gl.POINTS,0,this.count);gl.uniform1f(u.linePass,1);gl.drawArrays(gl.LINES,this.count,this.count*12);gl.uniform1f(u.linePass,0);gl.drawArrays(gl.POINTS,this.count,Math.floor(this.count*1.5));this.drawFieldBloom();this.raf=requestAnimationFrame(this.tick);}
 drawFieldBloom(){const overlay=this.eventCanvas;overlay.width=this.canvas.width;overlay.height=this.canvas.height;const ctx=this.eventContext;
 // Bloom samples the actual field; no separate LISTENING object or trail layer.
 const ctxGlow=this.weights[0]+this.weights[1];
 if(ctxGlow>.001){ctx.globalCompositeOperation='lighter';ctx.globalAlpha=(this.weights[0]*.14+this.weights[1]*.28)*this.parameters.glow;ctx.filter='blur('+Math.min(devicePixelRatio,1.7)*(this.weights[0]*6+this.weights[1]*4)/ctxGlow+'px)';ctx.drawImage(this.canvas,0,0);ctx.filter='none';ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';}
 if(this.onFrame)this.onFrame(this);}
 destroy(){if(this.disposed)return;this.disposed=true;cancelAnimationFrame(this.raf);this.onFrame=null;this.eventCanvas.remove();this.canvas.removeEventListener('pointermove',this.onMove);this.canvas.removeEventListener('pointerdown',this.onClick);this.canvas.removeEventListener('pointerleave',this.onLeave);this.audioSource?.disconnect();this.analyser?.disconnect();this.audioContext?.close();this.gl.deleteBuffer(this.buffer);for(const shader of this.shaders)this.gl.deleteShader(shader);this.gl.deleteProgram(this.program);this.gl.getExtension('WEBGL_lose_context')?.loseContext();}
}










