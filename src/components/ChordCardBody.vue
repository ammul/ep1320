<script setup>
import { computed } from 'vue'
import { displayMode } from '../displayMode.js'
import { NOTES, SHARPS } from '../musicConstants.js'
import GuitarChordDiagram from './GuitarChordDiagram.vue'
import PianoOctave from './PianoOctave.vue'

const props = defineProps({
  rows:         { type: Array,  required: true },
  pressLabels:  { type: Array,  required: true },
  noteNames:    { type: Array,  required: true },
  chordRootIdx: { type: Number, required: true },
  chordType:    { type: String, required: true },
})

const pianoActiveIndices = computed(() =>
  new Set(props.noteNames.map(n => NOTES.indexOf(n)))
)
</script>

<template>
  <!-- EP-1320 mode: mini pad grid + press labels -->
  <template v-if="displayMode === 'ep1320'">
    <div class="mini-grid">
      <div class="mini-row" v-for="(row, ri) in rows" :key="ri">
        <div
          v-for="pad in row"
          :key="pad.label"
          class="mini-pad"
          :class="{
            active:   pad.isActive,
            root:     pad.isRoot,
            sharp:    pad.isSharp,
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
      <span v-for="lbl in pressLabels" :key="lbl" class="press-badge">{{ lbl }}</span>
    </div>
  </template>

  <!-- Notes mode: note name badges -->
  <template v-else-if="displayMode === 'notes'">
    <div class="note-badges">
      <span
        v-for="n in noteNames"
        :key="n"
        class="note-badge"
        :class="{ root: n === NOTES[chordRootIdx], sharp: SHARPS.has(n) }"
      >{{ n }}</span>
    </div>
  </template>

  <!-- Guitar mode: chord diagram -->
  <template v-else-if="displayMode === 'guitar'">
    <GuitarChordDiagram :rootIndex="chordRootIdx" :type="chordType" />
  </template>

  <!-- Piano mode: compact keyboard -->
  <template v-else>
    <PianoOctave
      :activeIndices="pianoActiveIndices"
      :rootIndex="chordRootIdx"
      :showOctaveSelector="false"
      :dimInactive="true"
    />
  </template>
</template>

<style scoped>
/* Mini grid */
.mini-grid { display: flex; flex-direction: column; gap: 3px; margin: 0.25rem 0; }
.mini-row  { display: grid; grid-template-columns: repeat(3, 1fr); gap: 3px; }

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

/* Press labels */
.press-labels { display: flex; align-items: center; gap: 3px; flex-wrap: wrap; justify-content: center; }
.press-hint   { font-size: 0.65rem; color: #4a4030; margin-right: 2px; }
.press-badge  { background: #2e2820; border: 1px solid #4a4030; border-radius: 3px; padding: 1px 5px; font-size: 0.7rem; font-weight: 700; color: #c8a96e; }

/* Note badges */
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

.note-badge.root  { background: #3a2e10; border-color: #c8a96e; color: #f0c87a; }
.note-badge.sharp { background: #1e1c18; color: #a08858; border-color: #3a3228; }
.note-badge.root.sharp { background: #3a2e10; border-color: #c8a96e; color: #f0c87a; }

@media (max-width: 600px) {
  .mini-pad { width: 30px; height: 30px; }
}
</style>
