<script setup>
import { ref, watch } from 'vue'
import { pause as drumPause, isPlaying as drumIsPlaying } from '@/audio/drumEngine.js'
import LearnStepNav from '@/components/learn/LearnStepNav.vue'
import LearnRootNotes from '@/components/learn/LearnRootNotes.vue'
import LearnIntervals from '@/components/learn/LearnIntervals.vue'
import LearnScales from '@/components/learn/LearnScales.vue'
import LearnProgressions from '@/components/learn/LearnProgressions.vue'
import LearnChords from '@/components/learn/LearnChords.vue'
import LearnImprovising from '@/components/learn/LearnImprovising.vue'
import LearnBeats from '@/components/learn/LearnBeats.vue'
import LearnStepFooter from '@/components/learn/LearnStepFooter.vue'

const emit = defineEmits(['navigate'])

const STEPS = ['Root Notes', 'Intervals', 'Scales', 'Progressions', 'Chords', 'Improvising', 'Beats']
const step  = ref(0)

watch(step, (newStep, oldStep) => {
  if (oldStep === 6 && drumIsPlaying.value) drumPause()
})
</script>

<template>
  <div class="learn-mode">

    <LearnStepNav :steps="STEPS" :model-value="step" @update:model-value="step = $event" />

    <LearnRootNotes     v-if="step === 0" />
    <LearnIntervals     v-else-if="step === 1" />
    <LearnScales        v-else-if="step === 2" />
    <LearnProgressions  v-else-if="step === 3" />
    <LearnChords        v-else-if="step === 4" />
    <LearnImprovising   v-else-if="step === 5" />
    <LearnBeats         v-else-if="step === 6" @navigate="emit('navigate', $event)" />

    <LearnStepFooter
      :step="step"
      :total="STEPS.length"
      @prev="step--"
      @next="step++"
    />

  </div>
</template>

<style scoped>
.learn-mode {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

@media (max-width: 600px) {
  .learn-mode {
    padding: 1rem;
    gap: 1rem;
  }
}
</style>
