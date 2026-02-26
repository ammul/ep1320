<script setup>
import { ref, computed } from 'vue'

const NOTES  = ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#']
const LABELS = ['.',  '0',  'i', '1', '2',  '3', '4',  '5', '6', '7',  '8', '9']
const SHARPS = new Set(['A#', 'C#', 'D#', 'F#', 'G#'])

const SCALES = [
  { id: '12t',  label: '12T — Chromatic',         intervals: [0,1,2,3,4,5,6,7,8,9,10,11] },
  { id: 'maj',  label: 'maj — Major (Ionian)',     intervals: [0,2,4,5,7,9,11] },
  { id: 'min',  label: 'min — Minor (Aeolian)',    intervals: [0,2,3,5,7,8,10] },
  { id: 'dor',  label: 'dor — Dorian',             intervals: [0,2,3,5,7,9,10] },
  { id: 'phr',  label: 'phr — Phrygian',           intervals: [0,1,3,5,7,8,10] },
  { id: 'lyd',  label: 'lyd — Lydian',             intervals: [0,2,4,6,7,9,11] },
  { id: 'mix',  label: 'mix — Mixolydian',         intervals: [0,2,4,5,7,9,10] },
  { id: 'loc',  label: 'loc — Locrian',            intervals: [0,1,3,5,6,8,10] },
  { id: 'ma.p', label: 'ma.p — Major Pentatonic',  intervals: [0,2,4,7,9] },
  { id: 'mi.p', label: 'mi.p — Minor Pentatonic',  intervals: [0,3,5,7,10] },
]

const selectedRoot = ref('A')
const selectedScaleId = ref('maj')

const selectedScale = computed(() => SCALES.find(s => s.id === selectedScaleId.value))

const rootIndex = computed(() => NOTES.indexOf(selectedRoot.value))

// Set of pad indices (0–11) that are active in the current scale
const activeIndices = computed(() => {
  const root = rootIndex.value
  return new Set(selectedScale.value.intervals.map(i => (root + i) % 12))
})

// Which interval degree (1-based) is each active pad?
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

// Numpad layout (top→bottom): 7 8 9 / 4 5 6 / 1 2 3 / . 0 i
// Notes ascend bottom→top: A on ., G# on 9
const rows = computed(() => [
  pads.value.slice(9, 12),
  pads.value.slice(6, 9),
  pads.value.slice(3, 6),
  pads.value.slice(0, 3),
])

const scaleNotes = computed(() =>
  selectedScale.value.intervals.map(i => NOTES[(rootIndex.value + i) % 12])
)
</script>

<template>
  <div class="scale-viz">
    <div class="scale-viz-header">
      <h2>Scale Visualizer</h2>
      <p class="subtitle">see which pads are active for any scale · matches EP‑1320 scale names</p>
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
        <select v-model="selectedScaleId">
          <option v-for="s in SCALES" :key="s.id" :value="s.id">{{ s.label }}</option>
        </select>
      </div>
    </div>

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

.note-picker button.sharp {
  background: #161412;
  color: #7a6f60;
}

.note-picker button:hover {
  border-color: #c8a96e;
  color: #e8dcc8;
}

.note-picker button.active {
  background: #c8a96e;
  border-color: #c8a96e;
  color: #1a1714;
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

select:focus {
  border-color: #c8a96e;
}

/* Grid */
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

.pad.inactive {
  background: #1a1714;
  opacity: 0.35;
}

.pad.active {
  background: #2e2820;
  border-color: #6a5a30;
}

.pad.root {
  background: #3a2e10;
  border-color: #c8a96e;
}

.pad-label {
  font-size: 0.7rem;
  color: #5a5040;
  font-weight: 600;
  letter-spacing: 0.1em;
}

.pad-note {
  font-size: 1.5rem;
  font-weight: 700;
  line-height: 1;
}

.pad.inactive .pad-note  { color: #4a4030; }
.pad.active .pad-note    { color: #c8a96e; }
.pad.root .pad-note      { color: #f0c87a; }

.pad-degree {
  font-size: 0.72rem;
  color: #8a7850;
}

.pad.root .pad-degree {
  color: #c8a96e;
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
