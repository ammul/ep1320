<script setup>
import { displayMode } from '@/state/displayMode.js'
</script>

<template>
  <template v-if="displayMode === 'pad'"><slot name="pad" /></template>
  <template v-else-if="displayMode === 'notes'"><slot name="notes" /></template>
  <template v-else-if="displayMode === 'piano'"><slot name="piano" /></template>
  <template v-else><slot name="guitar" /></template>
</template>
