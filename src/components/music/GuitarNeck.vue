<script setup>
import { FRET_COUNT } from '@/constants/musicConstants.js'

defineProps({
  strings:   { type: Array, required: true },
  cellClass: { type: Function, default: () => ({}) },
})

const emit = defineEmits(['cell-down', 'cell-up'])
</script>

<template>
  <div class="guitar-neck-wrap">
    <div class="guitar-neck">
      <div v-for="string in strings" :key="string.stringIdx" class="neck-row">
        <div class="string-name">{{ string.name }}</div>
        <div
          v-for="cell in string.cells"
          :key="cell.fret"
          class="neck-cell"
          :class="[{ open: cell.isOpen }, cellClass(cell)]"
          @pointerdown.prevent="emit('cell-down', string.stringIdx, cell.fret, cell.noteIdx)"
          @pointerup="emit('cell-up', string.stringIdx, cell.fret)"
          @pointerleave="emit('cell-up', string.stringIdx, cell.fret)"
          @pointercancel="emit('cell-up', string.stringIdx, cell.fret)"
        >
          <slot name="cell" :cell="cell" />
        </div>
      </div>
      <div class="fret-numbers">
        <div class="string-name-spacer"></div>
        <div v-for="f in FRET_COUNT + 1" :key="f" class="fret-num">
          {{ f - 1 === 0 ? '' : f - 1 }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.guitar-neck-wrap {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.guitar-neck {
  display: flex;
  flex-direction: column;
  min-width: 380px;
}

.neck-row {
  display: flex;
  align-items: center;
  border-bottom: 1px solid var(--border3);
}

.string-name {
  width: 1.8rem;
  font-size: 0.7rem;
  color: var(--text4);
  font-weight: 600;
  text-align: right;
  padding-right: 0.5rem;
  flex-shrink: 0;
}

.neck-cell {
  flex: 1;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-right: 1px solid var(--border3);
  position: relative;
  user-select: none;
  touch-action: pan-x;
  cursor: pointer;
}

.neck-cell.open {
  border-right: 3px solid var(--border2);
}

.fret-numbers {
  display: flex;
  align-items: center;
  margin-top: 0.3rem;
}

.string-name-spacer {
  width: 1.8rem;
  flex-shrink: 0;
}

.fret-num {
  flex: 1;
  font-size: 0.6rem;
  color: var(--text5);
  text-align: center;
}
</style>
