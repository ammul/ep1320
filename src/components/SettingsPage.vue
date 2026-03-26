<script setup>
import { computed } from 'vue'
import { displayMode } from '../displayMode.js'
import { colorMode } from '../colorMode.js'
import { midiStatus, midiOutputs, selectedOutputId, initMidi, disconnectMidi } from '../midiManager.js'

const DISPLAY_OPTIONS = [
  { value: 'ep1320', label: 'EP-1320', desc: '4×3 pad grid matching the EP-1320 layout — pad numbers and note names visible.' },
  { value: 'notes',  label: 'Notes',   desc: 'Chromatic strip of the 12 note names — clean and instrument-agnostic.' },
  { value: 'guitar', label: 'Guitar',  desc: 'Guitar neck or chord diagrams in standard tuning (E A D G B e).' },
  { value: 'piano',  label: 'Piano',   desc: 'Piano keyboard across one octave.' },
]

const selectedDesc = computed(() => DISPLAY_OPTIONS.find(o => o.value === displayMode.value)?.desc ?? '')

function truncate(name, max = 28) {
  return name.length > max ? name.slice(0, max - 1) + '…' : name
}

const selectedDevice = computed({
  get: () => selectedOutputId.value,
  set: (v) => { selectedOutputId.value = v },
})
</script>

<template>
  <div class="settings-page">
    <div class="settings-header">
      <h2>Settings</h2>
    </div>

    <section class="settings-section">
      <h3>Display</h3>
      <p class="section-desc">Controls how chords and scales are shown across all tools.</p>
      <div class="option-group">
        <button
          v-for="opt in DISPLAY_OPTIONS"
          :key="opt.value"
          class="option-btn"
          :class="{ active: displayMode === opt.value }"
          @click="displayMode = opt.value"
        >{{ opt.label }}</button>
      </div>
      <p class="option-desc">{{ selectedDesc }}</p>
    </section>

    <section class="settings-section">
      <h3>Theme</h3>
      <div class="option-group">
        <button class="option-btn" :class="{ active: colorMode === 'dark' }" @click="colorMode = 'dark'">Dark</button>
        <button class="option-btn" :class="{ active: colorMode === 'light' }" @click="colorMode = 'light'">Light</button>
      </div>
    </section>

    <section class="settings-section" v-if="midiStatus !== 'unsupported'">
      <h3>MIDI</h3>
      <p class="section-desc">Connect to send chords and notes directly to your EP-1320 or any MIDI device.</p>

      <div class="midi-panel">
        <template v-if="midiStatus === 'idle'">
          <button class="midi-connect-btn" @click="initMidi">Connect MIDI device</button>
        </template>

        <template v-else-if="midiStatus === 'connected'">
          <div class="midi-connected-row">
            <span class="midi-dot connected"></span>
            <span class="midi-device-name">
              <span v-if="midiOutputs.length === 1">{{ truncate(midiOutputs[0].name) }}</span>
              <select v-else-if="midiOutputs.length > 1" v-model="selectedDevice" class="midi-select">
                <option v-for="o in midiOutputs" :key="o.id" :value="o.id">{{ truncate(o.name) }}</option>
              </select>
            </span>
            <button class="midi-disconnect-btn" @click="disconnectMidi">Disconnect</button>
          </div>
        </template>

        <template v-else-if="midiStatus === 'error'">
          <div class="midi-connected-row">
            <span class="midi-dot error"></span>
            <span class="midi-device-name muted">MIDI error</span>
            <button class="midi-disconnect-btn" @click="disconnectMidi">Dismiss</button>
          </div>
        </template>
      </div>
    </section>
  </div>
</template>

<style scoped>
.settings-page {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 2rem;
  max-width: 480px;
}

.settings-header h2 {
  font-size: 1.4rem;
  color: var(--accent);
  letter-spacing: 0.05em;
  text-transform: uppercase;
  margin-bottom: 1.75rem;
}

.settings-section {
  padding: 1.25rem 0;
  border-top: 1px solid var(--border);
}

.settings-section h3 {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--accent);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 0.5rem;
}

.section-desc {
  font-size: 0.82rem;
  color: var(--text3);
  line-height: 1.5;
  margin-bottom: 0.85rem;
}

.option-group {
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
}

.option-btn {
  padding: 0.35rem 0.9rem;
  border-radius: 6px;
  border: 1px solid var(--border2);
  background: var(--input);
  color: var(--text2);
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.12s, border-color 0.12s, color 0.12s;
}

.option-btn:hover  { border-color: var(--accent); color: var(--text); }
.option-btn.active { background: var(--accent); border-color: var(--accent); color: var(--on-accent); }

.option-desc {
  margin-top: 0.65rem;
  font-size: 0.82rem;
  color: var(--text3);
  line-height: 1.5;
}

/* MIDI */
.midi-panel {
  margin-top: 0.25rem;
}

.midi-connect-btn {
  padding: 0.45rem 1.1rem;
  border-radius: 6px;
  border: 1px solid var(--border2);
  background: var(--input);
  color: var(--text2);
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.12s, border-color 0.12s, color 0.12s;
}

.midi-connect-btn:hover { border-color: var(--accent); color: var(--accent); }

.midi-connected-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.midi-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.midi-dot.connected { background: var(--midi-ok); }
.midi-dot.error     { background: var(--midi-err); }

.midi-device-name {
  font-size: 0.85rem;
  color: var(--text2);
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.midi-device-name.muted { color: var(--text4); }

.midi-select {
  background: var(--input);
  border: 1px solid var(--border2);
  border-radius: 6px;
  color: var(--text);
  padding: 0.2rem 0.5rem;
  font-size: 0.82rem;
  cursor: pointer;
  outline: none;
  max-width: 220px;
}

.midi-select:focus { border-color: var(--accent); }

.midi-disconnect-btn {
  padding: 0.3rem 0.7rem;
  border-radius: 5px;
  border: 1px solid var(--border2);
  background: transparent;
  color: var(--text3);
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  flex-shrink: 0;
  transition: border-color 0.12s, color 0.12s;
}

.midi-disconnect-btn:hover { border-color: var(--accent); color: var(--text); }

@media (max-width: 600px) {
  .settings-page {
    padding: 1.25rem 1rem;
  }
}

@media (orientation: landscape) and (max-height: 500px) {
  .settings-page {
    padding: 0.75rem 1rem;
  }

  .settings-header h2 {
    font-size: 1.1rem;
    margin-bottom: 1rem;
  }
}
</style>
