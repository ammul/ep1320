<script setup>
const props = defineProps({
  modelValue: { type: String, required: true },
  scales: { type: Array, required: true },
  showInfo: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue', 'update:showInfo'])

const selectedScale = computed(() => props.scales.find(s => s.id === props.modelValue))

function onSelectChange(e) {
  emit('update:modelValue', e.target.value)
  emit('update:showInfo', false)
}

function toggleInfo() {
  emit('update:showInfo', !props.showInfo)
}
</script>

<script>
import { computed } from 'vue'
export default { name: 'ScaleSelector' }
</script>

<template>
  <div class="scale-selector">
    <div class="scale-select-row">
      <select :value="modelValue" @change="onSelectChange">
        <option v-for="s in scales" :key="s.id" :value="s.id">{{ s.label }}</option>
      </select>
      <button class="info-btn" :class="{ active: showInfo }" @click="toggleInfo" aria-label="Scale info">i</button>
    </div>
    <p v-if="showInfo && selectedScale" class="scale-info">{{ selectedScale.description }}</p>
  </div>
</template>

<style scoped>
.scale-select-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.info-btn {
  width: 1.6rem;
  height: 1.6rem;
  border-radius: 50%;
  border: 1px solid var(--border2);
  background: var(--input);
  color: var(--text3);
  font-size: 0.8rem;
  font-style: italic;
  font-weight: 700;
  cursor: pointer;
  line-height: 1;
  flex-shrink: 0;
  transition: background 0.12s, border-color 0.12s, color 0.12s;
}

.info-btn:hover  { border-color: var(--accent); color: var(--text); }
.info-btn.active { background: var(--accent-bg); border-color: var(--accent); color: var(--accent); }

.scale-info {
  margin-top: 0.6rem;
  padding: 0.65rem 0.85rem;
  background: var(--input);
  border: 1px solid var(--border2);
  border-left: 3px solid var(--accent);
  border-radius: 6px;
  font-size: 0.82rem;
  color: var(--text2);
  line-height: 1.55;
  width: 100%;
}

select {
  background: var(--input);
  border: 1px solid var(--border2);
  border-radius: 6px;
  color: var(--text);
  padding: 0.4rem 0.8rem;
  font-size: 0.9rem;
  cursor: pointer;
  outline: none;
  max-width: 100%;
}

select:focus { border-color: var(--accent); }
</style>
