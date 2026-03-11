<script setup>
import { ref, computed, watch } from 'vue'
import { displayMode } from '../displayMode.js'
import GuitarChordDiagram from './GuitarChordDiagram.vue'

const NOTES  = ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#']
const LABELS = ['.',  '0',  'i', '1', '2',  '3', '4',  '5', '6', '7',  '8', '9']
const SHARPS = new Set(['A#', 'C#', 'D#', 'F#', 'G#'])

const CHORD_TYPES = {
  maj:  [0, 4, 7],
  min:  [0, 3, 7],
  dim:  [0, 3, 6],
  aug:  [0, 4, 8],
  dom7: [0, 4, 7, 10],
  maj7: [0, 4, 7, 11],
  min7: [0, 3, 7, 10],
  sus4: [0, 5, 7],
}

const CHORD_SUFFIX = {
  maj: '', min: 'm', dim: '°', aug: '+',
  dom7: '7', maj7: 'maj7', min7: 'm7', sus4: 'sus4',
}

const FLAT_MAP = { 'Ab': 'G#', 'Bb': 'A#', 'Cb': 'B', 'Db': 'C#', 'Eb': 'D#', 'Fb': 'E', 'Gb': 'F#' }

const input = ref('D f#m E D')
const activeChordIndex = ref(0)

function parseToken(token) {
  const s = token[0].toUpperCase() + token.slice(1)
  let noteStr, suffix
  if (s.length >= 2 && (s[1] === '#' || s[1] === 'b')) {
    noteStr = s.slice(0, 2)
    suffix = s.slice(2).toLowerCase()
  } else {
    noteStr = s[0]
    suffix = s.slice(1).toLowerCase()
  }
  const note = FLAT_MAP[noteStr] ?? noteStr
  const noteIndex = NOTES.indexOf(note)
  if (noteIndex === -1) return null

  let type
  if      (suffix === '' || suffix === 'maj')          type = 'maj'
  else if (suffix === 'm' || suffix === 'min')         type = 'min'
  else if (suffix === 'm7' || suffix === 'min7')       type = 'min7'
  else if (suffix === 'maj7')                          type = 'maj7'
  else if (suffix === '7')                             type = 'dom7'
  else if (suffix === 'dim' || suffix === '°')         type = 'dim'
  else if (suffix === 'aug' || suffix === '+')         type = 'aug'
  else if (suffix === 'sus4')                          type = 'sus4'
  else return null

  return { noteIndex, note, type }
}

const tokens = computed(() =>
  input.value.trim().split(/\s+/).filter(Boolean).map(tok => ({
    raw: tok,
    parsed: parseToken(tok),
  }))
)

const parseErrors = computed(() => tokens.value.filter(t => !t.parsed).map(t => t.raw))

function buildRows(activeSet, rootPad) {
  const pads = NOTES.map((note, i) => ({
    label: LABELS[i],
    note,
    isSharp: SHARPS.has(note),
    isActive: activeSet.has(i),
    isRoot: i === rootPad,
  }))
  return [
    pads.slice(9, 12),
    pads.slice(6, 9),
    pads.slice(3, 6),
    pads.slice(0, 3),
  ]
}

const chordCards = computed(() =>
  tokens.value
    .filter(t => t.parsed)
    .map((t, idx) => {
      const { noteIndex, note, type } = t.parsed
      const intervals = CHORD_TYPES[type]
      const activeSet = new Set(intervals.map(i => (noteIndex + i) % 12))
      const pressLabels = [...activeSet].sort((a, b) => a - b).map(i => LABELS[i])
      const noteNames   = [...activeSet].sort((a, b) => a - b).map(i => NOTES[i])
      return {
        idx,
        name: note + CHORD_SUFFIX[type],
        type,
        chordRootIdx: noteIndex,
        rows: buildRows(activeSet, noteIndex),
        pressLabels,
        noteNames,
      }
    })
)

watch(chordCards, () => {
  if (activeChordIndex.value >= chordCards.value.length) {
    activeChordIndex.value = Math.max(0, chordCards.value.length - 1)
  }
})

function handleKey(e) {
  if (!chordCards.value.length) return
  if (e.key === 'ArrowRight') {
    activeChordIndex.value = (activeChordIndex.value + 1) % chordCards.value.length
    e.preventDefault()
  } else if (e.key === 'ArrowLeft') {
    activeChordIndex.value = (activeChordIndex.value - 1 + chordCards.value.length) % chordCards.value.length
    e.preventDefault()
  }
}
</script>

<template>
  <div class="prog-builder" tabindex="0" @keydown="handleKey">
    <div class="prog-builder-header">
      <h2>Progression Builder</h2>
      <p class="subtitle">type chords separated by spaces · click or ← → to step through</p>
    </div>

    <div class="input-row">
      <input
        v-model="input"
        class="chord-input"
        placeholder="e.g. D f#m E D"
        spellcheck="false"
        autocomplete="off"
      />
    </div>

    <p class="hint">
      Supported: <span class="mono">C D# Gb Am Em7 Fmaj7 Bdim Caug Asus4</span>
    </p>

    <div v-if="parseErrors.length" class="parse-errors">
      Unrecognised:
      <span v-for="e in parseErrors" :key="e" class="error-token">{{ e }}</span>
    </div>

    <template v-if="chordCards.length">
      <div class="chord-row">
        <div
          v-for="card in chordCards"
          :key="card.idx"
          class="chord-card"
          :class="{ active: card.idx === activeChordIndex }"
          @click="activeChordIndex = card.idx"
        >
          <div class="chord-name">{{ card.name }}</div>

          <!-- EP-1320 mode: mini pad grid -->
          <template v-if="displayMode === 'ep1320'">
            <div class="mini-grid">
              <div class="mini-row" v-for="(row, ri) in card.rows" :key="ri">
                <div
                  v-for="pad in row"
                  :key="pad.label"
                  class="mini-pad"
                  :class="{
                    active: pad.isActive,
                    root: pad.isRoot,
                    sharp: pad.isSharp,
                    inactive: !pad.isActive,
                  }"
                >
                  <span class="mini-label">{{ pad.label }}</span>
                  <span class="mini-note" v-if="pad.isActive">{{ pad.note }}</span>
                </div>
              </div>
            </div>
            <div class="press-labels">
              <span class="press-hint">press</span>
              <span v-for="lbl in card.pressLabels" :key="lbl" class="press-badge">{{ lbl }}</span>
            </div>
          </template>

          <!-- Notes mode: note name badges -->
          <template v-else-if="displayMode === 'notes'">
            <div class="note-badges">
              <span
                v-for="n in card.noteNames"
                :key="n"
                class="note-badge"
                :class="{ root: n === NOTES[card.chordRootIdx], sharp: SHARPS.has(n) }"
              >{{ n }}</span>
            </div>
          </template>

          <!-- Guitar mode: chord diagram -->
          <template v-else>
            <GuitarChordDiagram
              :rootIndex="card.chordRootIdx"
              :type="card.type"
            />
          </template>
        </div>
      </div>

      <div class="step-dots">
        <span
          v-for="(card, i) in chordCards"
          :key="i"
          class="dot"
          :class="{ active: i === activeChordIndex }"
          @click="activeChordIndex = i"
        />
      </div>
    </template>

    <p v-else-if="input.trim()" class="empty-hint">No valid chords recognised yet.</p>
  </div>
</template>

<style scoped>
.prog-builder {
  background: #242019;
  border: 1px solid #3a3228;
  border-radius: 12px;
  padding: 2rem;
  outline: none;
}

.prog-builder-header h2 {
  font-size: 1.4rem;
  color: #c8a96e;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.subtitle {
  margin-top: 0.3rem;
  font-size: 0.85rem;
  color: #7a6f60;
}

.input-row { margin: 1.5rem 0 0.6rem; }

.chord-input {
  width: 100%;
  box-sizing: border-box;
  background: #1e1c18;
  border: 1px solid #4a4030;
  border-radius: 8px;
  color: #e8dcc8;
  font-size: 1.1rem;
  font-family: inherit;
  padding: 0.6rem 0.9rem;
  outline: none;
  letter-spacing: 0.06em;
  transition: border-color 0.15s;
}

.chord-input:focus { border-color: #c8a96e; }
.chord-input::placeholder { color: #4a4030; }

.hint { font-size: 0.78rem; color: #5a5040; margin-bottom: 0.5rem; }
.mono { font-family: monospace; color: #7a6f60; }

.parse-errors {
  font-size: 0.8rem;
  color: #a07050;
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  flex-wrap: wrap;
}

.error-token {
  background: #2e1c14;
  border: 1px solid #6a3820;
  border-radius: 4px;
  padding: 1px 6px;
  font-family: monospace;
  color: #c07050;
}

.empty-hint { font-size: 0.85rem; color: #5a5040; font-style: italic; margin-top: 1rem; }

.chord-row {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-top: 1.25rem;
}

.chord-card {
  flex: 1 1 120px;
  max-width: 160px;
  background: #1e1c18;
  border: 1px solid #3a3228;
  border-radius: 8px;
  padding: 0.75rem 0.6rem;
  cursor: pointer;
  transition: border-color 0.15s, box-shadow 0.15s, background 0.15s;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;
}

.chord-card:hover { background: #252219; border-color: #6a5a30; }

.chord-card.active {
  border-color: #c8a96e;
  background: #2a2318;
  box-shadow: 0 0 0 1px #c8a96e44;
}

.chord-name { font-size: 1.1rem; font-weight: 700; color: #c8a96e; line-height: 1; }
.chord-card.active .chord-name { color: #f0c87a; }

/* Mini grid */
.mini-grid { display: flex; flex-direction: column; gap: 3px; margin: 0.25rem 0; }
.mini-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 3px; }

.mini-pad {
  width: 36px;
  height: 36px;
  border-radius: 4px;
  border: 1px solid #2e2820;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1px;
  transition: background 0.12s;
}

.mini-pad.inactive { background: #1a1714; opacity: 0.3; }
.mini-pad.active   { background: #2e2820; border-color: #6a5a30; }
.mini-pad.root     { background: #3a2e10; border-color: #c8a96e; }

.mini-label { font-size: 0.6rem; font-weight: 700; color: #4a4030; line-height: 1; }
.mini-pad.active .mini-label { color: #8a7850; }
.mini-pad.root   .mini-label { color: #c8a96e; }
.mini-note { font-size: 0.62rem; font-weight: 700; line-height: 1; color: #c8a96e; }
.mini-pad.root .mini-note { color: #f0c87a; }

.press-labels { display: flex; align-items: center; gap: 3px; flex-wrap: wrap; justify-content: center; }
.press-hint { font-size: 0.65rem; color: #4a4030; margin-right: 2px; }
.press-badge { background: #2e2820; border: 1px solid #4a4030; border-radius: 3px; padding: 1px 5px; font-size: 0.7rem; font-weight: 700; color: #c8a96e; }

/* Notes mode badges */
.note-badges { display: flex; flex-wrap: wrap; gap: 4px; justify-content: center; margin: 0.25rem 0; }

.note-badge {
  padding: 0.2rem 0.45rem;
  border-radius: 4px;
  background: #2e2820;
  border: 1px solid #4a4030;
  font-size: 0.78rem;
  font-weight: 700;
  color: #c8a96e;
}

.note-badge.root { background: #3a2e10; border-color: #c8a96e; color: #f0c87a; }
.note-badge.sharp { background: #1e1c18; color: #a08858; border-color: #3a3228; }
.note-badge.root.sharp { background: #3a2e10; border-color: #c8a96e; color: #f0c87a; }

/* Step dots */
.step-dots { display: flex; justify-content: center; gap: 0.5rem; margin-top: 1.25rem; }

.dot { width: 8px; height: 8px; border-radius: 50%; background: #3a3228; cursor: pointer; transition: background 0.15s; }
.dot:hover  { background: #6a5a30; }
.dot.active { background: #c8a96e; }

@media (max-width: 600px) {
  .prog-builder { padding: 1.25rem 1rem; }
  .chord-card { flex: 1 1 calc(50% - 0.375rem); max-width: calc(50% - 0.375rem); }
  .mini-pad { width: 30px; height: 30px; }
}
</style>
