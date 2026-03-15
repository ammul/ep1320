<script setup>
import { displayMode } from '../displayMode.js'
</script>

<template>
  <template v-if="displayMode === 'ep1320'"><slot name="ep1320" /></template>
  <template v-else-if="displayMode === 'notes'"><slot name="notes" /></template>
  <template v-else-if="displayMode === 'piano'"><slot name="piano" /></template>
  <template v-else><slot name="guitar" /></template>
</template>
