import { ref } from 'vue'

export const midiStatus = ref('idle')        // 'idle' | 'connected' | 'error' | 'unsupported'
export const midiOutputs = ref([])           // MIDIOutput[]
export const selectedOutputId = ref(null)
export const midiChannel = ref(0)            // 0–3 = lanes A–D

let _access = null

export function disconnectMidi() {
  if (_access) _access.onstatechange = null
  _access = null
  midiOutputs.value = []
  selectedOutputId.value = null
  midiStatus.value = 'idle'
}

export async function initMidi() {
  if (!navigator.requestMIDIAccess) { midiStatus.value = 'unsupported'; return }
  try {
    _access = await navigator.requestMIDIAccess()
    _refreshOutputs()
    _access.onstatechange = _refreshOutputs
    midiStatus.value = 'connected'
  } catch {
    midiStatus.value = 'error'
  }
}

function _refreshOutputs() {
  midiOutputs.value = [..._access.outputs.values()]
  if (!midiOutputs.value.find(o => o.id === selectedOutputId.value))
    selectedOutputId.value = midiOutputs.value[0]?.id ?? null
}

function _out() {
  return midiOutputs.value.find(o => o.id === selectedOutputId.value) ?? null
}

export function noteOn(midi, velocity = 100) {
  _out()?.send([0x90 | midiChannel.value, midi, velocity])
}
export function noteOff(midi) {
  _out()?.send([0x80 | midiChannel.value, midi, 0])
}
export function chordOn(midis, velocity = 90) {
  midis.forEach(m => noteOn(m, velocity))
}
export function chordOff(midis) {
  midis.forEach(m => noteOff(m))
}
