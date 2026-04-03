<script setup>
import { NOTES, SHARPS } from '@/constants/musicConstants.js'

const props = defineProps({
  modelValue: { type: Number, default: null },
  highlightSet: { type: Set, default: () => new Set() },
  fromIndex: { type: Number, default: null },
  toIndex: { type: Number, default: null },
  small: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue', 'note-down'])

function onNoteDown(index) {
  if (props.disabled) return
  emit('note-down', index)
  emit('update:modelValue', index)
}
</script>

<template>
  <div class="note-strip" :class="{ small, disabled }">
    <button
      v-for="(note, i) in NOTES"
      :key="i"
      type="button"
      class="note-pill"
      :class="{
        sharp: SHARPS.has(note),
        selected: modelValue === i,
        highlight: highlightSet.has(i),
        from: fromIndex === i,
        to: toIndex === i,
      }"
      :disabled="disabled"
      @pointerdown.prevent="onNoteDown(i)"
    >
      {{ note }}
    </button>
  </div>
</template>
