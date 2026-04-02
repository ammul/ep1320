<script setup>
defineProps({ label: { type: String, required: true } })
</script>

<template>
  <div class="picker-row">
    <span class="picker-label">{{ label }}</span>
    <slot />
  </div>
</template>

<style scoped>
.picker-row {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}

.picker-label {
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--accent);
  text-transform: uppercase;
  letter-spacing: 0.07em;
  padding-top: 0.5rem;
  flex-shrink: 0;
  min-width: 2.5rem;
}
</style>
