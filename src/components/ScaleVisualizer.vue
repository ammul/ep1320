<script setup>
import { ref, computed } from 'vue'
import { displayMode } from '../displayMode.js'
import { padSize } from '../padSize.js'
import { NOTES, SHARPS, FRET_COUNT, NOTE_TO_SEMI } from '../musicConstants.js'
import { buildGuitarNeck, sliceRows } from '../musicUtils.js'
import { useNotePlayback } from '../composables/useNotePlayback.js'
import PianoOctave from './PianoOctave.vue'
import RootNotePicker from './RootNotePicker.vue'
import ModeLayout from './ModeLayout.vue'

const SCALES = [
  { id: '12t',  label: '12T - Chromatic',         intervals: [0,1,2,3,4,5,6,7,8,9,10,11], description: 'All 12 semitones. No inherent tonality - every key plays, nothing is highlighted. Useful for atonal passages or when you want full chromatic access.' },
  { id: 'maj',  label: 'maj - Major (Ionian)',     intervals: [0,2,4,5,7,9,11],             description: 'The familiar "happy" scale. Bright, stable, and resolved. The default western scale - works for pop, folk, classical, and most upbeat music.' },
  { id: 'min',  label: 'min - Minor (Aeolian)',    intervals: [0,2,3,5,7,8,10],             description: 'Natural minor. Dark, melancholic, and introspective. The most common minor scale - great for moody, emotional, or dramatic pieces.' },
  { id: 'dor',  label: 'dor - Dorian',             intervals: [0,2,3,5,7,9,10],             description: 'Minor with a raised 6th. Slightly brighter and jazzier than natural minor - sounds soulful and funky. Think "Scarborough Fair" or modal jazz.' },
  { id: 'phr',  label: 'phr - Phrygian',           intervals: [0,1,3,5,7,8,10],             description: 'Minor with a flattened 2nd. Very dark and tense, with a distinctly Spanish or flamenco flavour. Creates a brooding, exotic feel.' },
  { id: 'lyd',  label: 'lyd - Lydian',             intervals: [0,2,4,6,7,9,11],             description: 'Major with a raised 4th. Dreamy, ethereal, and floating - the raised 4th gives it an otherworldly quality. Common in film scores and ambient music.' },
  { id: 'mix',  label: 'mix - Mixolydian',         intervals: [0,2,4,5,7,9,10],             description: 'Major with a flattened 7th. Bright but slightly unresolved - sounds bluesy and rock-oriented. Think classic rock, Celtic, and blues-inflected pop.' },
  { id: 'loc',  label: 'loc - Locrian',            intervals: [0,1,3,5,6,8,10],             description: 'The most dissonant mode - minor with a flattened 2nd and 5th. Extremely unstable and tense; rarely used as a tonic but effective for dark, unsettling textures.' },
  { id: 'ma.p', label: 'ma.p - Major Pentatonic',  intervals: [0,2,4,7,9],                  description: 'Five-note major scale (no 4th or 7th). Open, consonant, and universally pleasing - nothing clashes. Common in folk, country, and East Asian music.' },
  { id: 'mi.p', label: 'mi.p - Minor Pentatonic',  intervals: [0,3,5,7,10],                 description: 'Five-note minor scale. The backbone of blues, rock, and R&B. Every note works over almost any chord - great for expressive leads and improvisation.' },
]

const selectedRoot = ref('A')
const selectedScaleId = ref('maj')
const showInfo = ref(false)
const pianoOctave = ref(4)

const selectedScale = computed(() => SCALES.find(s => s.id === selectedScaleId.value))
const rootIndex = computed(() => NOTES.indexOf(selectedRoot.value))

const activeIndices = computed(() => {
  const root = rootIndex.value
  return new Set(selectedScale.value.intervals.map(i => (root + i) % 12))
})

const degreeMap = computed(() => {
  const root = rootIndex.value
  const map = {}
  selectedScale.value.intervals.forEach((interval, i) => {
    map[(root + interval) % 12] = i + 1
  })
  return map
})

const cols = computed(() => padSize.value === '4x4' ? 4 : 3)

const pads = computed(() =>
  Array.from({ length: 4 * cols.value }, (_, i) => {
    const noteIndex = i % 12
    return {
      number:      i + 1,
      label:       String(i + 1),
      note:        NOTES[noteIndex],
      noteIndex,
      octaveOffset: Math.floor(i / 12),
      isSharp:     SHARPS.has(NOTES[noteIndex]),
      isActive:    activeIndices.value.has(noteIndex),
      isRoot:      noteIndex === rootIndex.value,
      degree:      degreeMap.value[noteIndex] ?? null,
    }
  })
)

const rows = computed(() => sliceRows(pads.value, cols.value))

// Notes mode: all 12 chromatic notes as tiles
const chromaTiles = computed(() =>
  NOTES.map((note, i) => ({
    note,
    isSharp: SHARPS.has(note),
    isActive: activeIndices.value.has(i),
    isRoot: i === rootIndex.value,
    degree: degreeMap.value[i] ?? null,
  }))
)

// Guitar neck: 6 strings displayed high→low (e, B, G, D, A, E)
const guitarNeck = computed(() =>
  buildGuitarNeck(noteIdx => ({
    isActive: activeIndices.value.has(noteIdx),
    isRoot:   noteIdx === rootIndex.value,
  }))
)

const STRING_BASE_MIDI = [40, 45, 50, 55, 59, 64]
const { pressDown, pressUp, pressToggle } = useNotePlayback()

function onPadDown(noteIndex, octaveOffset = 0) { pressDown(12 * (5 + octaveOffset) + NOTE_TO_SEMI[noteIndex]) }
function onPadUp(noteIndex, octaveOffset = 0)   { pressUp(12 * (5 + octaveOffset) + NOTE_TO_SEMI[noteIndex]) }

function onCellDown(stringIdx, fret) { pressDown(STRING_BASE_MIDI[stringIdx] + fret) }
function onCellUp(stringIdx, fret)   { pressUp(STRING_BASE_MIDI[stringIdx] + fret) }

function onPianoToggle(noteIdx) { pressToggle(padMidi(noteIdx)) }
</script>

<template>
  <div class="scale-viz">
    <div class="scale-viz-header">
      <h2>Scale Visualizer</h2>
      <p class="subtitle" v-if="displayMode === 'pad'">see which pads are active for any scale</p>
      <p class="subtitle" v-else-if="displayMode === 'notes'">chromatic note strip - scale notes highlighted</p>
      <p class="subtitle" v-else-if="displayMode === 'guitar'">guitar neck (standard tuning) - scale positions highlighted</p>
      <p class="subtitle" v-else>piano keyboard - scale notes highlighted</p>
    </div>

    <div class="controls">
      <div class="control-group">
        <label>Root note</label>
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
                active: pad.isActive,
                root: pad.isRoot,
                sharp: pad.isSharp,
                inactive: !pad.isActive,
              }"
              @pointerdown.prevent="onPadDown(pad.noteIndex, pad.octaveOffset)"
              @pointerup="onPadUp(pad.noteIndex, pad.octaveOffset)"
              @pointerleave="onPadUp(pad.noteIndex, pad.octaveOffset)"
              @pointercancel="onPadUp(pad.noteIndex, pad.octaveOffset)"
            >
              <span class="pad-label">{{ pad.label }}</span>
              <span class="pad-note">{{ pad.note }}</span>
              <span class="pad-degree" v-if="pad.isActive">{{ pad.isRoot ? '①' : pad.degree }}</span>
            </div>
          </div>
        </div>
      </template>

      <template #notes>
        <div class="chroma-strip">
          <div
            v-for="(tile, ti) in chromaTiles"
            :key="tile.note"
            class="chroma-tile"
            :class="{
              active: tile.isActive,
              root: tile.isRoot,
              sharp: tile.isSharp,
              inactive: !tile.isActive,
            }"
            @pointerdown.prevent="onPadDown(ti)"
            @pointerup="onPadUp(ti)"
            @pointerleave="onPadUp(ti)"
            @pointercancel="onPadUp(ti)"
          >
            <span class="tile-note">{{ tile.note }}</span>
            <span class="tile-degree" v-if="tile.isActive">{{ tile.isRoot ? '①' : tile.degree }}</span>
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
                  root: cell.isRoot,
                  open: cell.isOpen,
                }"
                @pointerdown.prevent="onCellDown(string.stringIdx, cell.fret)"
                @pointerup="onCellUp(string.stringIdx, cell.fret)"
                @pointerleave="onCellUp(string.stringIdx, cell.fret)"
                @pointercancel="onCellUp(string.stringIdx, cell.fret)"
              >
                <span v-if="cell.isActive" class="neck-dot" :class="{ root: cell.isRoot }"></span>
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

  </div>
</template>

<style scoped>
.scale-viz {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 2rem;
}

.scale-viz-header h2 {
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
.pad.active   { background: var(--raised); border-color: var(--accent-mid); }
.pad.root     { background: var(--rust-bg); border-color: var(--rust); }

.pad-label  { font-size: 0.7rem; color: var(--text4); font-weight: 600; letter-spacing: 0.1em; }
.pad-note   { font-size: 1.5rem; font-weight: 700; line-height: 1; }

.pad.inactive .pad-note { color: var(--text5); }
.pad.active .pad-note   { color: var(--accent); }
.pad.root .pad-note     { color: var(--rust-hi); }

.pad-degree           { font-size: 0.72rem; color: var(--accent-dim); }
.pad.root .pad-degree { color: var(--rust); }

/* Notes mode chromatic strip */
.chroma-strip {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.chroma-tile {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.2rem;
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
.chroma-tile.active   { background: var(--raised); border-color: var(--accent-mid); }
.chroma-tile.root     { background: var(--rust-bg); border-color: var(--rust); }

.tile-note { font-size: 1.1rem; font-weight: 700; line-height: 1; }
.chroma-tile.inactive .tile-note { color: var(--text5); }
.chroma-tile.active .tile-note   { color: var(--accent); }
.chroma-tile.root .tile-note     { color: var(--rust-hi); }

.tile-degree           { font-size: 0.65rem; color: var(--accent-dim); }
.chroma-tile.root .tile-degree { color: var(--rust); }

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
  background: var(--dot-scale);
  display: block;
}

.neck-dot.root {
  background: var(--dot-root);
  box-shadow: 0 0 5px var(--rust-glow);
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


@media (max-width: 600px) {
  .scale-viz {
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
  .scale-viz {
    padding: 0.75rem 1rem;
  }

  .scale-viz-header h2 {
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

}
</style>
