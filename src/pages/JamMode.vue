<script setup>
import { ref, computed } from 'vue'
import { displayMode } from '@/state/displayMode.js'
import { padSize } from '@/state/padSize.js'
import { NOTES, SHARPS, FRET_COUNT, NOTE_TO_SEMI } from '@/constants/musicConstants.js'
import { buildGuitarNeck, sliceRows } from '@/utils/musicUtils.js'
import { activeInputNotes, midiStatus } from '@/audio/midiManager.js'
import { octave } from '@/state/octave.js'
import { useNotePlayback } from '@/composables/useNotePlayback.js'
import PianoOctave from '@/components/PianoOctave.vue'
import ScaleLegend from '@/components/ScaleLegend.vue'
import RootNotePicker from '@/components/RootNotePicker.vue'
import ModeLayout from '@/components/ModeLayout.vue'

const SCALES = [
  {
    id: 'mi.p',
    label: 'mi.p - Minor Pentatonic',
    intervals: [0, 3, 5, 7, 10],
    description: 'The most forgiving scale for improv. 5 notes, zero clashes - every one works over almost any minor chord or progression. Start here if you\'re new to soloing.',
  },
  {
    id: 'ma.p',
    label: 'ma.p - Major Pentatonic',
    intervals: [0, 2, 4, 7, 9],
    description: '5 open, consonant notes that sound good over almost any major chord. Bright and uplifting - nothing feels out of place. Great for country, pop, and folk melodies.',
  },
  {
    id: 'min',
    label: 'min - Minor (Natural)',
    intervals: [0, 2, 3, 5, 7, 8, 10],
    description: 'Minor pentatonic with 2 extra notes, adding more colour and expression. Dark and emotional. A couple of notes need more care - avoid landing on the 2nd or 6th for too long.',
  },
  {
    id: 'maj',
    label: 'maj - Major (Ionian)',
    intervals: [0, 2, 4, 5, 7, 9, 11],
    description: 'Major pentatonic with 2 extra notes, giving more melodic options. Bright and resolved. The 4th can sound slightly tense if held - use it as a passing note.',
  },
  {
    id: 'dor',
    label: 'dor - Dorian',
    intervals: [0, 2, 3, 5, 7, 9, 10],
    description: 'Minor but slightly brighter - a raised 6th gives it a soulful, funky edge. Works well over minor chord jams. Think Santana, Oye Como Va, or modal jazz leads.',
  },
  {
    id: 'mix',
    label: 'mix - Mixolydian',
    intervals: [0, 2, 4, 5, 7, 9, 10],
    description: 'Major with a bluesy, unresolved edge - the flat 7th adds a rock and roll feel. Works perfectly over dominant 7th chords or a classic rock jam.',
  },
  {
    id: 'chr',
    label: 'chr - Chromatic',
    intervals: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
    description: 'All 12 notes - no filtering. Every note is available. Useful for playing chromatically or sending any MIDI note to a connected device.',
  },
]

// Semitone offsets from root considered "anchor" notes (root, minor 3rd, major 3rd, 5th)
const ANCHOR_OFFSETS = new Set([0, 3, 4, 7])

const selectedRoot   = ref('A')
const selectedScaleId = ref('mi.p')
const showInfo       = ref(false)
const pianoOctave    = ref(4)

const SUBTITLE = { pad: 'lit pads', notes: 'highlighted notes', guitar: 'highlighted frets', piano: 'highlighted keys' }
const subtitle = computed(() => `pick a key and scale - ${SUBTITLE[displayMode.value] ?? 'highlighted items'} are safe to play`)

const selectedScale = computed(() => SCALES.find(s => s.id === selectedScaleId.value))
const rootIndex     = computed(() => NOTES.indexOf(selectedRoot.value))

const activeIndices = computed(() => {
  const root = rootIndex.value
  return new Set(selectedScale.value.intervals.map(i => (root + i) % 12))
})

const anchorIndices = computed(() => {
  const root = rootIndex.value
  return new Set(
    selectedScale.value.intervals
      .filter(i => ANCHOR_OFFSETS.has(i))
      .map(i => (root + i) % 12)
  )
})

const cols = computed(() => padSize.value === '4x4' ? 4 : 3)

const pads = computed(() =>
  Array.from({ length: 4 * cols.value }, (_, i) => {
    const noteIndex = i % 12
    const octaveOffset = Math.floor(i / 12)
    return {
      number:      i + 1,
      label:       String(i + 1),
      note:        NOTES[noteIndex],
      noteIndex,
      octaveOffset,
      isSharp:     SHARPS.has(NOTES[noteIndex]),
      isActive:    activeIndices.value.has(noteIndex),
      isAnchor:    anchorIndices.value.has(noteIndex),
      isRoot:      noteIndex === rootIndex.value,
      midi:        12 * (octave.value + 1 + octaveOffset) + NOTE_TO_SEMI[noteIndex],
    }
  })
)

const rows = computed(() => sliceRows(pads.value, cols.value))

const chromaTiles = computed(() =>
  NOTES.map((note, i) => ({
    note,
    noteIndex: i,
    isSharp:  SHARPS.has(note),
    isActive: activeIndices.value.has(i),
    isAnchor: anchorIndices.value.has(i),
    isRoot:   i === rootIndex.value,
  }))
)

const pressedIndices = computed(() => {
  const result = new Set()
  for (const n of activeInputNotes.value) {
    result.add(NOTE_TO_SEMI.indexOf(n % 12))
  }
  return result
})

const guitarNeck = computed(() =>
  buildGuitarNeck(noteIdx => ({
    isActive: activeIndices.value.has(noteIdx),
    isAnchor: anchorIndices.value.has(noteIdx),
    isRoot:   noteIdx === rootIndex.value,
  }))
)

const scaleNotes = computed(() =>
  selectedScale.value.intervals.map(i => ({
    note:     NOTES[(rootIndex.value + i) % 12],
    isAnchor: ANCHOR_OFFSETS.has(i),
    isRoot:   i === 0,
  }))
)

// MIDI base notes for each guitar string (stringIdx 0-5: E2 A2 D3 G3 B3 E4)
const STRING_BASE_MIDI = [40, 45, 50, 55, 59, 64]
const { pressDown, pressUp, pressToggle } = useNotePlayback()

function padMidi(noteIndex, octave) {
  return 12 * (octave + 1) + NOTE_TO_SEMI[noteIndex]
}

function onPadDown(noteIndex, octaveOffset = 0) { pressDown(12 * (octave.value + 1 + octaveOffset) + NOTE_TO_SEMI[noteIndex]) }
function onPadUp(noteIndex, octaveOffset = 0)   { pressUp(12 * (octave.value + 1 + octaveOffset) + NOTE_TO_SEMI[noteIndex]) }

function onCellDown(stringIdx, fret) { pressDown(STRING_BASE_MIDI[stringIdx] + fret) }
function onCellUp(stringIdx, fret)   { pressUp(STRING_BASE_MIDI[stringIdx] + fret) }

function onPianoToggle(noteIdx) { pressToggle(padMidi(noteIdx, pianoOctave.value)) }
</script>

<template>
  <div class="jam-mode">
    <div class="jam-header">
      <h2>Jam Mode</h2>
      <p class="subtitle">{{ subtitle }}</p>
    </div>

    <div class="controls">
      <div class="control-group">
        <label>Key</label>
        <RootNotePicker v-model="selectedRoot" />
      </div>

      <div class="control-group">
        <label>Scale</label>
        <div class="scale-select-row">
          <select v-model="selectedScaleId" @change="showInfo = false">
            <option v-for="s in SCALES" :key="s.id" :value="s.id">{{ s.label }}</option>
          </select>
          <button class="info-btn" :class="{ active: showInfo }" @click="showInfo = !showInfo" aria-label="Scale info">i</button>
        </div>
        <p v-if="showInfo" class="scale-info">{{ selectedScale.description }}</p>
      </div>
    </div>

    <ModeLayout>
      <template #pad>
        <div class="grid">
          <div class="row" v-for="(row, ri) in rows" :key="ri" :style="{ gridTemplateColumns: `repeat(${row.length}, 1fr)` }">
            <div
              v-for="pad in row"
              :key="pad.number"
              class="pad"
              :class="{
                active:   pad.isActive && !pad.isAnchor && !pad.isRoot,
                anchor:   pad.isAnchor && !pad.isRoot,
                root:     pad.isRoot,
                inactive: !pad.isActive,
                pressed:  pressedIndices.has(pad.noteIndex),
              }"
              @pointerdown.prevent="onPadDown(pad.noteIndex, pad.octaveOffset)"
              @pointerup="onPadUp(pad.noteIndex, pad.octaveOffset)"
              @pointerleave="onPadUp(pad.noteIndex, pad.octaveOffset)"
              @pointercancel="onPadUp(pad.noteIndex, pad.octaveOffset)"
            >
              <span class="pad-label">{{ pad.label }}</span>
              <span class="pad-note">{{ pad.note }}</span>
              <span v-if="midiStatus === 'connected'" class="pad-midi">{{ pad.midi }}</span>
            </div>
          </div>
        </div>
      </template>

      <template #notes>
        <div class="chroma-strip">
          <div
            v-for="tile in chromaTiles"
            :key="tile.note"
            class="chroma-tile"
            :class="{
              active:   tile.isActive && !tile.isAnchor && !tile.isRoot,
              anchor:   tile.isAnchor && !tile.isRoot,
              root:     tile.isRoot,
              inactive: !tile.isActive,
              pressed:  pressedIndices.has(tile.noteIndex),
            }"
            @pointerdown.prevent="onPadDown(tile.noteIndex)"
            @pointerup="onPadUp(tile.noteIndex)"
            @pointerleave="onPadUp(tile.noteIndex)"
            @pointercancel="onPadUp(tile.noteIndex)"
          >
            <span class="tile-note">{{ tile.note }}</span>
          </div>
        </div>
      </template>

      <template #piano>
        <PianoOctave
          :activeIndices="activeIndices"
          :rootIndex="rootIndex"
          v-model:octave="pianoOctave"
          :dimInactive="true"
          :clickable="true"
          @toggle="onPianoToggle"
        />
      </template>

      <template #guitar>
        <div class="guitar-neck-wrap">
          <div class="guitar-neck">
            <div v-for="(string, si) in guitarNeck" :key="si" class="neck-row">
              <div class="string-name">{{ string.name }}</div>
              <div
                v-for="cell in string.cells"
                :key="cell.fret"
                class="neck-cell"
                :class="{
                  active: cell.isActive,
                  root:   cell.isRoot,
                  open:   cell.isOpen,
                }"
                @pointerdown.prevent="onCellDown(string.stringIdx, cell.fret)"
                @pointerup="onCellUp(string.stringIdx, cell.fret)"
                @pointerleave="onCellUp(string.stringIdx, cell.fret)"
                @pointercancel="onCellUp(string.stringIdx, cell.fret)"
              >
                <span
                  v-if="cell.isActive"
                  class="neck-dot"
                  :class="{ root: cell.isRoot, anchor: cell.isAnchor && !cell.isRoot }"
                ></span>
              </div>
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

    <ScaleLegend />

    <div class="scale-notes">
      <span class="scale-label">Notes</span>
      <span
        v-for="n in scaleNotes"
        :key="n.note"
        class="scale-note"
        :class="{ root: n.isRoot, anchor: n.isAnchor && !n.isRoot }"
      >{{ n.note }}</span>
    </div>
  </div>
</template>

<style scoped>
.jam-mode {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 2rem;
}

.jam-header h2 {
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
  margin: 1.5rem 0;
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


.scale-select-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.info-btn {
  width: 1.6rem;
  height: 1.6rem;
  border-radius: 50%;
  border: 1px solid var(--border2);
  background: var(--input);
  color: var(--text3);
  font-size: 0.8rem;
  font-style: italic;
  font-weight: 700;
  cursor: pointer;
  line-height: 1;
  flex-shrink: 0;
  transition: background 0.12s, border-color 0.12s, color 0.12s;
}

.info-btn:hover  { border-color: var(--accent); color: var(--text); }
.info-btn.active { background: var(--accent-bg); border-color: var(--accent); color: var(--accent); }

.scale-info {
  margin-top: 0.6rem;
  padding: 0.65rem 0.85rem;
  background: var(--input);
  border: 1px solid var(--border2);
  border-left: 3px solid var(--accent);
  border-radius: 6px;
  font-size: 0.82rem;
  color: var(--text2);
  line-height: 1.55;
  width: 100%;
}

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

/* Pad grid */
.grid {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  max-width: 420px;
  margin: 0 auto;
}

.row {
  display: grid;
  gap: 0.6rem;
}

.pad {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.15rem;
  padding: 0.75rem 0.5rem;
  border-radius: 8px;
  border: 1px solid var(--border);
  aspect-ratio: 1;
  transition: background 0.15s, border-color 0.15s;
  user-select: none;
  touch-action: none;
  cursor: pointer;
}

.pad.inactive { background: var(--bg); opacity: 0.35; }
.pad.active   { background: var(--raised); border-color: var(--border2); }
.pad.anchor   { background: var(--accent-bg); border-color: var(--accent-mid); }
.pad.root     { background: var(--rust-bg); border-color: var(--rust); }
.pad.pressed  { background: var(--accent-bg); border-color: var(--accent); opacity: 1; }

.pad-label { font-size: 0.7rem; color: var(--text4); font-weight: 600; letter-spacing: 0.1em; }
.pad-note  { font-size: 1.5rem; font-weight: 700; line-height: 1; }
.pad-midi  { font-size: 0.6rem; color: var(--text5); letter-spacing: 0.03em; }

.pad.inactive .pad-note { color: var(--text5); }
.pad.active   .pad-note { color: var(--text2); }
.pad.anchor   .pad-note { color: var(--accent); }
.pad.root     .pad-note { color: var(--rust-hi); }
.pad.pressed  .pad-note { color: var(--accent); }

/* Notes mode */
.chroma-strip {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.chroma-tile {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3.2rem;
  height: 3.2rem;
  border-radius: 8px;
  border: 1px solid var(--border);
  transition: background 0.15s, border-color 0.15s;
  user-select: none;
  touch-action: none;
  cursor: pointer;
}

.chroma-tile.inactive { background: transparent; border-color: transparent; opacity: 0.4; }
.chroma-tile.active   { background: var(--raised); border-color: var(--border2); }
.chroma-tile.anchor   { background: var(--accent-bg); border-color: var(--accent-mid); }
.chroma-tile.root     { background: var(--rust-bg); border-color: var(--rust); }
.chroma-tile.pressed  { background: var(--accent-bg); border-color: var(--accent); opacity: 1; }

.tile-note { font-size: 1.1rem; font-weight: 700; line-height: 1; }

.chroma-tile.inactive .tile-note { color: var(--text5); }
.chroma-tile.active   .tile-note { color: var(--text2); }
.chroma-tile.anchor   .tile-note { color: var(--accent); }
.chroma-tile.root     .tile-note { color: var(--rust-hi); }
.chroma-tile.pressed  .tile-note { color: var(--accent); }

/* Guitar neck */
.guitar-neck-wrap {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  margin-bottom: 0.5rem;
}

.guitar-neck {
  display: flex;
  flex-direction: column;
  gap: 0;
  min-width: 380px;
}

.neck-row {
  display: flex;
  align-items: center;
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
}

.neck-cell {
  flex: 1;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-right: 1px solid var(--border3);
  position: relative;
  user-select: none;
  touch-action: pan-x;
  cursor: pointer;
}

.neck-cell.open {
  border-right: 3px solid var(--border2);
}

.neck-dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--text3);
  display: block;
}

.neck-dot.anchor {
  background: var(--accent-lo);
}

.neck-dot.root {
  background: var(--dot-root);
  box-shadow: 0 0 4px var(--rust-glow);
}

.fret-numbers {
  display: flex;
  align-items: center;
  margin-top: 0.3rem;
}

.string-name-spacer {
  width: 1.8rem;
  flex-shrink: 0;
}

.fret-num {
  flex: 1;
  font-size: 0.6rem;
  color: var(--text5);
  text-align: center;
}


/* Scale notes strip */
.scale-notes {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.75rem;
  flex-wrap: wrap;
}

.scale-label {
  font-size: 0.75rem;
  color: var(--text4);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-right: 0.25rem;
}

.scale-note {
  padding: 0.25rem 0.6rem;
  border-radius: 4px;
  background: var(--raised);
  border: 1px solid var(--border2);
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text2);
}

.scale-note.anchor {
  background: var(--accent-bg);
  border-color: var(--accent-mid);
  color: var(--accent);
}

.scale-note.root {
  background: var(--rust-bg);
  border-color: var(--rust);
  color: var(--rust-hi);
}

@media (max-width: 600px) {
  .jam-mode {
    padding: 1.25rem 1rem;
  }

  .control-group {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .control-group label {
    min-width: unset;
  }

  .pad-note {
    font-size: 1.2rem;
  }
}

@media (orientation: landscape) and (max-height: 500px) {
  .jam-mode {
    padding: 0.75rem 1rem;
  }

  .jam-header h2 {
    font-size: 1.1rem;
  }

  .subtitle {
    display: none;
  }

  .controls {
    margin: 0.5rem 0;
    gap: 0.5rem;
  }

  .control-group {
    flex-direction: row;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: nowrap;
  }

  .control-group label {
    min-width: unset;
    white-space: nowrap;
  }

  .scale-notes {
    margin-top: 0.5rem;
  }
}
</style>
