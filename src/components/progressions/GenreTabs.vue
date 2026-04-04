<script setup>
defineProps({
  genres: { type: Array, required: true },
  modelValue: { type: String, required: true },
})

defineEmits(['update:modelValue'])
</script>

<template>
  <div class="genre-filter">
    <button
      v-for="g in genres"
      :key="g.id"
      class="genre-btn"
      :class="{ active: modelValue === g.id }"
      @click="$emit('update:modelValue', g.id)"
    >{{ g.label }}</button>
  </div>
</template>

<style scoped>
.genre-filter {
  display: flex;
  gap: 0.35rem;
  flex-wrap: wrap;
  margin-bottom: 0.75rem;
}

.genre-btn {
  padding: 0.28rem 0.75rem;
  border-radius: 5px;
  border: 1px solid var(--border2);
  background: var(--input);
  color: var(--text3);
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.12s, border-color 0.12s, color 0.12s;
}

.genre-btn:hover  { border-color: var(--accent); color: var(--text); }
.genre-btn.active { background: var(--accent); border-color: var(--accent); color: var(--on-accent); }
</style>
