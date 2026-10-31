import { VoiceBall as Renderer } from './renderer.js';

export const VOICE_BALL_STATES = Object.freeze(['IDLE', 'LISTENING', 'THINKING', 'SPEAKING']);

/** Browser-only, container-mounted adapter over the Voice Ball renderer. */
export class VoiceBall {
  constructor(container, { count = 62000, initialState = 'IDLE' } = {}) {
    if (!(container instanceof HTMLElement)) throw new TypeError('VoiceBall needs an HTMLElement container.');
    if (!Number.isInteger(count) || count < 1) throw new RangeError('count must be a positive integer.');
    this._validateState(initialState);
    this.disposed = false;
    this.element = document.createElement('div');
    Object.assign(this.element.style, { position: 'relative', width: '100%', height: '100%', overflow: 'hidden' });
    this.canvas = document.createElement('canvas');
    this.canvas.setAttribute('aria-label', 'Voice Ball animation');
    Object.assign(this.canvas.style, { position: 'absolute', inset: '0', width: '100%', height: '100%', display: 'block' });
    this.element.append(this.canvas);
    container.append(this.element);
    try {
      this._renderer = new Renderer(this.canvas, { count });
      // Only layout changes: the original fullscreen event canvas now shares the component bounds.
      Object.assign(this._renderer.eventCanvas.style, { position: 'absolute', display: 'block' });
      this.resize();
      this.setState(initialState);
      this._observer = new ResizeObserver(() => { if (!this.disposed) this.resize(); });
      this._observer.observe(this.element);
    } catch (error) {
      this._renderer?.destroy();
      this.canvas.getContext('webgl')?.getExtension('WEBGL_lose_context')?.loseContext();
      this.element.remove();
      throw error;
    }
  }

  _validateState(state) {
    if (!VOICE_BALL_STATES.includes(state)) throw new RangeError(`Unsupported state: ${state}. Use ${VOICE_BALL_STATES.join(', ')}.`);
  }
  _assertActive() { if (this.disposed) throw new Error('VoiceBall has been disposed.'); }
  getAudioLevel() { this._assertActive(); return this._renderer.envelope; }
  getParameters() { this._assertActive(); return {...this._renderer.parameters}; }
  setParameters(patch) { this._assertActive(); return this._renderer.setParameters(patch); }
  getState() { return this._state; }
  setState(state) {
    this._assertActive();
    this._validateState(state);
    this._renderer.setState(state.toLowerCase());
    this._state = state;
    this.element.dispatchEvent(new CustomEvent('voiceballstatechange', { detail: { state } }));
  }
  setAudioEnvelope(value) {
    this._assertActive();
    this._renderer.setAudioEnvelope(value);
  }
  configureSecondaryCenter(options) { this._assertActive(); this._renderer.configureSecondaryCenter(options); }
  getAcousticDebug() { this._assertActive(); return this._renderer.getAcousticDebug(); }
  setAudioSources(sources) { this._assertActive(); this._renderer.setAudioSources(sources); }
  setAudioFeatures(features) { this._assertActive(); this._renderer.setAudioFeatures(features); }
  /** No state changes, microphone requests, playback starts, or ownership of host media tracks. */
  async connectAudio(source) {
    this._assertActive();
    const isStream = typeof MediaStream !== 'undefined' && source instanceof MediaStream;
    if (!isStream && !(source instanceof HTMLMediaElement)) throw new TypeError('Expected a MediaStream or HTMLMediaElement.');
    const renderer = this._renderer;
    const generation = this._audioGeneration = (this._audioGeneration || 0) + 1;
    renderer.audioContext ||= new AudioContext();
    const context = renderer.audioContext;
    await context.resume();
    if (this.disposed || generation !== this._audioGeneration) return;
    this._disconnectAudioNodes();
    this._mediaSources ||= new WeakMap();
    let node;
    if (isStream) node = context.createMediaStreamSource(source);
    else {
      node = this._mediaSources.get(source);
      if (!node) { node = context.createMediaElementSource(source); this._mediaSources.set(source, node); }
    }
    renderer.analyser = context.createAnalyser();
    renderer.analyser.fftSize = 256;
    renderer.audioSource = node;
    node.connect(renderer.analyser);
    // Preserve the existing audible playback route; microphone streams are never monitored.
    if (!isStream) renderer.analyser.connect(context.destination);
    renderer.audioData = new Uint8Array(256);
  }
  _disconnectAudioNodes() {
    this._renderer.audioSource?.disconnect();
    this._renderer.analyser?.disconnect();
    this._renderer.audioSource = null;
    this._renderer.analyser = null;
    this._renderer.audioData = null;
  }
  disconnectAudio() {
    this._assertActive();
    this._audioGeneration = (this._audioGeneration || 0) + 1;
    this._disconnectAudioNodes();
    this._renderer.setAudioEnvelope(0);
  }
  /** Optional dimensions set CSS pixels; otherwise measures the CSS-sized stage. */
  resize(width, height) {
    this._assertActive();
    if (width !== undefined || height !== undefined) {
      if (!Number.isFinite(width) || !Number.isFinite(height) || width < 0 || height < 0) throw new RangeError('Provide nonnegative width and height in CSS pixels.');
      this.element.style.width = `${width}px`;
      this.element.style.height = `${height}px`;
    }
    const dpr = Math.min(devicePixelRatio, 1.7);
    const w = Math.round(this.canvas.clientWidth * dpr), h = Math.round(this.canvas.clientHeight * dpr);
    if (w > 0 && h > 0) {
      this.canvas.width = w; this.canvas.height = h;
      this._renderer.gl.viewport(0, 0, w, h);
      this._renderer.aspect = w / h;
      this._renderer.scale = w / h < 1 ? .30 : w / h < 1.6 ? .48 : .60;
    }
    return { width: this.canvas.clientWidth, height: this.canvas.clientHeight, pixelRatio: dpr };
  }
  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    this._audioGeneration = (this._audioGeneration || 0) + 1;
    this._observer?.disconnect();
    this._renderer.destroy();
    this._mediaSources = null;
    this.element.remove();
  }
  destroy() { this.dispose(); }
}

export function mountVoiceBall(container, options) { return new VoiceBall(container, options); }
