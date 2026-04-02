<script setup>
defineProps({
  title:    { type: String, required: true },
  subtitle: { type: String, default: '' },
})
</script>

<template>
  <div class="section-header">
    <div class="flex-1">
      <h2>{{ title }}</h2>
      <p v-if="subtitle" class="subtitle">{{ subtitle }}</p>
    </div>
    <slot />
  </div>
</template>

<style scoped>
@media (orientation: landscape) and (max-height: 500px) {
  .section-header h2 { font-size: 1.1rem; }
  .section-header .subtitle { display: none; }
}
</style>
