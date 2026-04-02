import { midiStatus } from './midiManager.js'
import { soundEnabled } from '../state/soundEnabled.js'
import { soundStyle } from '../state/soundStyle.js'

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

  const style = soundStyle.value
  let oscs

  if (style === 'bell') {
    // Inharmonic metallic partials — characteristic of real bells
    gainNode.gain.setValueAtTime(0.3, now)
    const partials = [
      { ratio: 1.0,   level: 0.55, decay: 4.0 },
      { ratio: 2.756, level: 0.28, decay: 2.2 },
      { ratio: 5.404, level: 0.14, decay: 1.1 },
      { ratio: 8.0,   level: 0.05, decay: 0.5 },
    ]
    oscs = partials.map(p => {
      const o = ctx.createOscillator()
      o.type = 'sine'
      o.frequency.value = freq * p.ratio
      const g = ctx.createGain()
      g.gain.setValueAtTime(p.level, now + 0.002)
      g.gain.exponentialRampToValueAtTime(0.001, now + p.decay)
      o.connect(g)
      g.connect(gainNode)
      o.start(now)
      return o
    })

  } else if (style === 'piano') {
    // Triangle fundamental + high harmonics that decay fast for a bright percussive attack
    const osc = ctx.createOscillator()
    osc.type = 'triangle'
    osc.frequency.value = freq
    osc.connect(gainNode)

    const h4 = ctx.createOscillator()
    h4.type = 'sine'
    h4.frequency.value = freq * 4
    const h4g = ctx.createGain()
    h4g.gain.setValueAtTime(0.22, now)
    h4g.gain.exponentialRampToValueAtTime(0.001, now + 0.2)
    h4.connect(h4g)
    h4g.connect(gainNode)

    const h9 = ctx.createOscillator()
    h9.type = 'sine'
    h9.frequency.value = freq * 9
    const h9g = ctx.createGain()
    h9g.gain.setValueAtTime(0.07, now)
    h9g.gain.exponentialRampToValueAtTime(0.001, now + 0.07)
    h9.connect(h9g)
    h9g.connect(gainNode)

    gainNode.gain.setValueAtTime(0, now)
    gainNode.gain.linearRampToValueAtTime(0.42, now + 0.007)
    gainNode.gain.exponentialRampToValueAtTime(0.14, now + 0.6)
    gainNode.gain.exponentialRampToValueAtTime(0.07, now + 2.5)

    osc.start(now); h4.start(now); h9.start(now)
    oscs = [osc, h4, h9]

  } else if (style === 'pluck') {
    // Guitar/harp-like — bright pick transient, then warm decay over ~2s
    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(freq * 14, now)
    filter.frequency.exponentialRampToValueAtTime(freq * 2.5, now + 0.6)
    filter.Q.value = 1
    filter.connect(gainNode)

    const osc = ctx.createOscillator()
    osc.type = 'sawtooth'
    osc.frequency.value = freq
    osc.connect(filter)

    gainNode.gain.setValueAtTime(0, now)
    gainNode.gain.linearRampToValueAtTime(0.5, now + 0.003)
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 2.2)

    osc.start(now)
    osc.stop(now + 2.3)
    oscs = [osc]

  } else {
    // 'synth' — detuned sawtooth pad through a lowpass filter
    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.value = freq * 5
    filter.Q.value = 2.5
    filter.connect(gainNode)

    const osc1 = ctx.createOscillator()
    osc1.type = 'sawtooth'
    osc1.frequency.value = freq
    osc1.connect(filter)

    const osc2 = ctx.createOscillator()
    osc2.type = 'sawtooth'
    osc2.frequency.value = freq * 1.004
    const osc2g = ctx.createGain()
    osc2g.gain.value = 0.65
    osc2.connect(osc2g)
    osc2g.connect(filter)

    gainNode.gain.setValueAtTime(0, now)
    gainNode.gain.linearRampToValueAtTime(0.28, now + 0.055)
    gainNode.gain.setValueAtTime(0.28, now + 0.1)

    osc1.start(now); osc2.start(now)
    oscs = [osc1, osc2]
  }

  _active.set(midiNote, { gainNode, oscs, gen })
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
  oscs.forEach(o => { try { o.stop(now + 0.26) } catch (_) {} })
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
