<script setup>
import { computed } from 'vue'
import { PIANO_WHITE, PIANO_BLACK, NOTES } from '../musicConstants.js'

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
        @click="onToggle(key.noteIdx)"
      >
        <span class="key-label">{{ key.note }}</span>
      </button>

      <button
        v-for="key in blackKeys"
        :key="key.noteIdx"
        class="black-key"
        :class="{ active: key.isActive, root: key.isRoot }"
        :style="key.style"
        @click.stop="onToggle(key.noteIdx)"
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
  color: #a09080;
}

.octave-ctl label {
  font-weight: 600;
  color: #c8a96e;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-size: 0.8rem;
}

.octave-ctl button {
  width: 2rem;
  height: 2rem;
  border: 1px solid #4a4030;
  border-radius: 6px;
  background: #1a1714;
  color: #c8a96e;
  font-size: 1.1rem;
  cursor: pointer;
  line-height: 1;
  transition: background 0.15s, border-color 0.15s;
}

.octave-ctl button:hover {
  background: #2a2218;
  border-color: #c8a96e;
}

.octave-val {
  min-width: 1.5rem;
  text-align: center;
  font-size: 1.1rem;
  font-weight: 700;
  color: #e8dcc8;
}

/* Piano keyboard */
.piano {
  position: relative;
  display: flex;
  height: 120px;
  max-width: 420px;
  user-select: none;
}

/* White keys */
.white-key {
  flex: 1;
  height: 100%;
  background: #ddd5be;
  border: 1px solid #8a7850;
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
  background: #ece4d0;
}

.piano.clickable .white-key:active {
  transform: scaleY(0.98);
  transform-origin: top center;
}

.white-key.active { background: #c89420; }
.white-key.root   { background: #f0c020; }

.dim-inactive .white-key:not(.active):not(.root) { background: #7a7268; }
.dim-inactive .white-key:not(.active):not(.root) .key-label { color: #4a4438; }

/* Black keys */
.black-key {
  position: absolute;
  width: calc(60% / 7);
  height: 65%;
  top: 0;
  background: #1e1a14;
  border: 1px solid #0e0c08;
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
  background: #2e2820;
}

.piano.clickable .black-key:active {
  transform: scaleY(0.97);
  transform-origin: top center;
}

.black-key.active { background: #b07a10; }
.black-key.root   { background: #d49800; }

.dim-inactive .black-key:not(.active):not(.root) { background: #302c28; }
.dim-inactive .black-key:not(.active):not(.root) .key-label { color: #3a3430; }

/* Key labels */
.key-label {
  font-size: 0.55rem;
  font-weight: 700;
  pointer-events: none;
  line-height: 1;
}

.white-key .key-label         { color: #7a6848; }
.white-key.active .key-label  { color: #2a1400; }
.white-key.root .key-label    { color: #1a0a00; }

.black-key .key-label         { color: #5a4830; }
.black-key.active .key-label  { color: #1a0a00; }
.black-key.root .key-label    { color: #0a0600; }
</style>
