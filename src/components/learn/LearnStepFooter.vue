<script setup>
const props = defineProps({
  step:  { type: Number, required: true },
  total: { type: Number, required: true },
})

const emit = defineEmits(['prev', 'next'])
</script>

<template>
  <div class="step-footer">
    <button class="nav-btn" @click="emit('prev')" :disabled="step === 0">← Back</button>
    <span class="step-counter">{{ step + 1 }} / {{ total }}</span>
    <button class="nav-btn" @click="emit('next')" :disabled="step === total - 1">Next →</button>
  </div>
</template>

<style scoped>
.step-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding-top: 0.25rem;
  border-top: 1px solid var(--border);
}

.nav-btn {
  padding: 0.4rem 0.9rem;
  border-radius: 6px;
  border: 1px solid var(--border2);
  background: transparent;
  color: var(--text3);
  font-size: 0.82rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  letter-spacing: 0.03em;
  transition: color 0.15s, border-color 0.15s, background 0.15s;
}

.nav-btn:hover:not(:disabled) {
  color: var(--accent);
  border-color: var(--accent-mid);
  background: var(--accent-bg);
}

.nav-btn:disabled {
  opacity: 0.25;
  cursor: default;
}

.step-counter {
  font-size: 0.78rem;
  color: var(--text4);
  letter-spacing: 0.05em;
}
</style>
