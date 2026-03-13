<script setup>
import { ref, computed, watch } from 'vue'
import { displayMode } from '../displayMode.js'
import { NOTES, LABELS, SHARPS, CHORD_TYPES, CHORD_SUFFIX } from '../musicConstants.js'
import { buildRows } from '../musicUtils.js'
import ChordCardBody from './ChordCardBody.vue'
import { chordOn, chordOff } from '../midiManager.js'

const PROGRESSIONS = {
  major: [
    {
      id: 'I-V-vi-IV',
      label: 'I – V – vi – IV',
      description: 'Pop / rock workhorse (Let It Be, No Woman No Cry, …)',
      chords: [
        { degree: 0, type: 'maj', numeral: 'I' },
        { degree: 7, type: 'maj', numeral: 'V' },
        { degree: 9, type: 'min', numeral: 'vi' },
        { degree: 5, type: 'maj', numeral: 'IV' },
      ],
    },
    {
      id: 'I-IV-V',
      label: 'I – IV – V',
      description: '12-bar blues foundation',
      chords: [
        { degree: 0, type: 'maj', numeral: 'I' },
        { degree: 5, type: 'maj', numeral: 'IV' },
        { degree: 7, type: 'maj', numeral: 'V' },
      ],
    },
    {
      id: 'I-vi-IV-V',
      label: 'I – vi – IV – V',
      description: '50s doo-wop (Stand By Me, Every Breath You Take, …)',
      chords: [
        { degree: 0, type: 'maj', numeral: 'I' },
        { degree: 9, type: 'min', numeral: 'vi' },
        { degree: 5, type: 'maj', numeral: 'IV' },
        { degree: 7, type: 'maj', numeral: 'V' },
      ],
    },
    {
      id: 'ii-V-I',
      label: 'ii⁷ – V⁷ – Imaj7',
      description: 'Jazz turnaround',
      chords: [
        { degree: 2, type: 'min7', numeral: 'ii⁷' },
        { degree: 7, type: 'dom7', numeral: 'V⁷' },
        { degree: 0, type: 'maj7', numeral: 'Imaj7' },
      ],
    },
    {
      id: 'I-V-vi-iii-IV',
      label: 'I – V – vi – iii – IV',
      description: 'Canon in D (Pachelbel)',
      chords: [
        { degree: 0, type: 'maj', numeral: 'I' },
        { degree: 7, type: 'maj', numeral: 'V' },
        { degree: 9, type: 'min', numeral: 'vi' },
        { degree: 4, type: 'min', numeral: 'iii' },
        { degree: 5, type: 'maj', numeral: 'IV' },
      ],
    },
    {
      id: 'I-IV-I-V',
      label: 'I – IV – I – V',
      description: 'Country / folk cadence',
      chords: [
        { degree: 0, type: 'maj', numeral: 'I' },
        { degree: 5, type: 'maj', numeral: 'IV' },
        { degree: 0, type: 'maj', numeral: 'I' },
        { degree: 7, type: 'maj', numeral: 'V' },
      ],
    },
    {
      id: 'I-iii-IV-V',
      label: 'I – iii – IV – V',
      description: 'Classic rock build (Brown Eyed Girl, La Bamba)',
      chords: [
        { degree: 0, type: 'maj', numeral: 'I' },
        { degree: 4, type: 'min', numeral: 'iii' },
        { degree: 5, type: 'maj', numeral: 'IV' },
        { degree: 7, type: 'maj', numeral: 'V' },
      ],
    },
    {
      id: 'I-IV-vi-V',
      label: 'I – IV – vi – V',
      description: 'Upbeat pop (Walking on Sunshine feel)',
      chords: [
        { degree: 0, type: 'maj', numeral: 'I' },
        { degree: 5, type: 'maj', numeral: 'IV' },
        { degree: 9, type: 'min', numeral: 'vi' },
        { degree: 7, type: 'maj', numeral: 'V' },
      ],
    },
    {
      id: 'I-V-IV-V',
      label: 'I – V – IV – V',
      description: 'Rock shuffle (La Grange, Sweet Home Chicago)',
      chords: [
        { degree: 0, type: 'maj', numeral: 'I' },
        { degree: 7, type: 'maj', numeral: 'V' },
        { degree: 5, type: 'maj', numeral: 'IV' },
        { degree: 7, type: 'maj', numeral: 'V' },
      ],
    },
    {
      id: 'Imaj7-IVmaj7-ii7-V7',
      label: 'Imaj7 – IVmaj7 – ii⁷ – V⁷',
      description: 'Neo-soul / smooth jazz groove (Isn\'t She Lovely feel)',
      chords: [
        { degree: 0, type: 'maj7', numeral: 'Imaj7' },
        { degree: 5, type: 'maj7', numeral: 'IVmaj7' },
        { degree: 2, type: 'min7', numeral: 'ii⁷' },
        { degree: 7, type: 'dom7', numeral: 'V⁷' },
      ],
    },
    {
      id: 'I-bVII-IV-I',
      label: 'I – ♭VII – IV – I',
      description: 'Mixolydian rock (Sweet Home Alabama, Hey Jude)',
      chords: [
        { degree: 0,  type: 'maj', numeral: 'I' },
        { degree: 10, type: 'maj', numeral: '♭VII' },
        { degree: 5,  type: 'maj', numeral: 'IV' },
        { degree: 0,  type: 'maj', numeral: 'I' },
      ],
    },
  ],
  minor: [
    {
      id: 'i-VI-III-VII',
      label: 'i – VI – III – VII',
      description: 'Minor pop / anthemic rock (Stairway, Smells Like Teen Spirit, …)',
      chords: [
        { degree: 0,  type: 'min', numeral: 'i' },
        { degree: 8,  type: 'maj', numeral: 'VI' },
        { degree: 3,  type: 'maj', numeral: 'III' },
        { degree: 10, type: 'maj', numeral: 'VII' },
      ],
    },
    {
      id: 'i-VII-VI-VII',
      label: 'i – VII – VI – V',
      description: 'Andalusian cadence (flamenco / Andalusian)',
      chords: [
        { degree: 0,  type: 'min', numeral: 'i' },
        { degree: 10, type: 'maj', numeral: 'VII' },
        { degree: 8,  type: 'maj', numeral: 'VI' },
        { degree: 7,  type: 'maj', numeral: 'V' },
      ],
    },
    {
      id: 'i-iv-V',
      label: 'i – iv – V',
      description: 'Harmonic minor cadence',
      chords: [
        { degree: 0, type: 'min', numeral: 'i' },
        { degree: 5, type: 'min', numeral: 'iv' },
        { degree: 7, type: 'maj', numeral: 'V' },
      ],
    },
    {
      id: 'i-VI-VII',
      label: 'i – VI – VII',
      description: 'Dark rock loop (Fly Away, Smoke on the Water feel)',
      chords: [
        { degree: 0,  type: 'min', numeral: 'i' },
        { degree: 8,  type: 'maj', numeral: 'VI' },
        { degree: 10, type: 'maj', numeral: 'VII' },
      ],
    },
    {
      id: 'i-iv-i-V',
      label: 'i – iv – i – V',
      description: 'Tango / flamenco',
      chords: [
        { degree: 0, type: 'min', numeral: 'i' },
        { degree: 5, type: 'min', numeral: 'iv' },
        { degree: 0, type: 'min', numeral: 'i' },
        { degree: 7, type: 'maj', numeral: 'V' },
      ],
    },
    {
      id: 'ii-dim-V-i',
      label: 'ii° – V⁷ – i',
      description: 'Jazz minor turnaround',
      chords: [
        { degree: 2, type: 'dim',  numeral: 'ii°' },
        { degree: 7, type: 'dom7', numeral: 'V⁷' },
        { degree: 0, type: 'min',  numeral: 'i' },
      ],
    },
    {
      id: 'i-III-VII-VI',
      label: 'i – III – VII – VI',
      description: 'Epic cinematic / game soundtrack (Game of Thrones feel)',
      chords: [
        { degree: 0,  type: 'min', numeral: 'i' },
        { degree: 3,  type: 'maj', numeral: 'III' },
        { degree: 10, type: 'maj', numeral: 'VII' },
        { degree: 8,  type: 'maj', numeral: 'VI' },
      ],
    },
    {
      id: 'i-v-VI-III',
      label: 'i – v – VI – III',
      description: 'Dorian minor groove (Oye Como Va, Evil Ways)',
      chords: [
        { degree: 0, type: 'min', numeral: 'i' },
        { degree: 7, type: 'min', numeral: 'v' },
        { degree: 8, type: 'maj', numeral: 'VI' },
        { degree: 3, type: 'maj', numeral: 'III' },
      ],
    },
    {
      id: 'i-VII-VI-VII-i',
      label: 'i – VII – VI – VII',
      description: 'Metal / hard rock power loop (Metallica, Sabbath feel)',
      chords: [
        { degree: 0,  type: 'min', numeral: 'i' },
        { degree: 10, type: 'maj', numeral: 'VII' },
        { degree: 8,  type: 'maj', numeral: 'VI' },
        { degree: 10, type: 'maj', numeral: 'VII' },
      ],
    },
    {
      id: 'i-iv-VII-III',
      label: 'i – iv – VII – III',
      description: 'Cinematic descending minor (Requiem for a Dream feel)',
      chords: [
        { degree: 0,  type: 'min', numeral: 'i' },
        { degree: 5,  type: 'min', numeral: 'iv' },
        { degree: 10, type: 'maj', numeral: 'VII' },
        { degree: 3,  type: 'maj', numeral: 'III' },
      ],
    },
    {
      id: 'i-VI-III-VII-repeat',
      label: 'i – VI – iv – V',
      description: 'Dramatic minor ballad (Nothing Else Matters feel)',
      chords: [
        { degree: 0, type: 'min', numeral: 'i' },
        { degree: 8, type: 'maj', numeral: 'VI' },
        { degree: 5, type: 'min', numeral: 'iv' },
        { degree: 7, type: 'maj', numeral: 'V' },
      ],
    },
  ],
}

const SOLO_ADVICE = {
  maj:  { scale: 'Major pentatonic', why: 'Open and resolved — all 5 notes sound great over a major chord.' },
  min:  { scale: 'Minor pentatonic', why: 'Dark and expressive — every note fits naturally over a minor chord.' },
  dom7: { scale: 'Minor pentatonic', why: 'The bluesy feel of the minor pentatonic adds perfect tension over a dominant 7th.' },
  maj7: { scale: 'Major pentatonic', why: 'Smooth and bright — the major pentatonic floats beautifully over a maj7 chord.' },
  min7: { scale: 'Minor pentatonic', why: 'The minor pentatonic is built for minor 7ths — soulful and natural.' },
  dim:  { scale: 'Minor pentatonic', why: 'Stick to root and 5th — pentatonic avoids the worst clashes over a diminished chord.' },
  aug:  { scale: 'Major pentatonic', why: 'Keep to the bright notes — avoid the 5th, which clashes with the augmented chord.' },
  sus4: { scale: 'Major pentatonic', why: 'The open sound of pentatonic matches the unresolved feel of a sus4 chord.' },
}

const selectedRoot  = ref('A')
const mode          = ref('major')
const progressionId = ref('I-V-vi-IV')
const showInfoIdx   = ref(null)

const chordOctave   = ref(4)
const bpm           = ref(80)
const beatsPerChord = ref(4)
const loopActiveIdx = ref(null)
const loopPlaying   = ref(false)
let _loopTimer      = null
let _currentMidis   = []

const progressions = computed(() => PROGRESSIONS[mode.value])

const selectedProgression = computed(
  () => progressions.value.find(p => p.id === progressionId.value) ?? progressions.value[0]
)

watch(mode, () => {
  progressionId.value = progressions.value[0].id
})

const rootIndex = computed(() => NOTES.indexOf(selectedRoot.value))

const chordCards = computed(() =>
  selectedProgression.value.chords.map((chord, idx) => {
    const chordRootIdx = (rootIndex.value + chord.degree) % 12
    const padIndices   = new Set(CHORD_TYPES[chord.type].map(i => (chordRootIdx + i) % 12))
    const sorted       = [...padIndices].sort((a, b) => a - b)
    return {
      idx,
      numeral:      chord.numeral,
      name:         NOTES[chordRootIdx] + CHORD_SUFFIX[chord.type],
      type:         chord.type,
      chordRootIdx,
      rows:         buildRows(padIndices, chordRootIdx),
      pressLabels:  sorted.map(i => LABELS[i]),
      noteNames:    sorted.map(i => NOTES[i]),
    }
  })
)

function cardMidis(card) {
  const aMidi = 12 * (chordOctave.value + 1) + 9
  const root  = aMidi + card.chordRootIdx
  return CHORD_TYPES[card.type].map(i => root + i)
}

function previewChord(card) {
  chordOff(_currentMidis)
  _currentMidis = cardMidis(card)
  chordOn(_currentMidis)
}
function stopPreview(card) {
  chordOff(cardMidis(card))
}

function playLoop() {
  if (_loopTimer) { stopLoop(); return }
  let idx = 0
  const advance = () => {
    chordOff(_currentMidis)
    loopActiveIdx.value = idx
    _currentMidis = cardMidis(chordCards.value[idx])
    chordOn(_currentMidis)
    idx = (idx + 1) % chordCards.value.length
  }
  advance()
  const ms = (60000 / bpm.value) * beatsPerChord.value
  _loopTimer = setInterval(advance, ms)
  loopPlaying.value = true
}
function stopLoop() {
  clearInterval(_loopTimer)
  _loopTimer = null
  loopPlaying.value = false
  chordOff(_currentMidis)
  _currentMidis = []
  loopActiveIdx.value = null
}

watch([progressionId, selectedRoot, mode], stopLoop)
</script>

<template>
  <div class="chord-prog">
    <div class="chord-prog-header">
      <h2>Chord Progressions</h2>
      <p class="subtitle">multi-pad chords for claves mode</p>
    </div>

    <div class="controls">
      <div class="control-group">
        <label>Key</label>
        <div class="note-picker">
          <button
            v-for="note in NOTES"
            :key="note"
            :class="{ active: selectedRoot === note, sharp: SHARPS.has(note) }"
            @click="selectedRoot = note"
          >{{ note }}</button>
        </div>
      </div>

      <div class="control-group">
        <label>Mode</label>
        <div class="mode-toggle">
          <button :class="{ active: mode === 'major' }" @click="mode = 'major'">Major</button>
          <button :class="{ active: mode === 'minor' }" @click="mode = 'minor'">Minor</button>
        </div>
      </div>

      <div class="control-group">
        <label>Progression</label>
        <select v-model="progressionId">
          <option v-for="p in progressions" :key="p.id" :value="p.id">{{ p.label }}</option>
        </select>
      </div>
    </div>

    <p class="prog-description">{{ selectedProgression.description }}</p>

    <div class="midi-playback">
      <div class="midi-param">
        <label>Octave</label>
        <button @click="chordOctave = Math.max(2, chordOctave - 1)">−</button>
        <span class="param-value">{{ chordOctave }}</span>
        <button @click="chordOctave = Math.min(6, chordOctave + 1)">+</button>
      </div>
      <div class="midi-param">
        <label>BPM</label>
        <input type="number" v-model.number="bpm" min="40" max="200" class="bpm-input" />
      </div>
      <div class="midi-param">
        <label>Beats</label>
        <div class="beats-toggle">
          <button
            v-for="b in [1, 2, 4, 8]"
            :key="b"
            :class="{ active: beatsPerChord === b }"
            @click="beatsPerChord = b"
          >{{ b }}</button>
        </div>
      </div>
      <button class="play-btn" :class="{ playing: loopPlaying }" @click="playLoop">
        {{ _loopTimer !== null ? 'Stop' : 'Play' }}
      </button>
    </div>

    <div class="chord-row" :class="{ 'piano-mode': displayMode === 'piano' }">
      <div
        v-for="card in chordCards"
        :key="card.idx"
        class="chord-card"
        :class="{ 'piano-mode': displayMode === 'piano', active: loopActiveIdx === card.idx }"
        @pointerdown="previewChord(card)"
        @pointerup="stopPreview(card)"
        @pointerleave="stopPreview(card)"
        @pointercancel="stopPreview(card)"
      >
        <div class="chord-info">
          <div class="chord-numeral">{{ card.numeral }}</div>
          <div class="chord-name">{{ card.name }}</div>
        </div>
        <div class="chord-body-wrap">
          <ChordCardBody
            :rows="card.rows"
            :pressLabels="card.pressLabels"
            :noteNames="card.noteNames"
            :chordRootIdx="card.chordRootIdx"
            :chordType="card.type"
          />
        </div>
        <button
          class="info-btn card-info-btn"
          :class="{ active: showInfoIdx === card.idx }"
          @click.stop="showInfoIdx = showInfoIdx === card.idx ? null : card.idx"
          aria-label="Solo tip"
        >i</button>
        <div v-if="showInfoIdx === card.idx" class="solo-info">
          <span class="solo-scale">{{ SOLO_ADVICE[card.type].scale }}</span>
          — {{ SOLO_ADVICE[card.type].why }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.chord-prog {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 2rem;
}

.chord-prog-header h2 {
  font-size: 1.4rem;
  color: var(--accent);
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.subtitle {
  margin-top: 0.3rem;
  font-size: 0.85rem;
  color: var(--text3);
}

.controls {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  margin: 1.5rem 0 1rem;
}

.control-group {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.control-group label {
  font-weight: 600;
  color: var(--accent);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-size: 0.8rem;
  min-width: 5rem;
}

.note-picker {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.note-picker button {
  padding: 0.3rem 0.6rem;
  border-radius: 5px;
  border: 1px solid var(--border2);
  background: var(--input);
  color: var(--text2);
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  min-width: 2.4rem;
  text-align: center;
  transition: background 0.12s, border-color 0.12s, color 0.12s;
}

.note-picker button.sharp { background: var(--sharp); color: var(--text3); }
.note-picker button:hover  { border-color: var(--accent); color: var(--text); }
.note-picker button.active { background: var(--accent); border-color: var(--accent); color: var(--on-accent); }

.mode-toggle { display: flex; gap: 0.35rem; }

.mode-toggle button {
  padding: 0.3rem 0.9rem;
  border-radius: 5px;
  border: 1px solid var(--border2);
  background: var(--input);
  color: var(--text2);
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.12s, border-color 0.12s, color 0.12s;
}

.mode-toggle button:hover  { border-color: var(--accent); color: var(--text); }
.mode-toggle button.active { background: var(--accent); border-color: var(--accent); color: var(--on-accent); }

select {
  background: var(--input);
  border: 1px solid var(--border2);
  border-radius: 6px;
  color: var(--text);
  padding: 0.4rem 0.8rem;
  font-size: 0.9rem;
  cursor: pointer;
  outline: none;
  max-width: 100%;
}

select:focus { border-color: var(--accent); }

.midi-playback {
  display: flex;
  align-items: center;
  gap: 1.2rem;
  flex-wrap: wrap;
  margin-bottom: 1.25rem;
  padding: 0.75rem 1rem;
  background: var(--raised);
  border: 1px solid var(--border2);
  border-radius: 8px;
}

.midi-param {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
}

.midi-param label {
  font-weight: 600;
  color: var(--accent);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-size: 0.75rem;
}

.midi-param button {
  width: 1.8rem;
  height: 1.8rem;
  border: 1px solid var(--border2);
  border-radius: 5px;
  background: var(--bg);
  color: var(--accent);
  font-size: 1rem;
  cursor: pointer;
  line-height: 1;
  transition: background 0.15s, border-color 0.15s;
}

.midi-param button:hover {
  background: var(--accent-bg);
  border-color: var(--accent);
}

.param-value {
  min-width: 1.4rem;
  text-align: center;
  font-weight: 700;
  color: var(--text);
}

.bpm-input {
  width: 4rem;
  background: var(--input);
  border: 1px solid var(--border2);
  border-radius: 5px;
  color: var(--text);
  padding: 0.2rem 0.4rem;
  font-size: 0.85rem;
  text-align: center;
  outline: none;
}

.bpm-input:focus { border-color: var(--accent); }

.beats-toggle {
  display: flex;
  gap: 0.25rem;
}

.beats-toggle button {
  width: 2rem;
  height: 1.8rem;
  border: 1px solid var(--border2);
  border-radius: 5px;
  background: var(--input);
  color: var(--text2);
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.12s, border-color 0.12s, color 0.12s;
}

.beats-toggle button:hover  { border-color: var(--accent); color: var(--text); }
.beats-toggle button.active { background: var(--accent); border-color: var(--accent); color: var(--on-accent); }

.play-btn {
  padding: 0.35rem 1.1rem;
  border: 1px solid var(--border2);
  border-radius: 6px;
  background: var(--input);
  color: var(--text2);
  font-size: 0.85rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  cursor: pointer;
  transition: background 0.12s, border-color 0.12s, color 0.12s;
}

.play-btn:hover  { border-color: var(--accent); color: var(--accent); }
.play-btn.playing { background: var(--accent); border-color: var(--accent); color: var(--on-accent); }

.prog-description {
  font-size: 0.82rem;
  color: var(--text3);
  margin-bottom: 1.5rem;
  font-style: italic;
}

.chord-row {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.chord-row.piano-mode {
  flex-direction: column;
  gap: 0.5rem;
}

.chord-card {
  flex: 1 1 120px;
  max-width: 160px;
  background: var(--input);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 0.75rem 0.6rem;
  cursor: default;
  transition: border-color 0.15s, box-shadow 0.15s, background 0.15s;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;
  position: relative;
}

.chord-card.piano-mode {
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
  max-width: 100%;
  flex: 1 1 100%;
  padding: 0.6rem 2.2rem 0.6rem 1rem;
  gap: 1rem;
}

.chord-card:hover { background: var(--hover); border-color: var(--accent-mid); }
.chord-card.active { border-color: var(--accent); box-shadow: 0 0 0 2px var(--accent-bg); }

.card-info-btn {
  position: absolute;
  top: 0.45rem;
  right: 0.45rem;
  width: 1.4rem;
  height: 1.4rem;
  border-radius: 50%;
  border: 1px solid var(--border2);
  background: var(--input);
  color: var(--text3);
  font-size: 0.72rem;
  font-style: italic;
  font-weight: 700;
  cursor: pointer;
  line-height: 1;
  flex-shrink: 0;
  transition: background 0.12s, border-color 0.12s, color 0.12s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-info-btn:hover  { border-color: var(--accent); color: var(--text); }
.card-info-btn.active { background: var(--accent-bg); border-color: var(--accent); color: var(--accent); }

.solo-info {
  font-size: 0.78rem;
  color: var(--text2);
  line-height: 1.5;
  padding: 0.5rem 0.65rem;
  background: var(--input);
  border: 1px solid var(--border2);
  border-left: 3px solid var(--accent);
  border-radius: 5px;
  flex-basis: 100%;
}

.solo-scale {
  font-weight: 700;
  color: var(--accent);
}

.chord-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
  gap: 0.15rem;
}

.chord-card.piano-mode .chord-info {
  width: 4.5rem;
}

.chord-body-wrap {
  flex: 1;
  min-width: 0;
}

.chord-numeral {
  font-size: 0.7rem;
  color: var(--accent-mid);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.chord-name {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--accent);
  line-height: 1;
}

@media (max-width: 600px) {
  .chord-prog { padding: 1.25rem 1rem; }

  .control-group {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .control-group label { min-width: unset; }

  .chord-card {
    flex: 1 1 calc(50% - 0.375rem);
    max-width: calc(50% - 0.375rem);
  }
}

@media (orientation: landscape) and (max-height: 500px) {
  .chord-prog { padding: 0.75rem 1rem; }

  .subtitle { display: none; }

  .controls { margin: 0.5rem 0; gap: 0.5rem; }

  .control-group {
    flex-direction: row;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: nowrap;
  }

  .control-group label { min-width: unset; white-space: nowrap; }

  .note-picker button { padding: 0.2rem 0.4rem; font-size: 0.75rem; min-width: 2rem; }

  .chord-row { margin-top: 0.5rem; }
}
</style>
