<script setup>
import { ref, computed, watch } from 'vue'

// Standard tuning open string note indices (A=0 … G#=11)
// Strings 0–5: E2, A2, D3, G3, B3, E4
const OPEN_STRINGS = [7, 0, 5, 10, 2, 7]

// Chord shapes: fret offsets from root position, -1 = muted
// rootString: which string carries the root note
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
  type: { type: String, required: true },
})

const voicingIndex = ref(0)

// Reset voicing when chord changes
watch([() => props.rootIndex, () => props.type], () => {
  voicingIndex.value = 0
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
  const shape = shapes.value[voicingIndex.value]
  const openNote = OPEN_STRINGS[shape.rootString]
  const rootFret = (props.rootIndex - openNote + 12) % 12

  const frets = shape.offsets.map(offset =>
    offset === -1 ? -1 : rootFret + offset
  )

  const pressedFrets = frets.filter(f => f > 0)
  const baseFret = pressedFrets.length > 0 ? Math.min(...pressedFrets) : 1

  // Build 4 fret rows
  const rows = []
  for (let row = 0; row < 4; row++) {
    const fretNum = baseFret + row
    const cells = frets.map(f => ({ hasDot: f === fretNum }))
    rows.push(cells)
  }

  return { frets, baseFret, rows, label: shape.label }
})
</script>

<template>
  <div class="guitar-chord">
    <div class="diagram-wrap">
      <!-- base fret label -->
      <div v-if="voicing.baseFret > 1" class="base-fret-label">{{ voicing.baseFret }}fr</div>

      <div class="diagram">
        <!-- mute / open markers above nut -->
        <div class="top-markers">
          <span
            v-for="(f, s) in voicing.frets"
            :key="s"
            class="top-marker"
          >{{ f === -1 ? '✕' : f === 0 ? '○' : '' }}</span>
        </div>

        <!-- nut (thick if open position) -->
        <div class="nut" :class="{ open: voicing.baseFret === 1 }"></div>

        <!-- fret rows -->
        <div class="fret-grid">
          <div v-for="(row, ri) in voicing.rows" :key="ri" class="fret-row">
            <div v-for="(cell, si) in row" :key="si" class="fret-cell">
              <span v-if="cell.hasDot" class="finger-dot" :class="{ root: voicing.frets[si] === voicing.baseFret + ri && si === 0 || false }"></span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- voicing selector -->
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
  color: #7a6f60;
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
  color: #7a6f60;
  line-height: 1;
}

.nut {
  height: 2px;
  background: #4a4030;
  border-radius: 1px;
}

.nut.open {
  background: #c8a96e;
  height: 3px;
}

.fret-grid {
  display: flex;
  flex-direction: column;
  border-left: 1px solid #4a4030;
  border-right: 1px solid #4a4030;
}

.fret-row {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  height: 14px;
  border-bottom: 1px solid #4a4030;
  position: relative;
}

.fret-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  border-right: 1px solid #3a3228;
  position: relative;
}

.fret-cell:last-child {
  border-right: none;
}

.finger-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #c8a96e;
  display: block;
  z-index: 1;
}

.voicing-selector {
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.vcng-btn {
  background: transparent;
  border: 1px solid #3a3228;
  border-radius: 3px;
  color: #7a6f60;
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

.vcng-btn:hover {
  border-color: #c8a96e;
  color: #c8a96e;
}

.vcng-label {
  font-size: 0.58rem;
  color: #5a5040;
  white-space: nowrap;
}
</style>
