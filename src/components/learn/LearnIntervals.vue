<script setup>
import { ref, computed } from 'vue'
import { playNote, playChord } from '@/audio/audioEngine.js'
import { NOTE_TO_SEMI, SEMI_TO_NAME as CHROMATIC } from '@/constants/musicConstants.js'
import NoteStripPicker from '@/components/ui/NoteStripPicker.vue'
import { INTERVALS } from '@/constants/intervals.js'

const fromIdx         = ref(null)
const toIdx           = ref(null)
const selectedRefSemi = ref(null)

function pickNote(i) {
  if (fromIdx.value === null) {
    fromIdx.value = i
    playNote(60 + NOTE_TO_SEMI[i])
  } else if (toIdx.value === null && i !== fromIdx.value) {
    toIdx.value = i
    playChord([60 + NOTE_TO_SEMI[fromIdx.value], 60 + NOTE_TO_SEMI[i]])
  } else {
    fromIdx.value = i
    toIdx.value   = null
    playNote(60 + NOTE_TO_SEMI[i])
  }
}

function pickRefInterval(semi) {
  if (selectedRefSemi.value === semi) {
    selectedRefSemi.value = null
    fromIdx.value = null
    toIdx.value = null
  } else {
    selectedRefSemi.value = semi
    fromIdx.value = 0
    toIdx.value = semi
    playChord([60, 60 + semi])
  }
}

const intervalInfo = computed(() => {
  if (fromIdx.value !== null && toIdx.value !== null) {
    const semi = ((toIdx.value - fromIdx.value) + 12) % 12
    return INTERVALS.find(iv => iv.semi === semi) ?? null
  }
  if (selectedRefSemi.value !== null) {
    return INTERVALS.find(iv => iv.semi === selectedRefSemi.value) ?? null
  }
  return null
})
</script>

<template>
  <div class="step-content">
    <p class="step-intro">Tap any two notes - hear the sound and see the <strong>interval</strong> between them.</p>

    <NoteStripPicker
      :from-index="fromIdx"
      :to-index="toIdx"
      @note-down="pickNote"
    />

    <div class="interval-result">
      <template v-if="intervalInfo">
        <div class="iv-name">{{ intervalInfo.name }}</div>
        <div class="iv-semi">{{ intervalInfo.semi }} semitone{{ intervalInfo.semi !== 1 ? 's' : '' }}</div>
        <div class="iv-feel">{{ intervalInfo.feel }}</div>
        <div v-if="fromIdx !== null && toIdx !== null" class="iv-path">
          {{ CHROMATIC[fromIdx] }} → {{ CHROMATIC[toIdx] }}
        </div>
      </template>
      <template v-else-if="fromIdx !== null">
        <div class="iv-hint">Now pick a second note</div>
        <div class="iv-hint-sub">{{ CHROMATIC[fromIdx] }} selected</div>
      </template>
      <template v-else>
        <div class="iv-hint">Pick a starting note</div>
      </template>
    </div>

    <div class="iv-reference">
      <div class="ref-label">All intervals from root — tap to hear</div>
      <div class="ref-grid">
        <div v-for="iv in INTERVALS" :key="iv.semi" class="ref-item"
          :class="{ highlight: intervalInfo && intervalInfo.semi === iv.semi }"
          @click="pickRefInterval(iv.semi)">
          <span class="ref-semi">{{ iv.semi }}</span>
          <span class="ref-name">{{ iv.name }}</span>
        </div>
      </div>
    </div>

    <div class="step-bridge">
      Three intervals matter most: <strong>Minor 3rd</strong> (3 semitones), <strong>Major 3rd</strong> (4), and <strong>Perfect 5th</strong> (7). Stack a 3rd and a 5th above any root and you have a <strong>chord</strong>. Stack several chords in a row and you have a <strong>progression</strong>.
    </div>
  </div>
</template>
