<script setup>
import { computed } from 'vue'
import { displayMode } from '../state/displayMode.js'
import { NOTES } from '../constants/musicConstants.js'
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
    <div class="mini-grid flex-col gap-05 my-1" style="margin: 0.25rem 0">
      <div class="mini-row" v-for="(row, ri) in rows" :key="ri" :style="{ display: 'grid', gap: '3px', gridTemplateColumns: `repeat(${row.length}, 1fr)` }">
        <div
          v-for="pad in row"
          :key="pad.label"
          class="mini-pad"
          :class="{
            active:   pad.isActive,
            root:     pad.isRoot,
            inactive: !pad.isActive,
          }"
        >
          <span class="mini-label">{{ pad.label }}</span>
          <span class="mini-note" v-if="pad.isActive">{{ pad.note }}</span>
        </div>
      </div>
    </div>
    <div class="press-labels flex items-center gap-05 flex-wrap justify-center">
      <span class="text-tiny text-dim" style="margin-right: 2px">press</span>
      <span v-for="lbl in pressLabels" :key="lbl" class="press-badge chip p-1 text-tiny text-bold text-accent" style="padding: 1px 5px">{{ lbl }}</span>
    </div>
  </template>

  <!-- Notes mode: note name badges -->
  <template v-else-if="displayMode === 'notes'">
    <div class="note-badges flex-wrap gap-1 justify-center my-1" style="margin: 0.25rem 0">
      <span
        v-for="n in noteNames"
        :key="n"
        class="note-badge chip text-small text-bold text-accent"
        :class="{ root: n === NOTES[chordRootIdx] }"
        :style="n === NOTES[chordRootIdx] ? { background: 'var(--rust-bg)', borderColor: 'var(--rust)', color: 'var(--rust-hi)' } : {}"
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
.mini-pad {
  width: 36px; height: 36px; border-radius: 4px; border: 1px solid var(--raised);
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 1px; transition: background 0.12s;
}
.mini-pad.inactive { background: var(--bg); opacity: 0.3; }
.mini-pad.active   { background: var(--raised); border-color: var(--accent-mid); }
.mini-pad.root     { background: var(--rust-bg); border-color: var(--rust); }

.mini-label { font-size: 0.6rem; font-weight: 700; color: var(--text5); line-height: 1; }
.mini-pad.active .mini-label { color: var(--accent-dim); }
.mini-pad.root   .mini-label { color: var(--rust); }

.mini-note { font-size: 0.62rem; font-weight: 700; line-height: 1; color: var(--accent); }
.mini-pad.root .mini-note { color: var(--rust-hi); }

@media (max-width: 600px) {
  .mini-pad { width: 30px; height: 30px; }
}
</style>
