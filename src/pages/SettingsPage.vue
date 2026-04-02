<script setup>
import { computed } from 'vue'

const emit = defineEmits(['close'])
import { displayMode } from '../state/displayMode.js'
import { playNote } from '../audio/audioEngine.js'
import { padSize } from '../state/padSize.js'
import { colorMode } from '../state/colorMode.js'
import { colorScheme } from '../state/colorScheme.js'
import { soundEnabled } from '../state/soundEnabled.js'
import { soundStyle } from '../state/soundStyle.js'
import { midiStatus, midiOutputs, selectedOutputId, initMidi, disconnectMidi } from '../audio/midiManager.js'
import { octave } from '../state/octave.js'
import PageHeader from '../components/PageHeader.vue'

const DISPLAY_OPTIONS = [
  { value: 'pad',    label: 'Pad',    desc: 'Chromatic pad grid - pad numbers and note names visible. Layout (4x3 or 4x4) is configurable below.' },
  { value: 'notes',  label: 'Notes',  desc: 'Chromatic strip of the 12 note names - clean and instrument-agnostic.' },
  { value: 'guitar', label: 'Guitar', desc: 'Guitar neck or chord diagrams in standard tuning (E A D G B e).' },
  { value: 'piano',  label: 'Piano',  desc: 'Piano keyboard across one octave.' },
]

const selectedDesc = computed(() => DISPLAY_OPTIONS.find(o => o.value === displayMode.value)?.desc ?? '')

function truncate(name, max = 28) {
  return name.length > max ? name.slice(0, max - 1) + '…' : name
}

const selectedDevice = computed({
  get: () => selectedOutputId.value,
  set: (v) => { selectedOutputId.value = v },
})

function selectSoundStyle(style) {
  soundStyle.value = style
  playNote(60)
}
</script>

<template>
  <div class="card max-w-680 p-6 w-full" style="background: var(--surface)">
    <PageHeader title="Settings">
      <button class="close-btn" @click="emit('close')" aria-label="Close settings">&#x2715;</button>
    </PageHeader>

    <section class="settings-section">
      <h3 class="text-accent text-bold text-tiny text-uppercase letter-spacing-wide mb-1">
Display</h3>
      <p class="text-muted text-small mb-3">Controls how chords and scales are shown across all tools</p>
      <div class="flex-wrap gap-2">
        <button
          v-for="opt in DISPLAY_OPTIONS"
          :key="opt.value"
          class="option-btn btn text-small"
          :class="{ active: displayMode === opt.value }"
          @click="displayMode = opt.value"
        >{{ opt.label }}</button>
      </div>
      <p class="text-muted text-small mt-3" style="line-height: 1.5">{{ selectedDesc }}</p>
    </section>

    <section class="settings-section" v-if="displayMode === 'pad'">
      <h3 class="text-accent text-bold text-tiny text-uppercase letter-spacing-wide mb-1">
Pad Layout</h3>
      <p class="text-muted text-small mb-3">Number of columns in the pad grid</p>
      <div class="flex-wrap gap-2">
        <button class="btn text-small" :class="{ active: padSize === '4x3' }" @click="padSize = '4x3'">4x3 (12 pads)</button>
        <button class="btn text-small" :class="{ active: padSize === '4x4' }" @click="padSize = '4x4'">4x4 (16 pads)</button>
      </div>
    </section>

    <section class="settings-section">
      <h3 class="text-accent text-bold text-tiny text-uppercase letter-spacing-wide mb-1">
Audio</h3>
      <p class="text-muted text-small mb-3">Play sound when tapping notes, chords, and pads</p>
      <div class="flex-wrap gap-2">
        <button class="option-btn btn text-small" :class="{ active: soundEnabled }" @click="soundEnabled = true">On</button>
        <button class="option-btn btn text-small" :class="{ active: !soundEnabled }" @click="soundEnabled = false">Off</button>
      </div>
    </section>

    <section class="settings-section" v-if="soundEnabled">
      <h3 class="text-accent text-bold text-tiny text-uppercase letter-spacing-wide mb-1">
Button Sound Style</h3>
      <p class="text-muted text-small mb-3">Timbre used when tapping pads, keys, and tiles</p>
      <div class="flex-wrap gap-2">
        <button class="btn text-small" v-for="s in ['synth', 'piano', 'bell', 'pluck']" :key="s" :class="{ active: soundStyle === s }" @click="selectSoundStyle(s)">{{ s.charAt(0).toUpperCase() + s.slice(1) }}</button>
      </div>
    </section>

    <section class="settings-section">
      <h3 class="text-accent text-bold text-tiny text-uppercase letter-spacing-wide mb-1">
Theme</h3>
      <div class="flex-wrap gap-2">
        <button class="btn text-small" :class="{ active: colorMode === 'dark' }"  @click="colorMode = 'dark'">Dark</button>
        <button class="btn text-small" :class="{ active: colorMode === 'light' }" @click="colorMode = 'light'">Light</button>
      </div>
    </section>

    <section class="settings-section">
      <h3 class="text-accent text-bold text-tiny text-uppercase letter-spacing-wide mb-1">
Color Scheme</h3>
      <div class="flex-wrap gap-2">
        <button class="btn text-small" :class="{ active: colorScheme === 'none' }" @click="colorScheme = 'none'">Neutral</button>
        <button v-for="s in ['medieval', 'ko2', 'riddim']" :key="s" class="btn text-small flex items-center gap-2" :class="[s, { active: colorScheme === s }]" @click="colorScheme = s">
          <span class="scheme-dot" :class="s"></span>
          {{ s === 'ko2' ? 'K.O. II' : s.charAt(0).toUpperCase() + s.slice(1) }}
        </button>
      </div>
    </section>

    <section class="settings-section" v-if="midiStatus !== 'unsupported'">
      <h3 class="text-accent text-bold text-tiny text-uppercase letter-spacing-wide mb-1">
MIDI</h3>
      <p class="text-muted text-small mb-3">Connect to send chords and notes directly to any MIDI device</p>

      <div class="mt-1">
        <template v-if="midiStatus === 'idle'">
          <button class="btn text-small text-bold" @click="initMidi">Connect MIDI device</button>
        </template>

        <template v-else-if="midiStatus === 'connected'">
          <div class="flex items-center gap-3">
            <span class="midi-dot connected"></span>
            <div class="flex-1 min-w-0">
              <span v-if="midiOutputs.length === 1" class="text-small text-muted">{{ truncate(midiOutputs[0].name) }}</span>
              <select v-else-if="midiOutputs.length > 1" v-model="selectedDevice" class="select w-full" style="max-width: 220px">
                <option v-for="o in midiOutputs" :key="o.id" :value="o.id">{{ truncate(o.name) }}</option>
              </select>
            </div>
            <button class="btn text-tiny text-bold" @click="disconnectMidi">Disconnect</button>
          </div>
          <div class="octave-row flex items-center gap-3 mt-4">
            <span class="text-tiny text-bold text-dim text-uppercase letter-spacing-wide" style="min-width: 4rem">Octave</span>
            <button class="octave-btn btn p-0 flex items-center justify-center" style="width: 1.8rem; height: 1.8rem" @click="octave = Math.max(0, octave - 1)">−</button>
            <span class="text-bold" style="min-width: 1.2rem; text-align: center">{{ octave }}</span>
            <button class="octave-btn btn p-0 flex items-center justify-center" style="width: 1.8rem; height: 1.8rem" @click="octave = Math.min(9, octave + 1)">+</button>
          </div>
        </template>

        <template v-else-if="midiStatus === 'error'">
          <div class="flex items-center gap-3">
            <span class="midi-dot error"></span>
            <span class="text-small text-dim flex-1">MIDI error</span>
            <button class="btn text-tiny text-bold" @click="disconnectMidi">Dismiss</button>
          </div>
        </template>
      </div>
    </section>
  </div>
</template>

<style scoped>
.close-btn {
  background: transparent; border: 1px solid var(--border2); border-radius: 6px;
  color: var(--text3); font-size: 1rem; width: 30px; height: 30px;
  cursor: pointer; display: flex; align-items: center; justify-content: center;
  transition: border-color 0.12s, color 0.12s;
}
.close-btn:hover { border-color: var(--accent); color: var(--text); }

.settings-section { padding: 1.25rem 0; border-top: 1px solid var(--border); }

.scheme-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; border: 1px solid rgba(255,255,255,0.2); }
.scheme-dot.medieval { background: #d4b84c; }
.scheme-dot.ko2      { background: #e05c20; }
.scheme-dot.riddim   { background: #28be70; }

.midi-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.midi-dot.connected { background: var(--midi-ok); }
.midi-dot.error     { background: var(--midi-err); }

@media (max-width: 600px) {
  .p-6 { padding: 1.25rem 1rem !important; }
}
@media (orientation: landscape) and (max-height: 500px) {
  .p-6 { padding: 0.75rem 1rem !important; }
}
</style>
