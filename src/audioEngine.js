import { midiStatus } from './midiManager.js'
import { soundEnabled } from './soundEnabled.js'

let _ctx = null
let _compressor = null
let _gen = 0
const _active = new Map() // midiNote → { gainNode, oscs, gen }

function getCtx() {
  if (!_ctx) {
    _ctx = new AudioContext()
    _compressor = _ctx.createDynamicsCompressor()
    _compressor.threshold.value = -18
    _compressor.knee.value = 6
    _compressor.ratio.value = 4
    _compressor.attack.value = 0.003
    _compressor.release.value = 0.1
    _compressor.connect(_ctx.destination)
  }
  if (_ctx.state === 'suspended') _ctx.resume()
  return _ctx
}

function midiToFreq(note) {
  return 440 * Math.pow(2, (note - 69) / 12)
}

export function startNote(midiNote) {
  if (!soundEnabled.value || midiStatus.value === 'connected') return 0
  stopNote(midiNote)

  const ctx = getCtx()
  const freq = midiToFreq(midiNote)
  const now = ctx.currentTime
  const gen = ++_gen

  const gainNode = ctx.createGain()
  gainNode.connect(_compressor)

  const osc = ctx.createOscillator()
  osc.type = 'triangle'
  osc.frequency.value = freq
  osc.connect(gainNode)

  const harm = ctx.createOscillator()
  harm.type = 'sine'
  harm.frequency.value = freq * 2
  const harmGain = ctx.createGain()
  harmGain.gain.value = 0.1
  harm.connect(harmGain)
  harmGain.connect(gainNode)

  gainNode.gain.setValueAtTime(0, now)
  gainNode.gain.linearRampToValueAtTime(0.45, now + 0.008)
  gainNode.gain.exponentialRampToValueAtTime(0.22, now + 0.15)

  osc.start(now)
  harm.start(now)

  _active.set(midiNote, { gainNode, oscs: [osc, harm], gen })
  return gen
}

export function stopNote(midiNote, gen = null) {
  const entry = _active.get(midiNote)
  if (!entry) return
  if (gen !== null && entry.gen !== gen) return
  _active.delete(midiNote)

  const ctx = getCtx()
  const now = ctx.currentTime
  const { gainNode, oscs } = entry

  gainNode.gain.cancelScheduledValues(now)
  gainNode.gain.setValueAtTime(gainNode.gain.value, now)
  gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.25)
  oscs.forEach(o => o.stop(now + 0.26))
}

export function stopAllNotes() {
  for (const midi of [..._active.keys()]) stopNote(midi)
}

export function playNote(midiNote, duration = 1.4) {
  if (!soundEnabled.value || midiStatus.value === 'connected') return
  const gen = startNote(midiNote)
  if (gen) setTimeout(() => stopNote(midiNote, gen), Math.round(duration * 1000))
}

export function playChord(midiNotes, duration = 1.8) {
  if (!soundEnabled.value || midiStatus.value === 'connected') return
  midiNotes.forEach(n => playNote(n, duration))
}
