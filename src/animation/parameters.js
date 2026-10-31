export const PARAMETER_SPECS = Object.freeze({
 globalSpeed:[.25,2.5,1,.05],idleSpeed:[.25,2.5,1,.05],listeningSpeed:[.25,2.5,1,.05],thinkingSpeed:[.25,2.5,1,.05],speakingSpeed:[.25,2.5,1,.05],count:[20000,90000,62000,1000],flowStrength:[.4,1.8,1,.05],turbulence:[0,2,1,.05],trailLength:[.3,2,1,.05],trailOpacity:[0,2,1,.05],glow:[.3,1.8,1,.05],mouseStrength:[0,3,1,.1],transitionSpeed:[.5,2,1,.05]
});
export const ORIGINAL=Object.freeze(Object.fromEntries(Object.entries(PARAMETER_SPECS).map(([k,v])=>[k,v[2]])));
export function validateParameters(patch){if(!patch||typeof patch!=='object'||Array.isArray(patch))throw new TypeError('Expected parameter object');for(const [k,v] of Object.entries(patch)){const spec=Object.prototype.hasOwnProperty.call(PARAMETER_SPECS,k)?PARAMETER_SPECS[k]:null;if(!spec)throw new RangeError('Unknown parameter: '+k);if(typeof v!=='number'||!Number.isFinite(v)||v<spec[0]||v>spec[1]||(k==='count'&&!Number.isInteger(v)))throw new RangeError('Invalid '+k+' ('+spec[0]+'–'+spec[1]+')');}return {...patch};}
export const PRESETS=Object.freeze({ORIGINAL,CALM:{...ORIGINAL,globalSpeed:.75,flowStrength:.8,turbulence:.7,glow:.9},DYNAMIC:{...ORIGINAL,globalSpeed:1.3,flowStrength:1.25,turbulence:1.2,trailOpacity:1.15,glow:1.12}});
export function parseConfiguration(text){const data=JSON.parse(text);if(data?.format!=='space-max-voice-ball'||data.version!==1)throw new Error('Unsupported configuration format/version');const p=validateParameters(data.parameters);if(Object.keys(p).length!==Object.keys(ORIGINAL).length)throw new Error('Configuration must contain all parameters');return p;}
export function serializeConfiguration(parameters){validateParameters(parameters);return JSON.stringify({format:'space-max-voice-ball',version:1,parameters},null,2);}

