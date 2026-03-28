import { ref } from 'vue'

export const INSTRUMENTS = [
  'Kick', 'Snare', 'Hi-Hat Closed', 'Hi-Hat Open',
  'High Tom', 'Mid Tom', 'Floor Tom', 'Crash',
]

export const pattern     = ref(Array.from({ length: 8 }, () => new Array(16).fill(false)))
export const bpm         = ref(120)
export const isPlaying   = ref(false)
export const currentStep = ref(0)

let _ctx = null
let _noiseBuffer = null

function getCtx() {
  if (!_ctx) _ctx = new AudioContext()
  if (_ctx.state === 'suspended') _ctx.resume()
  return _ctx
}

function getNoiseBuffer(ctx) {
  if (_noiseBuffer) return _noiseBuffer
  const len = ctx.sampleRate * 1
  const buf = ctx.createBuffer(1, len, ctx.sampleRate)
  const data = buf.getChannelData(0)
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1
  _noiseBuffer = buf
  return buf
}

function playKick(ctx, when) {
  const osc  = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(150, when)
  osc.frequency.exponentialRampToValueAtTime(30, when + 0.5)
  gain.gain.setValueAtTime(1.0, when)
  gain.gain.exponentialRampToValueAtTime(0.001, when + 0.5)
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.start(when)
  osc.stop(when + 0.5)
}

function playSnare(ctx, when) {
  const osc    = ctx.createOscillator()
  const oscGain = ctx.createGain()
  osc.type = 'sine'
  osc.frequency.value = 200
  oscGain.gain.setValueAtTime(0.5, when)
  oscGain.gain.exponentialRampToValueAtTime(0.001, when + 0.15)
  osc.connect(oscGain)
  oscGain.connect(ctx.destination)
  osc.start(when)
  osc.stop(when + 0.15)

  const noise     = ctx.createBufferSource()
  noise.buffer    = getNoiseBuffer(ctx)
  const noiseGain = ctx.createGain()
  noiseGain.gain.setValueAtTime(0.8, when)
  noiseGain.gain.exponentialRampToValueAtTime(0.001, when + 0.15)
  noise.connect(noiseGain)
  noiseGain.connect(ctx.destination)
  noise.start(when)
  noise.stop(when + 0.15)
}

function playHiHatClosed(ctx, when) {
  const noise  = ctx.createBufferSource()
  noise.buffer = getNoiseBuffer(ctx)
  const hpf    = ctx.createBiquadFilter()
  hpf.type = 'highpass'
  hpf.frequency.value = 8000
  const gain = ctx.createGain()
  gain.gain.setValueAtTime(0.6, when)
  gain.gain.exponentialRampToValueAtTime(0.001, when + 0.05)
  noise.connect(hpf)
  hpf.connect(gain)
  gain.connect(ctx.destination)
  noise.start(when)
  noise.stop(when + 0.05)
}

function playHiHatOpen(ctx, when) {
  const noise  = ctx.createBufferSource()
  noise.buffer = getNoiseBuffer(ctx)
  const hpf    = ctx.createBiquadFilter()
  hpf.type = 'highpass'
  hpf.frequency.value = 7000
  const gain = ctx.createGain()
  gain.gain.setValueAtTime(0.5, when)
  gain.gain.exponentialRampToValueAtTime(0.001, when + 0.3)
  noise.connect(hpf)
  hpf.connect(gain)
  gain.connect(ctx.destination)
  noise.start(when)
  noise.stop(when + 0.3)
}

function playTom(ctx, when, freqStart, freqEnd, dur) {
  const osc  = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(freqStart, when)
  osc.frequency.exponentialRampToValueAtTime(freqEnd, when + dur)
  gain.gain.setValueAtTime(0.8, when)
  gain.gain.exponentialRampToValueAtTime(0.001, when + dur)
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.start(when)
  osc.stop(when + dur)
}

function playCrash(ctx, when) {
  const noise  = ctx.createBufferSource()
  noise.buffer = getNoiseBuffer(ctx)
  const bpf    = ctx.createBiquadFilter()
  bpf.type = 'bandpass'
  bpf.frequency.value = 5000
  bpf.Q.value = 0.5
  const gain = ctx.createGain()
  gain.gain.setValueAtTime(0.7, when)
  gain.gain.exponentialRampToValueAtTime(0.001, when + 1.0)
  noise.connect(bpf)
  bpf.connect(gain)
  gain.connect(ctx.destination)
  noise.start(when)
  noise.stop(when + 1.0)
}

const PLAY_FNS = [
  playKick,
  playSnare,
  playHiHatClosed,
  playHiHatOpen,
  (ctx, when) => playTom(ctx, when, 200, 80, 0.2),
  (ctx, when) => playTom(ctx, when, 120, 50, 0.25),
  (ctx, when) => playTom(ctx, when, 80, 35, 0.3),
  playCrash,
]

const LOOKAHEAD = 0.1
const TICK_MS   = 25

let _nextStepTime  = 0
let _schedulerTimer = null

function _tick() {
  const ctx     = getCtx()
  const stepDur = 60 / bpm.value / 4

  while (_nextStepTime < ctx.currentTime + LOOKAHEAD) {
    const step = currentStep.value
    for (let i = 0; i < 8; i++) {
      if (pattern.value[i][step]) PLAY_FNS[i](ctx, _nextStepTime)
    }
    currentStep.value = (step + 1) % 16
    _nextStepTime += stepDur
  }

  _schedulerTimer = setTimeout(_tick, TICK_MS)
}

export function play() {
  if (isPlaying.value) return
  const ctx = getCtx()
  isPlaying.value = true
  _nextStepTime = ctx.currentTime + 0.05
  _tick()
}

export function pause() {
  isPlaying.value = false
  clearTimeout(_schedulerTimer)
  _schedulerTimer = null
  currentStep.value = 0
}

export function clearPattern() {
  pattern.value = Array.from({ length: 8 }, () => new Array(16).fill(false))
}

export function toggleCell(inst, step) {
  const copy = pattern.value.map(row => [...row])
  copy[inst][step] = !copy[inst][step]
  pattern.value = copy

}
