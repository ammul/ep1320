<script setup>
import { ref, computed } from 'vue'
import { displayMode } from '../displayMode.js'

const NOTES  = ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#']
const LABELS = ['.',  '0',  'i', '1', '2',  '3', '4',  '5', '6', '7',  '8', '9']
const SHARPS = new Set(['A#', 'C#', 'D#', 'F#', 'G#'])

// Guitar neck: open string note indices (E2, A2, D3, G3, B3, E4)
const OPEN_STRINGS = [7, 0, 5, 10, 2, 7]
const STRING_NAMES = ['E', 'A', 'D', 'G', 'B', 'e']
const FRET_COUNT = 12

const SCALES = [
  { id: '12t',  label: '12T — Chromatic',         intervals: [0,1,2,3,4,5,6,7,8,9,10,11], description: 'All 12 semitones. No inherent tonality — every key plays, nothing is highlighted. Useful for atonal passages or when you want full chromatic access.' },
  { id: 'maj',  label: 'maj — Major (Ionian)',     intervals: [0,2,4,5,7,9,11],             description: 'The familiar "happy" scale. Bright, stable, and resolved. The default western scale — works for pop, folk, classical, and most upbeat music.' },
  { id: 'min',  label: 'min — Minor (Aeolian)',    intervals: [0,2,3,5,7,8,10],             description: 'Natural minor. Dark, melancholic, and introspective. The most common minor scale — great for moody, emotional, or dramatic pieces.' },
  { id: 'dor',  label: 'dor — Dorian',             intervals: [0,2,3,5,7,9,10],             description: 'Minor with a raised 6th. Slightly brighter and jazzier than natural minor — sounds soulful and funky. Think "Scarborough Fair" or modal jazz.' },
  { id: 'phr',  label: 'phr — Phrygian',           intervals: [0,1,3,5,7,8,10],             description: 'Minor with a flattened 2nd. Very dark and tense, with a distinctly Spanish or flamenco flavour. Creates a brooding, exotic feel.' },
  { id: 'lyd',  label: 'lyd — Lydian',             intervals: [0,2,4,6,7,9,11],             description: 'Major with a raised 4th. Dreamy, ethereal, and floating — the raised 4th gives it an otherworldly quality. Common in film scores and ambient music.' },
  { id: 'mix',  label: 'mix — Mixolydian',         intervals: [0,2,4,5,7,9,10],             description: 'Major with a flattened 7th. Bright but slightly unresolved — sounds bluesy and rock-oriented. Think classic rock, Celtic, and blues-inflected pop.' },
  { id: 'loc',  label: 'loc — Locrian',            intervals: [0,1,3,5,6,8,10],             description: 'The most dissonant mode — minor with a flattened 2nd and 5th. Extremely unstable and tense; rarely used as a tonic but effective for dark, unsettling textures.' },
  { id: 'ma.p', label: 'ma.p — Major Pentatonic',  intervals: [0,2,4,7,9],                  description: 'Five-note major scale (no 4th or 7th). Open, consonant, and universally pleasing — nothing clashes. Common in folk, country, and East Asian music.' },
  { id: 'mi.p', label: 'mi.p — Minor Pentatonic',  intervals: [0,3,5,7,10],                 description: 'Five-note minor scale. The backbone of blues, rock, and R&B. Every note works over almost any chord — great for expressive leads and improvisation.' },
]

const selectedRoot = ref('A')
const selectedScaleId = ref('maj')
const showInfo = ref(false)

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

const pads = computed(() =>
  NOTES.map((note, i) => ({
    number: i + 1,
    label: LABELS[i],
    note,
    isSharp: SHARPS.has(note),
    isActive: activeIndices.value.has(i),
    isRoot: i === rootIndex.value,
    degree: degreeMap.value[i] ?? null,
  }))
)

const rows = computed(() => [
  pads.value.slice(9, 12),
  pads.value.slice(6, 9),
  pads.value.slice(3, 6),
  pads.value.slice(0, 3),
])

const scaleNotes = computed(() =>
  selectedScale.value.intervals.map(i => NOTES[(rootIndex.value + i) % 12])
)

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
const guitarNeck = computed(() => {
  const neck = []
  for (let s = 5; s >= 0; s--) {
    const cells = []
    for (let f = 0; f <= FRET_COUNT; f++) {
      const noteIdx = (OPEN_STRINGS[s] + f) % 12
      cells.push({
        noteIdx,
        note: NOTES[noteIdx],
        isActive: activeIndices.value.has(noteIdx),
        isRoot: noteIdx === rootIndex.value,
        fret: f,
        isOpen: f === 0,
      })
    }
    neck.push({ stringIdx: s, name: STRING_NAMES[s], cells })
  }
  return neck
})
</script>

<template>
  <div class="scale-viz">
    <div class="scale-viz-header">
      <h2>Scale Visualizer</h2>
      <p class="subtitle" v-if="displayMode === 'ep1320'">see which pads are active for any scale · matches EP‑1320 scale names</p>
      <p class="subtitle" v-else-if="displayMode === 'notes'">chromatic note strip — scale notes highlighted</p>
      <p class="subtitle" v-else>guitar neck (standard tuning) — scale positions highlighted</p>
    </div>

    <div class="controls">
      <div class="control-group">
        <label>Root note</label>
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

    <!-- EP-1320 mode: pad grid -->
    <template v-if="displayMode === 'ep1320'">
      <div class="grid">
        <div class="row" v-for="(row, ri) in rows" :key="ri">
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
          >
            <span class="pad-label">{{ pad.label }}</span>
            <span class="pad-note">{{ pad.note }}</span>
            <span class="pad-degree" v-if="pad.isActive">{{ pad.isRoot ? '①' : pad.degree }}</span>
          </div>
        </div>
      </div>
    </template>

    <!-- Notes mode: chromatic strip -->
    <template v-else-if="displayMode === 'notes'">
      <div class="chroma-strip">
        <div
          v-for="tile in chromaTiles"
          :key="tile.note"
          class="chroma-tile"
          :class="{
            active: tile.isActive,
            root: tile.isRoot,
            sharp: tile.isSharp,
            inactive: !tile.isActive,
          }"
        >
          <span class="tile-note">{{ tile.note }}</span>
          <span class="tile-degree" v-if="tile.isActive">{{ tile.isRoot ? '①' : tile.degree }}</span>
        </div>
      </div>
    </template>

    <!-- Guitar mode: neck -->
    <template v-else>
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
            >
              <span v-if="cell.isActive" class="neck-dot" :class="{ root: cell.isRoot }"></span>
            </div>
          </div>
          <!-- fret numbers -->
          <div class="fret-numbers">
            <div class="string-name-spacer"></div>
            <div v-for="f in FRET_COUNT + 1" :key="f" class="fret-num">
              {{ f - 1 === 0 ? '' : f - 1 }}
            </div>
          </div>
        </div>
      </div>
    </template>

    <div class="scale-notes">
      <span class="scale-label">Notes in scale</span>
      <span
        v-for="note in scaleNotes"
        :key="note"
        class="scale-note"
        :class="{ root: note === selectedRoot }"
      >{{ note }}</span>
    </div>
  </div>
</template>

<style scoped>
.scale-viz {
  background: #242019;
  border: 1px solid #3a3228;
  border-radius: 12px;
  padding: 2rem;
}

.scale-viz-header h2 {
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
  color: #c8a96e;
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
  border: 1px solid #4a4030;
  background: #1e1c18;
  color: #a09080;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.12s, border-color 0.12s, color 0.12s;
  min-width: 2.4rem;
  text-align: center;
}

.note-picker button.sharp { background: #161412; color: #7a6f60; }
.note-picker button:hover  { border-color: #c8a96e; color: #e8dcc8; }
.note-picker button.active { background: #c8a96e; border-color: #c8a96e; color: #1a1714; }

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
  border: 1px solid #4a4030;
  background: #1e1c18;
  color: #7a6f60;
  font-size: 0.8rem;
  font-style: italic;
  font-weight: 700;
  cursor: pointer;
  line-height: 1;
  flex-shrink: 0;
  transition: background 0.12s, border-color 0.12s, color 0.12s;
}

.info-btn:hover  { border-color: #c8a96e; color: #e8dcc8; }
.info-btn.active { background: #3a2e10; border-color: #c8a96e; color: #c8a96e; }

.scale-info {
  margin-top: 0.6rem;
  padding: 0.65rem 0.85rem;
  background: #1e1c18;
  border: 1px solid #4a4030;
  border-left: 3px solid #c8a96e;
  border-radius: 6px;
  font-size: 0.82rem;
  color: #a09080;
  line-height: 1.55;
  width: 100%;
}

select {
  background: #1e1c18;
  border: 1px solid #4a4030;
  border-radius: 6px;
  color: #e8dcc8;
  padding: 0.4rem 0.8rem;
  font-size: 0.9rem;
  cursor: pointer;
  outline: none;
  max-width: 100%;
}

select:focus { border-color: #c8a96e; }

/* EP-1320 grid */
.grid {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  max-width: 360px;
}

.row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
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
  border: 1px solid #3a3228;
  aspect-ratio: 1;
  transition: background 0.15s, border-color 0.15s;
}

.pad.inactive { background: #1a1714; opacity: 0.35; }
.pad.active   { background: #2e2820; border-color: #6a5a30; }
.pad.root     { background: #3a2e10; border-color: #c8a96e; }

.pad-label  { font-size: 0.7rem; color: #5a5040; font-weight: 600; letter-spacing: 0.1em; }
.pad-note   { font-size: 1.5rem; font-weight: 700; line-height: 1; }

.pad.inactive .pad-note { color: #4a4030; }
.pad.active .pad-note   { color: #c8a96e; }
.pad.root .pad-note     { color: #f0c87a; }

.pad-degree           { font-size: 0.72rem; color: #8a7850; }
.pad.root .pad-degree { color: #c8a96e; }

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
  border: 1px solid #3a3228;
  transition: background 0.15s, border-color 0.15s;
}

.chroma-tile.inactive { background: #1a1714; opacity: 0.35; }
.chroma-tile.active   { background: #2e2820; border-color: #6a5a30; }
.chroma-tile.root     { background: #3a2e10; border-color: #c8a96e; }

.tile-note { font-size: 1.1rem; font-weight: 700; line-height: 1; }
.chroma-tile.inactive .tile-note { color: #4a4030; }
.chroma-tile.active .tile-note   { color: #c8a96e; }
.chroma-tile.root .tile-note     { color: #f0c87a; }

.tile-degree           { font-size: 0.65rem; color: #8a7850; }
.chroma-tile.root .tile-degree { color: #c8a96e; }

/* Guitar neck */
.guitar-neck-wrap {
  overflow-x: auto;
  margin-bottom: 0.5rem;
}

.guitar-neck {
  display: flex;
  flex-direction: column;
  gap: 0;
  min-width: 600px;
}

.neck-row {
  display: flex;
  align-items: center;
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
}

.neck-cell {
  flex: 1;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-right: 1px solid #2a2420;
  position: relative;
}

.neck-cell.open {
  border-right: 3px solid #4a4030;
}

.neck-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #6a5a30;
  display: block;
}

.neck-dot.root {
  background: #c8a96e;
  box-shadow: 0 0 4px rgba(200,169,110,0.5);
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
  color: #4a4030;
  text-align: center;
}

/* Scale notes strip */
.scale-notes {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1.5rem;
  flex-wrap: wrap;
}

.scale-label {
  font-size: 0.75rem;
  color: #5a5040;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-right: 0.25rem;
}

.scale-note {
  padding: 0.25rem 0.6rem;
  border-radius: 4px;
  background: #2e2820;
  border: 1px solid #4a4030;
  font-size: 0.85rem;
  font-weight: 600;
  color: #a09080;
}

.scale-note.root {
  background: #3a2e10;
  border-color: #c8a96e;
  color: #f0c87a;
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
</style>
