<script setup>
defineProps({
  steps:       { type: Array,  required: true },
  modelValue:  { type: Number, required: true },
})
const emit = defineEmits(['update:modelValue'])
</script>

<template>
  <div class="step-nav">
    <button
      v-for="(s, i) in steps"
      :key="i"
      class="step-btn"
      :class="{ active: modelValue === i, done: modelValue > i }"
      @click="emit('update:modelValue', i)"
    >
      <span class="step-num">{{ i + 1 }}</span>
      <span class="step-label">{{ s }}</span>
    </button>
  </div>
</template>
