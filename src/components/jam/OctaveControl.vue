<script setup>
const props = defineProps({
  modelValue: { type: Number, required: true },
  min: { type: Number, default: 1 },
  max: { type: Number, default: 7 },
})

const emit = defineEmits(['update:modelValue'])

function decrement() {
  if (props.modelValue > props.min) emit('update:modelValue', props.modelValue - 1)
}

function increment() {
  if (props.modelValue < props.max) emit('update:modelValue', props.modelValue + 1)
}
</script>

<script>
export default { name: 'OctaveControl' }
</script>

<template>
  <div class="octave-control">
    <button class="octave-btn" :disabled="modelValue <= min" @click="decrement" aria-label="Octave down">−</button>
    <span class="octave-value">{{ modelValue }}</span>
    <button class="octave-btn" :disabled="modelValue >= max" @click="increment" aria-label="Octave up">+</button>
  </div>
</template>

<style scoped>
.octave-control {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.octave-btn {
  width: 1.8rem;
  height: 1.8rem;
  border-radius: 50%;
  border: 1px solid var(--border2);
  background: var(--input);
  color: var(--text);
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  line-height: 1;
  transition: background 0.12s, border-color 0.12s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.octave-btn:hover:not(:disabled) { border-color: var(--accent); color: var(--accent); }
.octave-btn:disabled { opacity: 0.35; cursor: default; }

.octave-value {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text);
  min-width: 1.2rem;
  text-align: center;
}
</style>
