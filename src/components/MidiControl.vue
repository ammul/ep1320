<script setup>
import { computed } from 'vue'
import { midiStatus, midiOutputs, selectedOutputId, initMidi, disconnectMidi } from '../audio/midiManager.js'

function truncate(name, max = 20) {
  return name.length > max ? name.slice(0, max - 1) + '…' : name
}

const selectedDevice = computed({
  get: () => selectedOutputId.value,
  set: (v) => { selectedOutputId.value = v },
})
</script>

<template>
  <div v-if="midiStatus !== 'unsupported'" class="flex items-center gap-2 flex-shrink-0">
    <button v-if="midiStatus === 'idle'" class="btn text-bold letter-spacing-wide text-uppercase" style="height: 36px" @click="initMidi">MIDI</button>

    <template v-else-if="midiStatus === 'connected'">
      <span class="midi-dot connected"></span>
      <span v-if="midiOutputs.length === 1" class="text-small text-muted" style="max-width: 130px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap">{{ truncate(midiOutputs[0].name) }}</span>
      <select v-else-if="midiOutputs.length > 1" v-model="selectedDevice" class="select" style="max-width: 130px">
        <option v-for="o in midiOutputs" :key="o.id" :value="o.id">{{ truncate(o.name) }}</option>
      </select>
      <button class="midi-disconnect" @click="disconnectMidi" aria-label="Disconnect MIDI">&#x2715;</button>
    </template>

    <template v-else-if="midiStatus === 'error'">
      <span class="midi-dot error"></span>
      <span class="text-small text-dim">MIDI error</span>
      <button class="midi-disconnect" @click="disconnectMidi" aria-label="Dismiss">&#x2715;</button>
    </template>
  </div>
</template>

<style scoped>
.midi-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.midi-dot.connected { background: var(--midi-ok); }
.midi-dot.error     { background: var(--midi-err); }

.midi-disconnect {
  width: 20px; height: 20px; background: transparent; border: none;
  color: var(--text4); font-size: 0.75rem; cursor: pointer;
  padding: 0; line-height: 1; transition: color 0.15s; flex-shrink: 0;
}
.midi-disconnect:hover { color: var(--text); }
</style>
