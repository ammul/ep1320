<script setup>
import { computed } from 'vue'
import { midiStatus, midiOutputs, selectedOutputId, initMidi, disconnectMidi } from '../midiManager.js'

function truncate(name, max = 20) {
  return name.length > max ? name.slice(0, max - 1) + '…' : name
}

const selectedDevice = computed({
  get: () => selectedOutputId.value,
  set: (v) => { selectedOutputId.value = v },
})
</script>

<template>
  <div v-if="midiStatus !== 'unsupported'" class="midi-control">
    <button v-if="midiStatus === 'idle'" class="midi-btn" @click="initMidi">MIDI</button>

    <template v-else-if="midiStatus === 'connected'">
      <span class="midi-dot connected"></span>
      <span v-if="midiOutputs.length === 1" class="midi-name">{{ truncate(midiOutputs[0].name) }}</span>
      <select v-else-if="midiOutputs.length > 1" v-model="selectedDevice" class="midi-select">
        <option v-for="o in midiOutputs" :key="o.id" :value="o.id">{{ truncate(o.name) }}</option>
      </select>
      <button class="midi-disconnect" @click="disconnectMidi" aria-label="Disconnect MIDI">&#x2715;</button>
    </template>

    <template v-else-if="midiStatus === 'error'">
      <span class="midi-dot error"></span>
      <span class="midi-name muted">MIDI error</span>
      <button class="midi-disconnect" @click="disconnectMidi" aria-label="Dismiss">&#x2715;</button>
    </template>
  </div>
</template>

<style scoped>
.midi-control {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  flex-shrink: 0;
}

.midi-btn {
  height: 36px;
  padding: 0 0.75rem;
  background: transparent;
  border: 1px solid var(--border2);
  border-radius: 6px;
  cursor: pointer;
  color: var(--text3);
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  transition: border-color 0.15s, color 0.15s;
}

.midi-btn:hover {
  border-color: var(--accent);
  color: var(--accent);
}

.midi-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.midi-dot.connected { background: var(--midi-ok); }
.midi-dot.error     { background: var(--midi-err); }

.midi-name {
  font-size: 0.78rem;
  color: var(--text2);
  white-space: nowrap;
  max-width: 130px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.midi-name.muted { color: var(--text4); }

.midi-select {
  background: var(--input);
  border: 1px solid var(--border2);
  border-radius: 6px;
  color: var(--text);
  padding: 0.2rem 0.5rem;
  font-size: 0.78rem;
  cursor: pointer;
  outline: none;
  max-width: 130px;
}

.midi-select:focus { border-color: var(--accent); }

.midi-disconnect {
  width: 20px;
  height: 20px;
  background: transparent;
  border: none;
  color: var(--text4);
  font-size: 0.75rem;
  cursor: pointer;
  padding: 0;
  line-height: 1;
  transition: color 0.15s;
  flex-shrink: 0;
}

.midi-disconnect:hover { color: var(--text); }
</style>
