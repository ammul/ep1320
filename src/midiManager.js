import { ref } from 'vue'

export const midiStatus = ref('idle')        // 'idle' | 'connected' | 'error' | 'unsupported'
export const midiOutputs = ref([])           // MIDIOutput[]
export const selectedOutputId = ref(null)

let _access = null

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

export function noteOn(midi, velocity = 100, channel = 0) {
  _out()?.send([0x90 | channel, midi, velocity])
}
export function noteOff(midi, channel = 0) {
  _out()?.send([0x80 | channel, midi, 0])
}
export function chordOn(midis, velocity = 90, channel = 0) {
  midis.forEach(m => noteOn(m, velocity, channel))
}
export function chordOff(midis, channel = 0) {
  midis.forEach(m => noteOff(m, channel))
}
