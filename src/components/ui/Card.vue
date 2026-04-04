<script setup>
defineProps({
  title: { type: String, default: '' },
  subtitle: { type: String, default: '' },
  small: { type: Boolean, default: false },
})
</script>

<template>
  <div class="card" :class="{ 'card-sm': small }">
    <div v-if="$slots.header || title" class="card-header">
      <slot name="header">
        <div>
          <div v-if="title" class="card-title">{{ title }}</div>
          <div v-if="subtitle" class="card-subtitle">{{ subtitle }}</div>
        </div>
      </slot>
    </div>
    <div class="card-body">
      <slot />
    </div>
    <div v-if="$slots.footer" class="card-footer">
      <slot name="footer" />
    </div>
  </div>
</template>
