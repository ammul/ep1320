<script setup>
const CHROMATIC = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B']
const IS_SHARP  = new Set([1,3,6,8,10])

defineProps({
  small: { type: Boolean, default: false },
  from:  { type: Number,  default: null  },
  to:    { type: Number,  default: null  },
})
const emit = defineEmits(['pick'])
</script>

<template>
  <div class="flex-wrap gap-2" :class="{ small }">
    <button
      v-for="(note, i) in CHROMATIC"
      :key="i"
      class="note-pill"
      :class="{ sharp: IS_SHARP.has(i), from: from === i, to: to === i }"
      @pointerdown.prevent="emit('pick', i)"
    >{{ note }}</button>
  </div>
</template>

<style scoped>
.small .note-pill { padding: 0.35rem 0.45rem; min-width: 2.1rem; font-size: 0.8rem; }
.note-pill {
  padding: 0.5rem 0.75rem; border-radius: 6px; border: 1px solid var(--border);
  background: var(--surface2); color: var(--text2); font-weight: 600; cursor: pointer;
}
.note-pill.sharp { background: var(--bg); border-color: var(--border2); }
.note-pill.from { background: var(--accent-bg); border-color: var(--accent); color: var(--accent-hi); }
.note-pill.to   { background: var(--accent-bg); border-color: var(--accent); box-shadow: 0 0 6px var(--accent-glow); }
</style>
