<script setup>
import { ref, computed } from 'vue'
import { playChord, stopAllNotes } from '@/audio/audioEngine.js'
import NoteStripPicker from '@/components/ui/NoteStripPicker.vue'
import { LEARN_PROGS as PROGS } from '@/constants/progressions.js'
import { SEMI_TO_NAME as CHROMATIC, CHORD_TYPES } from '@/constants/musicConstants.js'

const MAJOR_SCALE = [0,2,4,5,7,9,11]
const DIA_TYPES   = ['maj','min','min','maj','maj','min','dim']
const ROMAN       = ['I','ii','iii','IV','V','vi','vii°']

const progRoot           = ref(0)
const activeProg         = ref(null)
const progActiveChordIdx = ref(null)
let   _progTimers        = []

function pickProgRoot(i) {
  _progTimers.forEach(clearTimeout)
  _progTimers = []
  stopAllNotes()
  progRoot.value           = i
  activeProg.value         = null
  progActiveChordIdx.value = null
}

function chordLabel(rootC, di) {
  const semi = (rootC + MAJOR_SCALE[di]) % 12
  const suf  = DIA_TYPES[di] === 'maj' ? '' : DIA_TYPES[di] === 'min' ? 'm' : '°'
  return CHROMATIC[semi] + suf
}

function chordMidis(rootC, di) {
  const semi = (rootC + MAJOR_SCALE[di]) % 12
  return CHORD_TYPES[DIA_TYPES[di]].map(i => 60 + semi + i)
}

function tapDiatonic(di) {
  playChord(chordMidis(progRoot.value, di))
}

function tapProg(pi) {
  _progTimers.forEach(clearTimeout)
  _progTimers = []
  progActiveChordIdx.value = null
  activeProg.value = activeProg.value === pi ? null : pi
  if (activeProg.value === null) return
  PROGS[pi].degIdx.forEach((deg, i) => {
    _progTimers.push(
      setTimeout(() => {
        progActiveChordIdx.value = i
        playChord(chordMidis(progRoot.value, deg), 0.9)
      }, i * 900)
    )
  })
  _progTimers.push(
    setTimeout(() => { progActiveChordIdx.value = null }, PROGS[pi].degIdx.length * 900)
  )
}

const activeDegrees = computed(() =>
  activeProg.value === null ? new Set() : new Set(PROGS[activeProg.value].degIdx)
)

const progActiveDeg = computed(() =>
  activeProg.value !== null && progActiveChordIdx.value !== null
    ? PROGS[activeProg.value].degIdx[progActiveChordIdx.value]
    : null
)
</script>

<template>
  <div class="step-content">
    <p class="step-intro">Chords are labelled with <strong>Roman numerals</strong> based on the scale they come from — every chord in a key uses only notes from that key's scale. That's why they all sound good together. Tap any chord to hear it, or tap a progression to play it.</p>

    <div class="picker-row">
      <span class="picker-label">Key</span>
      <NoteStripPicker
        small
        :from-index="progRoot"
        @note-down="pickProgRoot"
      />
    </div>

    <div class="section-label">Chords in key</div>

    <div class="diatonic-row">
      <button
        v-for="(roman, di) in ROMAN"
        :key="di"
        class="diatonic-chord"
        :class="{
          maj:       DIA_TYPES[di] === 'maj',
          min:       DIA_TYPES[di] === 'min',
          dim:       DIA_TYPES[di] === 'dim',
          highlight: activeDegrees.has(di),
          playing:   progActiveDeg === di,
        }"
        @pointerdown.prevent="tapDiatonic(di)"
      >
        <span class="dc-roman">{{ roman }}</span>
        <span class="dc-name">{{ chordLabel(progRoot, di) }}</span>
      </button>
    </div>

    <div class="section-label">Common progressions</div>

    <div class="prog-list">
      <button
        v-for="(prog, pi) in PROGS"
        :key="pi"
        class="prog-item"
        :class="{ active: activeProg === pi }"
        @click="tapProg(pi)"
      >
        <div class="prog-top">
          <span class="prog-name">{{ prog.name }}</span>
          <span class="prog-feel">{{ prog.feel }}</span>
        </div>
        <div v-if="activeProg === pi" class="prog-bottom">
          <div class="prog-chords">
            <span
              v-for="(deg, ci) in prog.degIdx"
              :key="ci"
              class="prog-chord-pill"
              :class="[DIA_TYPES[deg], { playing: progActiveChordIdx === ci }]"
            >{{ chordLabel(progRoot, deg) }}</span>
          </div>
          <div class="prog-songs">{{ prog.songs }}</div>
        </div>
      </button>
    </div>
  </div>
</template>
