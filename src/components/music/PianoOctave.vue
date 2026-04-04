<script setup>
import { computed } from 'vue'
import { PIANO_WHITE, PIANO_BLACK, NOTES } from '@/constants/musicConstants.js'

const props = defineProps({
  activeIndices:      { type: Object,  default: () => new Set() }, // Set of A-based indices
  rootIndex:          { type: Number,  default: -1 },              // A-based, -1 = none
  octave:             { type: Number,  default: 4 },
  showOctaveSelector: { type: Boolean, default: true },
  clickable:          { type: Boolean, default: false },
  dimInactive:        { type: Boolean, default: false },
})

const emit = defineEmits(['toggle', 'update:octave'])

const whiteKeys = computed(() =>
  PIANO_WHITE.map(noteIdx => ({
    noteIdx,
    note: NOTES[noteIdx],
    isActive: props.activeIndices.has(noteIdx),
    isRoot:   noteIdx === props.rootIndex,
  }))
)

const blackKeys = computed(() =>
  PIANO_BLACK.map(({ noteIdx, after }) => ({
    noteIdx,
    note: NOTES[noteIdx],
    isActive: props.activeIndices.has(noteIdx),
    isRoot:   noteIdx === props.rootIndex,
    // left% = center of gap between white keys, minus half black key width
    // white key = 100/7%, black key = 60/7%, so left = (after*100 - 30) / 7 %
    style: { left: `${((after * 100 - 30) / 7).toFixed(3)}%` },
  }))
)

function onToggle(noteIdx) {
  if (props.clickable) emit('toggle', noteIdx)
}
</script>

<template>
  <div class="piano-wrap">
    <div v-if="showOctaveSelector" class="octave-ctl">
      <label>Octave</label>
      <button @click="emit('update:octave', Math.max(0, octave - 1))">−</button>
      <span class="octave-val">{{ octave }}</span>
      <button @click="emit('update:octave', Math.min(9, octave + 1))">+</button>
    </div>

    <div class="piano" :class="{ clickable, 'dim-inactive': dimInactive }">
      <button
        v-for="key in whiteKeys"
        :key="key.noteIdx"
        class="white-key"
        :class="{ active: key.isActive, root: key.isRoot }"
        @pointerdown.prevent="onToggle(key.noteIdx)"
      >
        <span class="key-label">{{ key.note }}</span>
      </button>

      <button
        v-for="key in blackKeys"
        :key="key.noteIdx"
        class="black-key"
        :class="{ active: key.isActive, root: key.isRoot }"
        :style="key.style"
        @pointerdown.stop.prevent="onToggle(key.noteIdx)"
      >
        <span class="key-label">{{ key.note }}</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.piano-wrap {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

/* Octave selector */
.octave-ctl {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.9rem;
  color: var(--text2);
}

.octave-ctl label {
  font-weight: 600;
  color: var(--accent);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-size: 0.8rem;
}

.octave-ctl button {
  width: 2rem;
  height: 2rem;
  border: 1px solid var(--border2);
  border-radius: 6px;
  background: var(--bg);
  color: var(--accent);
  font-size: 1.1rem;
  cursor: pointer;
  line-height: 1;
  transition: background 0.15s, border-color 0.15s;
}

.octave-ctl button:hover {
  background: var(--accent-bg);
  border-color: var(--accent);
}

.octave-val {
  min-width: 1.5rem;
  text-align: center;
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text);
}

/* Piano keyboard */
.piano {
  position: relative;
  display: flex;
  height: 120px;
  max-width: 420px;
  user-select: none;
  touch-action: none;
}

/* White keys */
.white-key {
  flex: 1;
  height: 100%;
  background: var(--pk-white);
  border: 1px solid var(--pk-white-bd);
  border-top: none;
  border-radius: 0 0 5px 5px;
  cursor: default;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
  padding-bottom: 0.4rem;
  position: relative;
  z-index: 1;
  transition: background 0.1s;
  -webkit-tap-highlight-color: transparent;
}

.piano.clickable .white-key {
  cursor: pointer;
}

.piano.clickable .white-key:hover:not(.active):not(.root) {
  background: var(--pk-white-h);
}

.piano.clickable .white-key:active {
  transform: scaleY(0.98);
  transform-origin: top center;
}

.white-key.active { background: var(--pk-white-active); }
.white-key.root   { background: var(--pk-white-root); }

.dim-inactive .white-key:not(.active):not(.root) { background: var(--pk-dim-w); }
.dim-inactive .white-key:not(.active):not(.root) .key-label { color: var(--pk-dim-w-lbl); }

/* Black keys */
.black-key {
  position: absolute;
  width: calc(60% / 7);
  height: 65%;
  top: 0;
  background: var(--pk-black);
  border: 1px solid var(--pk-black-bd);
  border-top: none;
  border-radius: 0 0 4px 4px;
  z-index: 2;
  cursor: default;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
  padding-bottom: 0.25rem;
  transition: background 0.1s;
  -webkit-tap-highlight-color: transparent;
}

.piano.clickable .black-key {
  cursor: pointer;
}

.piano.clickable .black-key:hover:not(.active):not(.root) {
  background: var(--pk-black-h);
}

.piano.clickable .black-key:active {
  transform: scaleY(0.97);
  transform-origin: top center;
}

.black-key.active { background: var(--pk-black-active); }
.black-key.root   { background: var(--pk-black-root); }

.dim-inactive .black-key:not(.active):not(.root) { background: var(--pk-dim-b); }
.dim-inactive .black-key:not(.active):not(.root) .key-label { color: var(--pk-dim-b-lbl); }

/* Key labels */
.key-label {
  font-size: 0.55rem;
  font-weight: 700;
  pointer-events: none;
  line-height: 1;
}

.white-key .key-label         { color: var(--pk-white-lbl); }
.white-key.active .key-label  { color: var(--pk-white-lbl-a); }
.white-key.root .key-label    { color: var(--pk-white-lbl-r); }

.black-key .key-label         { color: var(--pk-black-lbl); }
.black-key.active .key-label  { color: var(--pk-black-lbl-a); }
.black-key.root .key-label    { color: var(--pk-black-lbl-r); }
</style>
