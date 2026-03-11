<script setup>
import { ref, computed } from 'vue'
import { displayMode } from '../displayMode.js'

const NOTES  = ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#']
const LABELS = ['.',  '0',  'i', '1', '2',  '3', '4',  '5', '6', '7',  '8', '9']
const SHARPS = new Set(['A#', 'C#', 'D#', 'F#', 'G#'])

// Guitar neck open string note indices: E2, A2, D3, G3, B3, E4
const OPEN_STRINGS = [7, 0, 5, 10, 2, 7]
const STRING_NAMES = ['E', 'A', 'D', 'G', 'B', 'e']
const FRET_COUNT = 12

const NOTE_TO_SEMI = [9, 10, 11, 0, 1, 2, 3, 4, 5, 6, 7, 8]
const SEMI_TO_NAME = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

const CHORD_TYPES = [
  { intervals: [0, 7],           suffix: '5',      name: 'Power chord' },
  { intervals: [0, 4, 7],        suffix: '',        name: 'Major' },
  { intervals: [0, 3, 7],        suffix: 'm',       name: 'Minor' },
  { intervals: [0, 3, 6],        suffix: '°',       name: 'Diminished' },
  { intervals: [0, 4, 8],        suffix: '+',       name: 'Augmented' },
  { intervals: [0, 2, 7],        suffix: 'sus2',    name: 'Sus2' },
  { intervals: [0, 5, 7],        suffix: 'sus4',    name: 'Sus4' },
  { intervals: [0, 4, 7, 9],     suffix: '6',       name: 'Major 6th' },
  { intervals: [0, 3, 7, 9],     suffix: 'm6',      name: 'Minor 6th' },
  { intervals: [0, 4, 7, 10],    suffix: '7',       name: 'Dominant 7th' },
  { intervals: [0, 4, 7, 11],    suffix: 'maj7',    name: 'Major 7th' },
  { intervals: [0, 3, 7, 10],    suffix: 'm7',      name: 'Minor 7th' },
  { intervals: [0, 3, 6, 10],    suffix: 'm7♭5',   name: 'Half-diminished 7th' },
  { intervals: [0, 3, 6, 9],     suffix: '°7',      name: 'Diminished 7th' },
  { intervals: [0, 4, 7, 10, 2], suffix: '9',       name: 'Dominant 9th' },
  { intervals: [0, 4, 7, 11, 2], suffix: 'maj9',    name: 'Major 9th' },
  { intervals: [0, 3, 7, 10, 2], suffix: 'm9',      name: 'Minor 9th' },
]

function detectChord(noteIndices) {
  if (noteIndices.length < 2) return null
  const semis = [...new Set(noteIndices.map(i => NOTE_TO_SEMI[i]))].sort((a, b) => a - b)
  const results = []
  for (const rootSemi of semis) {
    const intervals = semis.map(s => (s - rootSemi + 12) % 12).sort((a, b) => a - b)
    for (const type of CHORD_TYPES) {
      if (
        type.intervals.length === intervals.length &&
        type.intervals.every((v, i) => v === intervals[i])
      ) {
        const rootName = SEMI_TO_NAME[rootSemi]
        const lowestSemi = semis[0]
        const isInversion = lowestSemi !== rootSemi
        const bassName = SEMI_TO_NAME[lowestSemi]
        results.push({
          root: rootName,
          suffix: type.suffix,
          name: type.name,
          inversion: isInversion ? `/${bassName}` : '',
          display: `${rootName}${type.suffix}${isInversion ? `/${bassName}` : ''}`,
        })
      }
    }
  }
  if (results.length === 0) return null
  const rootPos = results.find(r => !r.inversion)
  return rootPos ?? results[0]
}

const selected = ref(new Set())

function toggleNote(noteIndex) {
  const next = new Set(selected.value)
  next.has(noteIndex) ? next.delete(noteIndex) : next.add(noteIndex)
  selected.value = next
}

function clearAll() {
  selected.value = new Set()
}

// EP-1320 pad grid
const pads = computed(() =>
  NOTES.map((note, i) => ({
    index: i,
    label: LABELS[i],
    note,
    isSharp: SHARPS.has(note),
    isSelected: selected.value.has(i),
  }))
)

const rows = computed(() => [
  pads.value.slice(9, 12),
  pads.value.slice(6, 9),
  pads.value.slice(3, 6),
  pads.value.slice(0, 3),
])

// Notes mode: 12 chromatic note buttons
const noteButtons = computed(() =>
  NOTES.map((note, i) => ({
    index: i,
    note,
    isSharp: SHARPS.has(note),
    isSelected: selected.value.has(i),
  }))
)

// Guitar mode: fretboard (high e at top)
const guitarNeck = computed(() => {
  const neck = []
  for (let s = 5; s >= 0; s--) {
    const cells = []
    for (let f = 0; f <= FRET_COUNT; f++) {
      const noteIdx = (OPEN_STRINGS[s] + f) % 12
      cells.push({
        noteIdx,
        note: NOTES[noteIdx],
        isSharp: SHARPS.has(NOTES[noteIdx]),
        isSelected: selected.value.has(noteIdx),
        fret: f,
        isOpen: f === 0,
      })
    }
    neck.push({ stringIdx: s, name: STRING_NAMES[s], cells })
  }
  return neck
})

const selectedNames = computed(() =>
  [...selected.value].sort((a, b) => a - b).map(i => NOTES[i])
)

const chord = computed(() => detectChord([...selected.value]))
</script>

<template>
  <div class="chord-detector">

    <div class="header">
      <h2>Chord Detector</h2>
      <p class="subtitle" v-if="displayMode === 'ep1320'">Tap the notes you're playing — the chord is identified instantly</p>
      <p class="subtitle" v-else-if="displayMode === 'notes'">Click note names to select — chord identified instantly</p>
      <p class="subtitle" v-else>Click frets on the neck — chord identified instantly</p>
    </div>

    <!-- EP-1320 mode: pad grid -->
    <div v-if="displayMode === 'ep1320'" class="grid">
      <div class="row" v-for="(row, ri) in rows" :key="ri">
        <button
          v-for="pad in row"
          :key="pad.index"
          class="pad"
          :class="{ sharp: pad.isSharp, selected: pad.isSelected }"
          @click="toggleNote(pad.index)"
        >
          <span class="pad-label">{{ pad.label }}</span>
          <span class="pad-note">{{ pad.note }}</span>
        </button>
      </div>
    </div>

    <!-- Notes mode: chromatic note buttons -->
    <div v-else-if="displayMode === 'notes'" class="note-strip">
      <button
        v-for="btn in noteButtons"
        :key="btn.index"
        class="note-btn"
        :class="{ sharp: btn.isSharp, selected: btn.isSelected }"
        @click="toggleNote(btn.index)"
      >
        {{ btn.note }}
      </button>
    </div>

    <!-- Guitar mode: fretboard -->
    <div v-else class="guitar-neck-wrap">
      <div class="guitar-neck">
        <div v-for="(string, si) in guitarNeck" :key="si" class="neck-row">
          <div class="string-name">{{ string.name }}</div>
          <button
            v-for="cell in string.cells"
            :key="cell.fret"
            class="neck-cell"
            :class="{
              selected: cell.isSelected,
              sharp: cell.isSharp,
              open: cell.isOpen,
            }"
            @click="toggleNote(cell.noteIdx)"
          >
            <span v-if="cell.isSelected" class="neck-dot"></span>
            <span v-else class="neck-note">{{ cell.note }}</span>
          </button>
        </div>
        <div class="fret-numbers">
          <div class="string-name-spacer"></div>
          <div v-for="f in FRET_COUNT + 1" :key="f" class="fret-num">
            {{ f - 1 === 0 ? '' : f - 1 }}
          </div>
        </div>
      </div>
    </div>

    <button class="clear-btn" @click="clearAll" :disabled="selected.size === 0">
      Clear
    </button>

    <div class="result" :class="{ empty: selected.size === 0 }">
      <template v-if="selected.size === 0">
        <p class="hint">Select two or more notes</p>
      </template>
      <template v-else-if="chord">
        <div class="chord-name">{{ chord.display }}</div>
        <div class="chord-quality">{{ chord.name }}<span v-if="chord.inversion" class="inversion-label"> · inversion</span></div>
        <div class="chord-notes">{{ selectedNames.join('  ·  ') }}</div>
      </template>
      <template v-else>
        <div class="chord-name unknown">?</div>
        <div class="chord-quality">No matching chord</div>
        <div class="chord-notes">{{ selectedNames.join('  ·  ') }}</div>
      </template>
    </div>

  </div>
</template>

<style scoped>
.chord-detector {
  background: #242019;
  border: 1px solid #3a3228;
  border-radius: 12px;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.header h2 {
  font-size: 1.4rem;
  color: #c8a96e;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}
.subtitle { margin-top: 0.3rem; font-size: 0.85rem; color: #7a6f60; }

/* EP-1320 pad grid */
.grid { display: flex; flex-direction: column; gap: 0.6rem; max-width: 360px; }
.row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.6rem; }

.pad {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  padding: 0.75rem 0.5rem;
  border-radius: 8px;
  border: 1px solid #4a4030;
  background: #2e2820;
  cursor: pointer;
  aspect-ratio: 1;
  transition: background 0.1s, border-color 0.1s, transform 0.08s;
  -webkit-tap-highlight-color: transparent;
}

.pad:hover { background: #3a3228; }
.pad:active { transform: scale(0.95); }
.pad.sharp { background: #1e1c18; border-color: #3a3228; }
.pad.sharp:hover { background: #2a2820; }
.pad.selected { background: #3d3010; border-color: #c8a96e; box-shadow: 0 0 8px rgba(200,169,110,0.25); }
.pad.selected.sharp { background: #302808; }

.pad-label { font-size: 0.65rem; color: #5a5040; font-weight: 600; letter-spacing: 0.1em; }
.pad.selected .pad-label { color: #a08848; }
.pad-note { font-size: 1.4rem; font-weight: 700; color: #c8a96e; line-height: 1; }
.pad.sharp .pad-note { color: #a08858; }
.pad.selected .pad-note { color: #e8c87e; }

/* Notes mode strip */
.note-strip {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.note-btn {
  padding: 0.55rem 0.8rem;
  border-radius: 6px;
  border: 1px solid #4a4030;
  background: #2e2820;
  color: #c8a96e;
  font-size: 1rem;
  font-weight: 700;
  font-family: inherit;
  cursor: pointer;
  min-width: 3rem;
  text-align: center;
  transition: background 0.1s, border-color 0.1s, transform 0.08s;
  -webkit-tap-highlight-color: transparent;
}

.note-btn:hover { background: #3a3228; }
.note-btn:active { transform: scale(0.95); }
.note-btn.sharp { background: #1e1c18; border-color: #3a3228; color: #a08858; font-size: 0.9rem; }
.note-btn.sharp:hover { background: #2a2820; }
.note-btn.selected { background: #3d3010; border-color: #c8a96e; color: #e8c87e; box-shadow: 0 0 6px rgba(200,169,110,0.25); }
.note-btn.selected.sharp { background: #302808; }

/* Guitar neck */
.guitar-neck-wrap {
  overflow-x: auto;
}

.guitar-neck {
  display: flex;
  flex-direction: column;
  min-width: 600px;
}

.neck-row {
  display: flex;
  align-items: stretch;
  border-bottom: 1px solid #2a2420;
}

.string-name {
  width: 1.8rem;
  font-size: 0.7rem;
  color: #5a5040;
  font-weight: 600;
  text-align: right;
  padding-right: 0.5rem;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.neck-cell {
  flex: 1;
  height: 2.4rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-right: 1px solid #2a2420;
  border: none;
  background: #1e1c18;
  cursor: pointer;
  position: relative;
  transition: background 0.1s;
  border-right: 1px solid #2a2420;
  -webkit-tap-highlight-color: transparent;
}

.neck-cell:hover { background: #2a2420; }
.neck-cell.sharp { background: #181614; }
.neck-cell.sharp:hover { background: #221e1a; }
.neck-cell.open { border-right: 3px solid #4a4030; background: #242019; }
.neck-cell.open:hover { background: #2e2820; }
.neck-cell.selected { background: #3d3010; }
.neck-cell.selected.sharp { background: #302808; }

.neck-dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #c8a96e;
  display: block;
  box-shadow: 0 0 4px rgba(200,169,110,0.4);
}

.neck-note {
  font-size: 0.6rem;
  color: #3a3228;
  font-weight: 600;
  pointer-events: none;
}

.neck-cell.open .neck-note { color: #4a4030; }

.fret-numbers {
  display: flex;
  align-items: center;
  margin-top: 0.25rem;
}

.string-name-spacer { width: 1.8rem; flex-shrink: 0; }

.fret-num {
  flex: 1;
  font-size: 0.6rem;
  color: #4a4030;
  text-align: center;
}

/* Clear button */
.clear-btn {
  align-self: flex-start;
  padding: 0.35rem 1rem;
  border-radius: 6px;
  border: 1px solid #4a4030;
  background: transparent;
  color: #7a6f60;
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  cursor: pointer;
  transition: color 0.15s, border-color 0.15s;
}

.clear-btn:hover:not(:disabled) { color: #e8dcc8; border-color: #6a6050; }
.clear-btn:disabled { opacity: 0.3; cursor: default; }

/* Result */
.result {
  border-top: 1px solid #3a3228;
  padding-top: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.4rem;
  min-height: 100px;
}

.result.empty { opacity: 0.4; }
.hint { font-size: 0.9rem; color: #5a5040; margin-top: 0.5rem; }

.chord-name {
  font-size: clamp(2.5rem, 12vw, 4rem);
  font-weight: 700;
  color: #c8a96e;
  line-height: 1;
  letter-spacing: 0.03em;
}

.chord-name.unknown { color: #5a5040; }
.chord-quality { font-size: 0.95rem; color: #a09070; letter-spacing: 0.04em; }
.inversion-label { color: #6a6050; font-size: 0.85rem; }
.chord-notes { font-size: 0.8rem; color: #5a5040; letter-spacing: 0.08em; margin-top: 0.2rem; }

@media (max-width: 600px) {
  .chord-detector { padding: 1.25rem 1rem; }
  .pad-note { font-size: 1.2rem; }
}
</style>
