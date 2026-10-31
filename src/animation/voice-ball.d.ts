export type VoiceBallState = 'IDLE' | 'LISTENING' | 'THINKING' | 'SPEAKING';
export interface AcousticSource { id?: string; position?: { x: number; y: number }; direction?: { x: number; y: number }; azimuth?: number; amplitude: number; speakingRate: number; isSpeechActive: boolean; }
export interface VoiceBallOptions { count?: number; initialState?: VoiceBallState; }
export const VOICE_BALL_STATES: readonly VoiceBallState[];
export class VoiceBall {
  constructor(container: HTMLElement, options?: VoiceBallOptions);
  readonly element: HTMLDivElement;
  readonly canvas: HTMLCanvasElement;
  readonly disposed: boolean;
  getAudioLevel(): number;
  getParameters(): Record<'globalSpeed'|'idleSpeed'|'listeningSpeed'|'thinkingSpeed'|'speakingSpeed'|'count'|'flowStrength'|'turbulence'|'trailLength'|'trailOpacity'|'glow'|'mouseStrength'|'transitionSpeed', number>;
  setParameters(patch: Partial<ReturnType<VoiceBall['getParameters']>>): ReturnType<VoiceBall['getParameters']>;
  getState(): VoiceBallState;
  setState(state: VoiceBallState): void;
  setAudioEnvelope(value: number): void;
  setAudioFeatures(features: { amplitude: number; speakingRate: number; isSpeechActive: boolean; sourcePosition?: { x: number; y: number }; direction?: { x: number; y: number }; azimuth?: number }): void;
  configureSecondaryCenter(options: { enabled?: boolean; seed?: number; force?: boolean }): void;
  getAcousticDebug(): { emitters: Array<{ id: string; role: string; x: number | null; y: number | null; active: boolean }>; wavefronts: number; secondaryEnabled: boolean; seed: number };
  setAudioSources(sources: AcousticSource[]): void;
  connectAudio(source: MediaStream | HTMLMediaElement): Promise<void>;
  disconnectAudio(): void;
  resize(width?: number, height?: number): { width: number; height: number; pixelRatio: number };
  dispose(): void;
  destroy(): void;
}
export function mountVoiceBall(container: HTMLElement, options?: VoiceBallOptions): VoiceBall;
