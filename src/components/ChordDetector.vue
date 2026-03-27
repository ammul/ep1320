<script setup>
import { ref, computed } from 'vue'
import { displayMode } from '../displayMode.js'
import { NOTES, LABELS, SHARPS, NOTE_TO_SEMI, SEMI_TO_NAME, CHORD_DETECT_TYPES, FRET_COUNT } from '../musicConstants.js'
import { playNote } from '../audioEngine.js'
import { buildGuitarNeck, sliceRows } from '../musicUtils.js'
import PianoOctave from './PianoOctave.vue'
import ModeLayout from './ModeLayout.vue'

function detectChord(noteIndices) {
  if (noteIndices.length < 2) return null
  const semis = [...new Set(noteIndices.map(i => NOTE_TO_SEMI[i]))].sort((a, b) => a - b)
  const results = []
  for (const rootSemi of semis) {
    const intervals = semis.map(s => (s - rootSemi + 12) % 12).sort((a, b) => a - b)
    for (const type of CHORD_DETECT_TYPES) {
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
const pianoOctave = ref(4)

function toggleNote(noteIndex) {
  const next = new Set(selected.value)
  if (next.has(noteIndex)) {
    next.delete(noteIndex)
  } else {
    next.add(noteIndex)
    playNote(60 + NOTE_TO_SEMI[noteIndex])
  }
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

const rows = computed(() => sliceRows(pads.value))

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
const guitarNeck = computed(() =>
  buildGuitarNeck(noteIdx => ({
    isSharp:    SHARPS.has(NOTES[noteIdx]),
    isSelected: selected.value.has(noteIdx),
  }))
)

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
      <p class="subtitle" v-else-if="displayMode === 'guitar'">Click frets on the neck — chord identified instantly</p>
      <p class="subtitle" v-else>Click piano keys to select — chord identified instantly</p>
    </div>

    <div class="detector-body">
      <div class="input-col">
        <ModeLayout>
          <template #ep1320>
            <div class="grid">
              <div class="row" v-for="(row, ri) in rows" :key="ri">
                <button
                  v-for="pad in row"
                  :key="pad.index"
                  class="pad"
                  :class="{ sharp: pad.isSharp, selected: pad.isSelected }"
                  @pointerdown="toggleNote(pad.index)"
                >
                  <span class="pad-label">{{ pad.label }}</span>
                  <span class="pad-note">{{ pad.note }}</span>
                </button>
              </div>
            </div>
          </template>

          <template #notes>
            <div class="note-strip">
              <button
                v-for="btn in noteButtons"
                :key="btn.index"
                class="note-btn"
                :class="{ sharp: btn.isSharp, selected: btn.isSelected }"
                @pointerdown="toggleNote(btn.index)"
              >
                {{ btn.note }}
              </button>
            </div>
          </template>

          <template #piano>
            <PianoOctave
              :activeIndices="selected"
              v-model:octave="pianoOctave"
              :clickable="true"
              @toggle="toggleNote"
            />
          </template>

          <template #guitar>
            <div class="guitar-neck-wrap">
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
                    @pointerdown="toggleNote(cell.noteIdx)"
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
          </template>
        </ModeLayout>

        <button class="clear-btn" @click="clearAll" :disabled="selected.size === 0">
          Clear
        </button>
      </div>

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

  </div>
</template>

<style scoped>
.chord-detector {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.detector-body {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.input-col {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: flex-start;
}

.header h2 {
  font-size: 1.4rem;
  color: var(--accent);
  letter-spacing: 0.05em;
  text-transform: uppercase;
}
.subtitle { margin-top: 0.3rem; font-size: 0.85rem; color: var(--text3); }

/* EP-1320 pad grid */
.grid { display: flex; flex-direction: column; gap: 0.6rem; max-width: 360px; margin: 0 auto; }
.row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.6rem; }

.pad {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  padding: 0.75rem 0.5rem;
  border-radius: 8px;
  border: 1px solid var(--border2);
  background: var(--raised);
  cursor: pointer;
  aspect-ratio: 1;
  transition: background 0.1s, border-color 0.1s, transform 0.08s;
  -webkit-tap-highlight-color: transparent;
}

.pad:hover { background: var(--border); }
.pad:active { transform: scale(0.95); }
.pad.sharp { background: var(--input); border-color: var(--border); }
.pad.sharp:hover { background: var(--border3); }
.pad.selected { background: var(--selected); border-color: var(--accent); box-shadow: 0 0 8px var(--accent-glow); }
.pad.selected.sharp { background: var(--sharp-sel); }

.pad-label { font-size: 0.65rem; color: var(--text4); font-weight: 600; letter-spacing: 0.1em; }
.pad.selected .pad-label { color: var(--accent-dim); }
.pad-note { font-size: 1.4rem; font-weight: 700; color: var(--accent); line-height: 1; }
.pad.sharp .pad-note { color: var(--accent-lo); }
.pad.selected .pad-note { color: var(--accent-hi); }

/* Notes mode strip */
.note-strip {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.note-btn {
  padding: 0.55rem 0.8rem;
  border-radius: 6px;
  border: 1px solid var(--border2);
  background: var(--raised);
  color: var(--accent);
  font-size: 1rem;
  font-weight: 700;
  font-family: inherit;
  cursor: pointer;
  min-width: 3rem;
  text-align: center;
  transition: background 0.1s, border-color 0.1s, transform 0.08s;
  -webkit-tap-highlight-color: transparent;
}

.note-btn:hover { background: var(--border); }
.note-btn:active { transform: scale(0.95); }
.note-btn.sharp { background: var(--input); border-color: var(--border); color: var(--accent-lo); font-size: 0.9rem; }
.note-btn.sharp:hover { background: var(--border3); }
.note-btn.selected { background: var(--selected); border-color: var(--accent); color: var(--accent-hi); box-shadow: 0 0 6px var(--accent-glow); }
.note-btn.selected.sharp { background: var(--sharp-sel); }

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
  border-bottom: 1px solid var(--border3);
}

.string-name {
  width: 1.8rem;
  font-size: 0.7rem;
  color: var(--text4);
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
  border-right: 1px solid var(--border3);
  border: none;
  background: var(--input);
  cursor: pointer;
  position: relative;
  transition: background 0.1s;
  border-right: 1px solid var(--border3);
  -webkit-tap-highlight-color: transparent;
}

.neck-cell:hover { background: var(--border3); }
.neck-cell.sharp { background: var(--sharp); }
.neck-cell.sharp:hover { background: var(--border3); }
.neck-cell.open { border-right: 3px solid var(--border2); background: var(--surface); }
.neck-cell.open:hover { background: var(--raised); }
.neck-cell.selected { background: var(--selected); }
.neck-cell.selected.sharp { background: var(--sharp-sel); }

.neck-dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--accent);
  display: block;
  box-shadow: 0 0 4px var(--accent-glow);
}

.neck-note {
  font-size: 0.6rem;
  color: var(--border);
  font-weight: 600;
  pointer-events: none;
}

.neck-cell.open .neck-note { color: var(--text5); }

.fret-numbers {
  display: flex;
  align-items: center;
  margin-top: 0.25rem;
}

.string-name-spacer { width: 1.8rem; flex-shrink: 0; }

.fret-num {
  flex: 1;
  font-size: 0.6rem;
  color: var(--text5);
  text-align: center;
}

/* Clear button */
.clear-btn {
  align-self: flex-start;
  padding: 0.35rem 1rem;
  border-radius: 6px;
  border: 1px solid var(--border2);
  background: transparent;
  color: var(--text3);
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  cursor: pointer;
  transition: color 0.15s, border-color 0.15s;
}

.clear-btn:hover:not(:disabled) { color: var(--text); border-color: var(--accent-mid); }
.clear-btn:disabled { opacity: 0.3; cursor: default; }

/* Result */
.result {
  border-top: 1px solid var(--border);
  padding-top: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.4rem;
  min-height: 100px;
}

@media (min-width: 600px) {
  .detector-body {
    flex-direction: row;
    align-items: flex-start;
    gap: 2rem;
  }

  .input-col {
    flex-shrink: 0;
  }

  .result {
    flex: 1;
    border-top: none;
    border-left: 1px solid var(--border);
    padding-top: 0;
    padding-left: 2rem;
    min-height: 0;
  }
}

.result.empty { opacity: 0.4; }
.hint { font-size: 0.9rem; color: var(--text4); margin-top: 0.5rem; }

.chord-name {
  font-size: clamp(2.5rem, 12vw, 4rem);
  font-weight: 700;
  color: var(--accent);
  line-height: 1;
  letter-spacing: 0.03em;
}

.chord-name.unknown { color: var(--text4); }
.chord-quality { font-size: 0.95rem; color: var(--accent-lo); letter-spacing: 0.04em; }
.inversion-label { color: var(--accent-mid); font-size: 0.85rem; }
.chord-notes { font-size: 0.8rem; color: var(--text4); letter-spacing: 0.08em; margin-top: 0.2rem; }

@media (max-width: 600px) {
  .chord-detector { padding: 1.25rem 1rem; }
  .pad-note { font-size: 1.2rem; }
}

@media (orientation: landscape) and (max-height: 500px) {
  .chord-detector {
    padding: 0.75rem 1rem;
    gap: 0.75rem;
  }

  .header h2 {
    font-size: 1.1rem;
  }

  .subtitle {
    display: none;
  }

  .result {
    padding-top: 0.75rem;
    min-height: 60px;
  }

  .chord-name {
    font-size: clamp(1.8rem, 8vw, 2.5rem);
  }
}
</style>
