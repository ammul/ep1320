<script setup>
import { ref, computed } from 'vue'
import { playNote, stopAllNotes } from '@/audio/audioEngine.js'
import NoteStripPicker from '@/components/ui/NoteStripPicker.vue'
import { LEARN_SCALES as SCALES } from '@/constants/scales.js'
import { SEMI_TO_NAME as CHROMATIC } from '@/constants/musicConstants.js'
const IS_SHARP  = new Set([1,3,6,8,10])

const scaleRoot        = ref(0)
const scaleIdx         = ref(0)
const scalePlayingNote = ref(null)

const scaleNotes = computed(() =>
  SCALES[scaleIdx.value].steps.map(s => (scaleRoot.value + s) % 12)
)

const scaleFullName = computed(() =>
  `${CHROMATIC[scaleRoot.value]} ${SCALES[scaleIdx.value].name}`
)

let _scaleTimers = []

function pickScaleRoot(i) {
  _scaleTimers.forEach(clearTimeout)
  _scaleTimers = []
  stopAllNotes()
  scalePlayingNote.value = null
  scaleRoot.value = i
}

function playScale() {
  _scaleTimers.forEach(clearTimeout)
  _scaleTimers = []
  scalePlayingNote.value = null
  const { steps } = SCALES[scaleIdx.value]
  steps.forEach((s, i) => {
    const noteIdx = (scaleRoot.value + s) % 12
    _scaleTimers.push(setTimeout(() => {
      scalePlayingNote.value = noteIdx
      playNote(60 + scaleRoot.value + s, 0.5)
    }, i * 280))
  })
  _scaleTimers.push(setTimeout(() => {
    scalePlayingNote.value = scaleRoot.value
    playNote(72 + scaleRoot.value, 0.8)
  }, steps.length * 280))
  _scaleTimers.push(setTimeout(() => {
    scalePlayingNote.value = null
  }, (steps.length + 1) * 280))
}
</script>

<template>
  <div class="step-content">
    <p class="step-intro">A <strong>scale</strong> is a fixed pattern of intervals repeating from a root. The Major scale uses the same intervals every time — that's why it always sounds the same no matter which root you pick. Pick a root, choose a scale, hear which notes light up.</p>

    <div class="picker-row">
      <span class="picker-label">Root</span>
      <NoteStripPicker
        small
        :from-index="scaleRoot"
        @note-down="pickScaleRoot"
      />
    </div>

    <div class="picker-row">
      <span class="picker-label">Scale</span>
      <div class="scale-tabs">
        <button
          v-for="(sc, si) in SCALES"
          :key="si"
          class="scale-tab"
          :class="{ active: scaleIdx === si }"
          @click="scaleIdx = si"
        >{{ sc.name }}</button>
      </div>
    </div>

    <div class="scale-display-legend">
      <span class="sdl-item sdl-root">Root</span>
      <span class="sdl-item sdl-scale">Scale</span>
    </div>

    <div class="scale-display">
      <div
        v-for="(note, i) in CHROMATIC"
        :key="i"
        class="scale-tile"
        :class="{
          active:   scaleNotes.includes(i),
          root:     i === scaleRoot,
          sharp:    IS_SHARP.has(i),
          playing:  scalePlayingNote === i,
        }"
        @pointerdown.prevent="playNote(60 + i)"
      >{{ note }}</div>
    </div>

    <div class="scale-meta">
      <span class="scale-name">{{ scaleFullName }}</span>
      <span class="scale-feel">{{ SCALES[scaleIdx].feel }}</span>
      <button class="play-scale-btn" @click="playScale">Play scale</button>
    </div>
  </div>
</template>
