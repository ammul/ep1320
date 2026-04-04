<script setup>
defineProps({
  label: { type: String, required: true },
})
</script>

<template>
  <div class="picker-row">
    <span class="picker-label">{{ label }}</span>
    <div class="picker-control">
      <slot />
    </div>
  </div>
</template>
