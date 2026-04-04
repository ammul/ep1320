<script setup>
import { ref, computed, watch } from 'vue'
import { displayMode } from '@/state/displayMode.js'
import { NOTES, CHORD_TYPES, CHORD_SUFFIX } from '@/constants/musicConstants.js'
import { buildRows } from '@/utils/musicUtils.js'
import { padSize } from '@/state/padSize.js'
import ChordCardBody from '@/components/music/ChordCardBody.vue'
import RootNotePicker from '@/components/music/RootNotePicker.vue'
import { midiStatus, midiChannel, chordOn, chordOff } from '@/audio/midiManager.js'
import { startNote, stopNote, stopAllNotes, playNote } from '@/audio/audioEngine.js'
import PageHeader from '@/components/ui/PageHeader.vue'
import { GENRES, ALL_PROGRESSIONS } from '@/constants/progressions.js'
import GenreTabs from '@/components/progressions/GenreTabs.vue'
import ProgressionSection from '@/components/progressions/ProgressionSection.vue'

const SOLO_ADVICE = {
  maj:  { scale: 'Major pentatonic', why: 'Open and resolved - all 5 notes sound great over a major chord.' },
  min:  { scale: 'Minor pentatonic', why: 'Dark and expressive - every note fits naturally over a minor chord.' },
  dom7: { scale: 'Minor pentatonic', why: 'The bluesy feel of the minor pentatonic adds perfect tension over a dominant 7th.' },
  maj7: { scale: 'Major pentatonic', why: 'Smooth and bright - the major pentatonic floats beautifully over a maj7 chord.' },
  min7: { scale: 'Minor pentatonic', why: 'The minor pentatonic is built for minor 7ths - soulful and natural.' },
  dim:  { scale: 'Minor pentatonic', why: 'Stick to root and 5th - pentatonic avoids the worst clashes over a diminished chord.' },
  aug:  { scale: 'Major pentatonic', why: 'Keep to the bright notes - avoid the 5th, which clashes with the augmented chord.' },
  sus4: { scale: 'Major pentatonic', why: 'The open sound of pentatonic matches the unresolved feel of a sus4 chord.' },
}

const selectedRoot   = ref('A')
const selectedGenre  = ref('all')
const expandedId     = ref('pop-1')
const showInfoIdx    = ref(null)

const chordOctave   = ref(4)
const bpm           = ref(80)
const beatsPerChord = ref(4)
const loopActiveIdx = ref(null)
const loopPlaying   = ref(false)
const loopProgressionId = ref(null)
let _loopTimer      = null
let _currentMidis   = []

const filteredProgressions = computed(() =>
  selectedGenre.value === 'all'
    ? ALL_PROGRESSIONS
    : ALL_PROGRESSIONS.filter(p => p.genre === selectedGenre.value)
)

const majorProgressions = computed(() =>
  filteredProgressions.value.filter(p => p.key === 'major')
)

const minorProgressions = computed(() =>
  filteredProgressions.value.filter(p => p.key === 'minor')
)

const selectedProgression = computed(() =>
  ALL_PROGRESSIONS.find(p => p.id === expandedId.value) ?? ALL_PROGRESSIONS[0]
)

watch(selectedGenre, () => {
  const still = filteredProgressions.value.find(p => p.id === expandedId.value)
  if (!still) expandedId.value = filteredProgressions.value[0]?.id ?? ALL_PROGRESSIONS[0].id
  stopLoop()
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
      rows:         buildRows(padIndices, chordRootIdx, padSize.value === '4x4' ? 4 : 3),
      pressLabels:  sorted.map(i => NOTES[i]),
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
  _currentMidis.forEach(m => stopNote(m))
  _currentMidis = cardMidis(card)
  chordOn(_currentMidis)
  _currentMidis.forEach(m => startNote(m))
}
function stopPreview(card) {
  chordOff(cardMidis(card))
  cardMidis(card).forEach(m => stopNote(m))
}

function playLoop(progressionId) {
  if (_loopTimer) { stopLoop(); if (loopProgressionId.value === progressionId) return }
  loopProgressionId.value = progressionId
  const progression = ALL_PROGRESSIONS.find(p => p.id === progressionId) ?? selectedProgression.value
  const cards = progression.chords.map((chord, idx) => {
    const chordRootIdx = (rootIndex.value + chord.degree) % 12
    return { idx, chordRootIdx, type: chord.type }
  })
  let idx = 0
  const advance = () => {
    chordOff(_currentMidis)
    _currentMidis.forEach(m => stopNote(m))
    loopActiveIdx.value = idx
    _currentMidis = CHORD_TYPES[cards[idx].type].map(i => {
      const aMidi = 12 * (chordOctave.value + 1) + 9
      return aMidi + cards[idx].chordRootIdx + i
    })
    chordOn(_currentMidis)
    const beatSec = Math.max(0.1, (60 / bpm.value) * beatsPerChord.value - 0.05)
    _currentMidis.forEach(m => playNote(m, beatSec))
    idx = (idx + 1) % cards.length
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
  loopProgressionId.value = null
  chordOff(_currentMidis)
  stopAllNotes()
  _currentMidis = []
  loopActiveIdx.value = null
}

function handleToggleExpand(id) {
  expandedId.value = expandedId.value === id ? null : id
  showInfoIdx.value = null
}

watch([expandedId, selectedRoot], stopLoop)
</script>

<template>
  <div class="chord-prog">
    <PageHeader title="Chord Progressions" subtitle="explore chord sequences by genre - transposed to any key" />

    <div class="controls">
      <div class="control-group">
        <label>Key</label>
        <RootNotePicker v-model="selectedRoot" />
      </div>
    </div>

    <GenreTabs v-model="selectedGenre" :genres="GENRES" />

    <ProgressionSection
      title="Major Key Progressions"
      :progressions="majorProgressions"
      :rootNote="selectedRoot"
      :expandedId="expandedId"
      :playingId="loopProgressionId"
      @toggle-expand="handleToggleExpand"
      @play="playLoop"
      @stop="stopLoop"
      @loop-start="playLoop"
      @loop-stop="stopLoop"
    />

    <ProgressionSection
      title="Minor Key Progressions"
      :progressions="minorProgressions"
      :rootNote="selectedRoot"
      :expandedId="expandedId"
      :playingId="loopProgressionId"
      @toggle-expand="handleToggleExpand"
      @play="playLoop"
      @stop="stopLoop"
      @loop-start="playLoop"
      @loop-stop="stopLoop"
    />

    <!-- Chord cards for selected progression -->
    <template v-if="expandedId">
      <p class="prog-examples">{{ selectedProgression.examples }}</p>

      <!-- MIDI toolbar -->
      <div v-if="midiStatus === 'connected'" class="midi-toolbar">
        <button class="play-btn" :class="{ playing: loopPlaying }" @click="loopPlaying ? stopLoop() : playLoop(expandedId)">
          {{ loopPlaying ? 'Stop' : 'Play' }}
        </button>
        <span class="midi-divider"></span>
        <span class="midi-lbl">Oct</span>
        <button class="mini-btn" @click="chordOctave = Math.max(2, chordOctave - 1)">−</button>
        <span class="midi-val">{{ chordOctave }}</span>
        <button class="mini-btn" @click="chordOctave = Math.min(6, chordOctave + 1)">+</button>
        <span class="midi-divider"></span>
        <input type="number" v-model.number="bpm" min="40" max="200" class="bpm-input" />
        <span class="midi-lbl">BPM</span>
        <span class="midi-divider"></span>
        <button
          v-for="b in [1, 2, 4, 8]"
          :key="b"
          class="mini-btn"
          :class="{ active: beatsPerChord === b }"
          @click="beatsPerChord = b"
        >{{ b }}</button>
        <span class="midi-divider"></span>
        <span class="midi-lbl">Lane</span>
        <button
          v-for="(lane, i) in ['A','B','C','D']"
          :key="lane"
          class="mini-btn"
          :class="{ active: midiChannel === i }"
          @click="midiChannel = i"
        >{{ lane }}</button>
      </div>

      <!-- Chord cards -->
      <div class="chord-row" :class="{ 'piano-mode': displayMode === 'piano' }">
        <div
          v-for="card in chordCards"
          :key="card.idx"
          class="chord-card"
          :class="{ 'piano-mode': displayMode === 'piano', active: loopActiveIdx === card.idx }"
          @pointerdown.prevent="previewChord(card)"
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
            - {{ SOLO_ADVICE[card.type].why }}
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.chord-prog {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 2rem;
}

.controls {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  margin: 1.5rem 0 1.25rem;
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

/* Description */
.prog-examples {
  font-size: 0.82rem;
  color: var(--text3);
  margin-bottom: 1rem;
  font-style: italic;
  padding: 0 0.1rem;
}

/* MIDI toolbar */
.midi-toolbar {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
  padding: 0.4rem 0.75rem;
  background: var(--raised);
  border: 1px solid var(--border2);
  border-radius: 6px;
  font-size: 0.82rem;
}

.midi-lbl {
  font-weight: 600;
  color: var(--accent);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-size: 0.72rem;
}

.midi-val {
  min-width: 1.2rem;
  text-align: center;
  font-weight: 700;
  color: var(--text);
}

.midi-divider {
  width: 1px;
  height: 1.2rem;
  background: var(--border2);
  margin: 0 0.2rem;
  flex-shrink: 0;
}

.mini-btn {
  height: 1.7rem;
  min-width: 1.7rem;
  padding: 0 0.35rem;
  border: 1px solid var(--border2);
  border-radius: 4px;
  background: var(--input);
  color: var(--text2);
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  line-height: 1;
  transition: background 0.12s, border-color 0.12s, color 0.12s;
}

.mini-btn:hover  { border-color: var(--accent); color: var(--text); }
.mini-btn.active { background: var(--accent); border-color: var(--accent); color: var(--on-accent); }

.bpm-input {
  width: 3.5rem;
  background: var(--input);
  border: 1px solid var(--border2);
  border-radius: 4px;
  color: var(--text);
  padding: 0.2rem 0.3rem;
  font-size: 0.82rem;
  text-align: center;
  outline: none;
}

.bpm-input:focus { border-color: var(--accent); }

.play-btn {
  padding: 0.3rem 0.9rem;
  border: 1px solid var(--border2);
  border-radius: 5px;
  background: var(--input);
  color: var(--text2);
  font-size: 0.82rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  cursor: pointer;
  transition: background 0.12s, border-color 0.12s, color 0.12s;
}

.play-btn:hover   { border-color: var(--accent); color: var(--accent); }
.play-btn.playing { background: var(--accent); border-color: var(--accent); color: var(--on-accent); }

/* Chord row */
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
  user-select: none;
  touch-action: none;
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

.chord-card:hover  { background: var(--hover); border-color: var(--accent-mid); }
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

.chord-card.piano-mode .chord-info { width: 4.5rem; }
.chord-body-wrap { flex: 1; min-width: 0; }

.chord-numeral {
  font-size: 0.7rem;
  color: var(--accent-mid);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.chord-name {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--rust);
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
  .controls   { margin: 0.5rem 0; }
  .control-group {
    flex-direction: row;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: nowrap;
  }
  .control-group label { min-width: unset; white-space: nowrap; }
}
</style>
