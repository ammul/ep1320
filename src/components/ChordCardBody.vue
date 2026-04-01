<script setup>
import { computed } from 'vue'
import { displayMode } from '../displayMode.js'
import { NOTES } from '../musicConstants.js'
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
  <!-- Pad mode: mini pad grid + press labels -->
  <template v-if="displayMode === 'pad'">
    <div class="mini-grid">
      <div class="mini-row" v-for="(row, ri) in rows" :key="ri" :style="{ gridTemplateColumns: `repeat(${row.length}, 1fr)` }">
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
        :class="{ root: n === NOTES[chordRootIdx] }"
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
.mini-row  { display: grid; gap: 3px; }

.mini-pad {
  width: 36px;
  height: 36px;
  border-radius: 4px;
  border: 1px solid var(--raised);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1px;
  transition: background 0.12s;
}

.mini-pad.inactive { background: var(--bg); opacity: 0.3; }
.mini-pad.active   { background: var(--raised); border-color: var(--accent-mid); }
.mini-pad.root     { background: var(--rust-bg); border-color: var(--rust); }

.mini-label { font-size: 0.6rem; font-weight: 700; color: var(--text5); line-height: 1; }
.mini-pad.active .mini-label { color: var(--accent-dim); }
.mini-pad.root   .mini-label { color: var(--rust); }

.mini-note { font-size: 0.62rem; font-weight: 700; line-height: 1; color: var(--accent); }
.mini-pad.root .mini-note { color: var(--rust-hi); }

/* Press labels */
.press-labels { display: flex; align-items: center; gap: 3px; flex-wrap: wrap; justify-content: center; }
.press-hint   { font-size: 0.65rem; color: var(--text5); margin-right: 2px; }
.press-badge  { background: var(--raised); border: 1px solid var(--border2); border-radius: 3px; padding: 1px 5px; font-size: 0.7rem; font-weight: 700; color: var(--accent); }

/* Note badges */
.note-badges { display: flex; flex-wrap: wrap; gap: 4px; justify-content: center; margin: 0.25rem 0; }

.note-badge {
  padding: 0.2rem 0.45rem;
  border-radius: 4px;
  background: var(--raised);
  border: 1px solid var(--border2);
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--accent);
}

.note-badge.root  { background: var(--rust-bg); border-color: var(--rust); color: var(--rust-hi); }

@media (max-width: 600px) {
  .mini-pad { width: 30px; height: 30px; }
}
</style>
