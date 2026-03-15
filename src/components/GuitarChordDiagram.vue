<script setup>
import { ref, computed, watch } from 'vue'
import { OPEN_STRINGS } from '../musicConstants.js'

// Chord shapes: fret offsets from root position on root string, -1 = muted
// rootString: which string (0=low E … 5=high e) carries the root note
const GUITAR_SHAPES = {
  maj: [
    { label: 'E-shape', rootString: 0, offsets: [0, 2, 2, 1, 0, 0] },
    { label: 'A-shape', rootString: 1, offsets: [-1, 0, 2, 2, 2, 0] },
  ],
  min: [
    { label: 'Em-shape', rootString: 0, offsets: [0, 2, 2, 0, 0, 0] },
    { label: 'Am-shape', rootString: 1, offsets: [-1, 0, 2, 2, 1, 0] },
  ],
  dom7: [
    { label: 'E7-shape', rootString: 0, offsets: [0, 2, 0, 1, 0, 0] },
    { label: 'A7-shape', rootString: 1, offsets: [-1, 0, 2, 0, 2, 0] },
  ],
  maj7: [
    { label: 'Emaj7-shape', rootString: 0, offsets: [0, 2, 1, 1, 0, -1] },
    { label: 'Amaj7-shape', rootString: 1, offsets: [-1, 0, 2, 1, 2, 0] },
  ],
  min7: [
    { label: 'Em7-shape', rootString: 0, offsets: [0, 2, 0, 0, 0, 0] },
    { label: 'Am7-shape', rootString: 1, offsets: [-1, 0, 2, 0, 1, 0] },
  ],
  dim: [
    { label: 'shape 1', rootString: 1, offsets: [-1, 0, 1, 2, 1, -1] },
    { label: 'shape 2', rootString: 0, offsets: [0, 1, 2, 0, -1, -1] },
  ],
  aug: [
    { label: 'shape 1', rootString: 1, offsets: [-1, 0, 3, 2, 2, -1] },
    { label: 'shape 2', rootString: 0, offsets: [0, 3, 2, 1, 1, -1] },
  ],
  sus4: [
    { label: 'Asus4-shape', rootString: 1, offsets: [-1, 0, 2, 2, 3, 0] },
    { label: 'Esus4-shape', rootString: 0, offsets: [0, 2, 2, 2, 0, 0] },
  ],
}

const props = defineProps({
  rootIndex: { type: Number, required: true },
  type:      { type: String, required: true },
})

function bestVoicingIndex(shapesList, rootIndex) {
  let best = 0
  let bestFret = Infinity
  shapesList.forEach((shape, i) => {
    const openNote = OPEN_STRINGS[shape.rootString]
    const rootFret = (rootIndex - openNote + 12) % 12
    const frets    = shape.offsets.map(o => o === -1 ? -1 : rootFret + o)
    const pressed  = frets.filter(f => f > 0)
    const base     = pressed.length > 0 ? Math.min(...pressed) : 1
    if (base < bestFret) { bestFret = base; best = i }
  })
  return best
}

const voicingIndex = ref(bestVoicingIndex(GUITAR_SHAPES[props.type] ?? GUITAR_SHAPES.maj, props.rootIndex))

watch([() => props.rootIndex, () => props.type], () => {
  voicingIndex.value = bestVoicingIndex(shapes.value, props.rootIndex)
})

const shapes = computed(() => GUITAR_SHAPES[props.type] ?? GUITAR_SHAPES.maj)
const voicingCount = computed(() => shapes.value.length)

function prevVoicing() {
  voicingIndex.value = (voicingIndex.value - 1 + voicingCount.value) % voicingCount.value
}
function nextVoicing() {
  voicingIndex.value = (voicingIndex.value + 1) % voicingCount.value
}

const voicing = computed(() => {
  const shape    = shapes.value[voicingIndex.value]
  const openNote = OPEN_STRINGS[shape.rootString]
  // +12 ensures positive result before modulo when rootIndex < openNote
  const rootFret = (props.rootIndex - openNote + 12) % 12

  const frets = shape.offsets.map(offset =>
    offset === -1 ? -1 : rootFret + offset
  )

  const pressedFrets = frets.filter(f => f > 0)
  const baseFret = pressedFrets.length > 0 ? Math.min(...pressedFrets) : 1

  const rows = []
  for (let row = 0; row < 4; row++) {
    const fretNum = baseFret + row
    const cells = frets.map((f, si) => ({
      hasDot: f === fretNum,
      // Mark as root if this fret plays the root note on this string
      isRoot: f === fretNum && (OPEN_STRINGS[si] + f) % 12 === props.rootIndex,
    }))
    rows.push(cells)
  }

  return { frets, baseFret, rows, label: shape.label }
})
</script>

<template>
  <div class="guitar-chord">
    <div class="diagram-wrap">
      <div v-if="voicing.baseFret > 1" class="base-fret-label">{{ voicing.baseFret }}fr</div>

      <div class="diagram">
        <div class="top-markers">
          <span v-for="(f, s) in voicing.frets" :key="s" class="top-marker">
            {{ f === -1 ? '✕' : f === 0 ? '○' : '' }}
          </span>
        </div>

        <div class="nut" :class="{ open: voicing.baseFret === 1 }"></div>

        <div class="fret-grid">
          <div v-for="(row, ri) in voicing.rows" :key="ri" class="fret-row">
            <div v-for="(cell, si) in row" :key="si" class="fret-cell">
              <span v-if="cell.hasDot" class="finger-dot" :class="{ root: cell.isRoot }"></span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="voicing-selector" v-if="voicingCount > 1">
      <button class="vcng-btn" @click="prevVoicing">‹</button>
      <span class="vcng-label">{{ voicing.label }}</span>
      <button class="vcng-btn" @click="nextVoicing">›</button>
    </div>
  </div>
</template>

<style scoped>
.guitar-chord {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;
}

.diagram-wrap {
  display: flex;
  align-items: flex-start;
  gap: 0.3rem;
}

.base-fret-label {
  font-size: 0.6rem;
  color: var(--text3);
  margin-top: 1.4rem;
  line-height: 1;
}

.diagram {
  display: flex;
  flex-direction: column;
  width: 72px;
}

.top-markers {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  height: 14px;
  margin-bottom: 1px;
}

.top-marker {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.55rem;
  color: var(--text3);
  line-height: 1;
}

.nut      { height: 2px; background: var(--border2); border-radius: 1px; }
.nut.open { height: 3px; background: var(--accent); }

.fret-grid {
  display: flex;
  flex-direction: column;
  border-left: 1px solid var(--border2);
  border-right: 1px solid var(--border2);
}

.fret-row {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  height: 14px;
  border-bottom: 1px solid var(--border2);
}

.fret-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  border-right: 1px solid var(--border);
}

.fret-cell:last-child { border-right: none; }

.finger-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--accent);
  display: block;
}

.finger-dot.root {
  background: var(--accent-hi);
  box-shadow: 0 0 3px var(--accent-glow);
}

.voicing-selector {
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.vcng-btn {
  background: transparent;
  border: 1px solid var(--border);
  border-radius: 3px;
  color: var(--text3);
  font-size: 0.75rem;
  width: 1.2rem;
  height: 1.2rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  padding: 0;
  transition: border-color 0.12s, color 0.12s;
}

.vcng-btn:hover { border-color: var(--accent); color: var(--accent); }

.vcng-label {
  font-size: 0.58rem;
  color: var(--text4);
  white-space: nowrap;
}
</style>
