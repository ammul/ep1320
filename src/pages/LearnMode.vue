<script setup>
import { ref, computed, watch, onUnmounted } from 'vue'
import { playNote, playChord, stopAllNotes } from '../audio/audioEngine.js'
import { pattern as drumPattern, play as drumPlay, pause as drumPause, isPlaying as drumIsPlaying, currentStep as drumCurrentStep } from '../audio/drumEngine.js'
import NoteStrip from '../components/NoteStrip.vue'
import PickerRow from '../components/PickerRow.vue'
import PageHeader from '../components/PageHeader.vue'

import { LEARN_SCALES as SCALES } from '../constants/scales.js'

const emit = defineEmits(['navigate'])

const CHROMATIC = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B']
const IS_SHARP  = new Set([1,3,6,8,10])

const INTERVALS = [
  { semi: 1,  name: 'Minor 2nd',   feel: 'Tense, dissonant' },
  { semi: 2,  name: 'Major 2nd',   feel: 'Stepwise, melodic' },
  { semi: 3,  name: 'Minor 3rd',   feel: 'Dark, minor feel' },
  { semi: 4,  name: 'Major 3rd',   feel: 'Bright, major feel' },
  { semi: 5,  name: 'Perfect 4th', feel: 'Open, stable' },
  { semi: 6,  name: 'Tritone',     feel: 'Unstable, dramatic' },
  { semi: 7,  name: 'Perfect 5th', feel: 'Strong, powerful' },
  { semi: 8,  name: 'Minor 6th',   feel: 'Bittersweet' },
  { semi: 9,  name: 'Major 6th',   feel: 'Warm, uplifting' },
  { semi: 10, name: 'Minor 7th',   feel: 'Bluesy, unresolved' },
  { semi: 11, name: 'Major 7th',   feel: 'Dreamy, tense' },
]

const MAJOR_SCALE = [0,2,4,5,7,9,11]
const DIA_TYPES   = ['maj','min','min','maj','maj','min','dim']
const ROMAN       = ['I','ii','iii','IV','V','vi','vii°']
const CHORD_ITVS  = { maj:[0,4,7], min:[0,3,7], dim:[0,3,6] }

const PROGS = [
  { name:'I – V – vi – IV',  degIdx:[0,4,5,3], feel:'Pop anthem',  songs:'Let It Be · No Woman No Cry' },
  { name:'I – IV – V',       degIdx:[0,3,4],   feel:'Blues / rock', songs:'Johnny B. Goode · Wild Thing' },
  { name:'ii – V – I',       degIdx:[1,4,0],   feel:'Jazz',         songs:'Autumn Leaves · most standards' },
  { name:'I – vi – IV – V',  degIdx:[0,5,3,4], feel:'50s doo-wop', songs:'Stand By Me · Blue Moon' },
]

const CHORD_TYPES = [
  {
    chord: 'Major chord',
    def:   'Bright, resolved. Root + major 3rd (4 semitones) + 5th (7 semitones).',
    itvs:  [0, 4, 7],
    scales: [
      { name:'Major pentatonic', desc:'always safe' },
      { name:'Major scale',      desc:'full palette' },
      { name:'Mixolydian',       desc:'bluesy edge' },
    ],
  },
  {
    chord: 'Minor chord',
    def:   'Dark, emotional. Like major but the 3rd is flattened by one semitone (3 semitones).',
    itvs:  [0, 3, 7],
    scales: [
      { name:'Minor pentatonic', desc:'easy, no clashes' },
      { name:'Natural minor',    desc:'dark and expressive' },
      { name:'Dorian',           desc:'soulful minor' },
    ],
  },
  {
    chord: 'Dominant 7th',
    def:   'Tense, bluesy. A major chord with a flattened 7th (10 semitones) added — wants to resolve.',
    itvs:  [0, 4, 7, 10],
    scales: [
      { name:'Mixolydian',   desc:'natural match' },
      { name:'Blues scale',  desc:'gritty tension' },
    ],
  },
]

const BEAT_PATTERNS = [
  {
    name: 'Basic rock beat',
    desc: 'Kick on beats 1 and 3, snare on 2 and 4, hi-hat on every 8th note. The foundation of rock, pop, and almost everything else.',
    rows: [
      { name: 'Kick',   steps: [1,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0] },
      { name: 'Snare',  steps: [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0] },
      { name: 'Hi-Hat', steps: [1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0] },
    ],
  },
  {
    name: 'Four-on-the-floor',
    desc: 'Kick on every beat, open hi-hat on the offbeats. The backbone of house, techno, and dance music.',
    rows: [
      { name: 'Kick',   steps: [1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0] },
      { name: 'Snare',  steps: [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0] },
      { name: 'Hi-Hat', steps: [0,1,0,1, 0,1,0,1, 0,1,0,1, 0,1,0,1] },
    ],
  },
  {
    name: 'Syncopated kick',
    desc: 'Kick displaced off the beat adds forward motion and groove. Snare still holds down 2 and 4 as the anchor.',
    rows: [
      { name: 'Kick',   steps: [1,0,0,1, 0,0,1,0, 1,0,0,0, 0,1,0,0] },
      { name: 'Snare',  steps: [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0] },
      { name: 'Hi-Hat', steps: [1,1,1,1, 1,1,1,1, 1,1,1,1, 1,1,1,1] },
    ],
  },
]

const BEAT_TIPS = [
  { num: '1', text: 'The <strong>backbeat</strong> is everything. Snare on beats 2 and 4 is what makes music groove rather than march. Lock that in first.' },
  { num: '2', text: '<strong>Beats 1, 5, 9, 13</strong> in the drum computer are the four quarter-note beats of one bar. Kick and snare live here.' },
  { num: '3', text: '<strong>Hi-hats subdivide time.</strong> 8th notes (every other step) feel steady. 16th notes (every step) feel urgent. Offbeat 8ths feel bouncy.' },
  { num: '4', text: '<strong>Leave space.</strong> A kick on every 16th step is noise, not a beat. What you don\'t play shapes the groove as much as what you do.' },
]

const STEPS = [
  { id: 'root-notes',   label: 'Root Notes'   },
  { id: 'intervals',    label: 'Intervals'    },
  { id: 'scales',       label: 'Scales'       },
  { id: 'progressions', label: 'Progressions' },
  { id: 'chords',       label: 'Chords'       },
  { id: 'improvising',  label: 'Improvising'  },
  { id: 'beats',        label: 'Beats'        },
]
const step      = ref(STEPS[0].id)
const stepIndex = computed(() => STEPS.findIndex(s => s.id === step.value))

// ── Step 1: Root Notes ───────────────────────────────────────────────────────
const rootNoteIdx = ref(null)

function pickRootNote(i) {
  rootNoteIdx.value = i
  playNote(60 + i)
}

function playRootOctave() {
  if (rootNoteIdx.value === null) return
  playNote(60 + rootNoteIdx.value)
  setTimeout(() => playNote(72 + rootNoteIdx.value, 0.8), 550)
}

// ── Step 2: Intervals ────────────────────────────────────────────────────────
const fromIdx = ref(null)
const toIdx   = ref(null)

function pickNote(i) {
  if (fromIdx.value === null) {
    fromIdx.value = i
    playNote(60 + i)
  } else if (toIdx.value === null && i !== fromIdx.value) {
    toIdx.value = i
    playChord([60 + fromIdx.value, 60 + i])
  } else {
    fromIdx.value = i
    toIdx.value   = null
    playNote(60 + i)
  }
}

const selectedRefSemi = ref(null)

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

// ── Step 2: Scales ───────────────────────────────────────────────────────────
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

// ── Step 3: Progressions ─────────────────────────────────────────────────────
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

// ── Step 4: Chords ───────────────────────────────────────────────────────────
const chordsRoot = ref(0)

// ── Step 5: Improvising ──────────────────────────────────────────────────────
const improvChordIdx = ref(0)

const IMPROV_EXAMPLES = [
  {
    chordSemi: [0, 4, 7],
    goodNotes: [
      { semi: 2,  name: 'D',  why: 'Major 2nd — stepwise, bright' },
      { semi: 9,  name: 'A',  why: 'Major 6th — warm, uplifting' },
    ],
    badNotes: [
      { semi: 1,  name: 'C#', why: 'Minor 2nd — clashes immediately' },
      { semi: 3,  name: 'Eb', why: 'Minor 3rd — fights the major sound' },
    ],
  },
  {
    chordSemi: [0, 3, 7],
    goodNotes: [
      { semi: 3,  name: 'Eb', why: 'Minor 3rd — chord tone, dark' },
      { semi: 10, name: 'Bb', why: 'Minor 7th — Dorian/natural minor' },
    ],
    badNotes: [
      { semi: 4,  name: 'E',  why: 'Major 3rd — fights the minor 3rd' },
      { semi: 11, name: 'B',  why: 'Major 7th — ugly clash with Bb' },
    ],
  },
  {
    chordSemi: [0, 4, 7, 10],
    goodNotes: [
      { semi: 10, name: 'Bb', why: 'Minor 7th — the defining note' },
      { semi: 5,  name: 'F',  why: 'Perfect 4th — Mixolydian home' },
    ],
    badNotes: [
      { semi: 11, name: 'B',  why: 'Major 7th — contradicts the ♭7' },
      { semi: 6,  name: 'F#', why: 'Tritone — maximum tension' },
    ],
  },
]

function playImprovExample(chordSemis, noteSemi) {
  const root = 60
  playChord(chordSemis.map(s => root + s), 2.5)
  setTimeout(() => playNote(root + noteSemi, 2.0), 500)
}

function chordLabel(rootC, di) {
  const semi = (rootC + MAJOR_SCALE[di]) % 12
  const suf  = DIA_TYPES[di] === 'maj' ? '' : DIA_TYPES[di] === 'min' ? 'm' : '°'
  return CHROMATIC[semi] + suf
}

function chordMidis(rootC, di) {
  const semi = (rootC + MAJOR_SCALE[di]) % 12
  return CHORD_ITVS[DIA_TYPES[di]].map(i => 60 + semi + i)
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

// ── Step 5: Beats ────────────────────────────────────────────────────────────
const loadedPattern = ref(null)
const BEAT_INST_MAP = { 'Kick': 0, 'Snare': 1, 'Hi-Hat': 3 }

function buildDrumPattern(pi) {
  const newPattern = Array.from({ length: 9 }, () => new Array(16).fill(false))
  for (const row of BEAT_PATTERNS[pi].rows) {
    const instIdx = BEAT_INST_MAP[row.name]
    if (instIdx !== undefined) newPattern[instIdx] = row.steps.map(s => s === 1)
  }
  return newPattern
}

function loadBeat(pi) {
  if (drumIsPlaying.value) drumPause()
  if (loadedPattern.value === pi) {
    loadedPattern.value = null
    return
  }
  drumPattern.value = buildDrumPattern(pi)
  loadedPattern.value = pi
  drumPlay()
}

function editBeat(pi) {
  if (drumIsPlaying.value) drumPause()
  drumPattern.value = buildDrumPattern(pi)
  loadedPattern.value = pi
  emit('navigate', 'drums')
}

watch(step, (newStep, oldStep) => {
  if (oldStep === 'beats' && drumIsPlaying.value) drumPause()
})

onUnmounted(() => {
  if (drumIsPlaying.value) drumPause()
})
</script>

<template>
  <div class="learn-mode">

    <!-- Step navigation -->
    <div class="flex-wrap gap-2 mb-6" style="padding-bottom: 0.5rem; border-bottom: 1px solid var(--border)">
      <button
        v-for="(s, i) in STEPS"
        :key="s.id"
        class="step-btn flex items-center gap-2 p-2"
        :class="{ active: step === s.id, done: i < stepIndex }"
        :style="{
          opacity: step === s.id ? 1 : 0.4,
          border: step === s.id ? '1px solid var(--accent)' : '1px solid transparent',
          background: step === s.id ? 'var(--accent-bg)' : 'transparent',
          borderRadius: '6px'
        }"
        @click="step = s.id"
      >
        <span class="bubble" :style="{
          background: i < stepIndex ? 'var(--good-dim)' : (step === s.id ? 'var(--accent)' : 'var(--accent-bg)'),
          color: i < stepIndex ? 'white' : (step === s.id ? 'var(--bg)' : 'var(--accent)'),
          borderColor: i < stepIndex ? 'var(--good)' : 'var(--accent-mid)'
        }">{{ i + 1 }}</span>
        <span class="step-label text-tiny text-bold text-uppercase letter-spacing-wide hidden-mobile" style="display: var(--display-mobile-none)">{{ s.label }}</span>
      </button>
    </div>

    <!-- ── Step 1: Root Notes ────────────────────────────────────────────── -->
    <div v-if="step === 'root-notes'" class="flex-col gap-6">
      <p class="text-muted" style="line-height: 1.6">Every piece of music orbits a home note — the <strong>root</strong>. When a melody lands on it, it sounds resolved. When it moves away, it creates tension. Everything else — scales, chords, keys — is named and measured relative to this anchor.</p>

      <div class="flex-col gap-3">
        <p class="text-accent text-bold text-tiny text-uppercase letter-spacing-wide mb-1">Select a root</p>
        <NoteStrip :from="rootNoteIdx" @pick="pickRootNote" />
      </div>

      <div class="card flex items-center justify-between min-h-6" style="min-height: 6rem">
        <template v-if="rootNoteIdx !== null">
          <div class="flex-col">
            <p class="rr-name m-0 text-accent text-bold" style="font-size: 1.5rem">{{ CHROMATIC[rootNoteIdx] }}</p>
            <p class="m-0 text-muted text-tiny text-uppercase letter-spacing-wide">your root note</p>
          </div>
          <button class="rr-octave-btn btn primary text-tiny text-bold letter-spacing-wide" @click="playRootOctave">Hear it one octave up</button>
        </template>
        <template v-else>
          <div class="rr-hint text-muted text-bold">Tap any note to set your root</div>
        </template>
      </div>

      <div class="flex-col gap-2">
        <div v-for="fact in [
          { h: '12 notes', b: 'Western music uses 12 notes before the pattern repeats. The 7 natural notes (A B C D E F G) plus 5 sharps in between — the black keys on a piano.' },
          { h: 'Octaves', b: 'Every note repeats at double the frequency — same name, higher pitch. C and the C above it sound related because the higher one vibrates exactly twice as fast.' },
          { h: 'Keys', b: 'When someone says a song is in C major, C is the root. The root gives the key its name and is the note the music wants to return to.' }
        ]" :key="fact.h" class="card p-3">
          <p class="text-accent text-bold text-tiny text-uppercase letter-spacing-wide mb-1">{{ fact.h }}</p>
          <p class="text-muted text-small m-0" style="line-height: 1.55">{{ fact.b }}</p>
        </div>
      </div>

      <div class="card p-3" style="border-style: dashed">
        <p class="text-muted text-small m-0">Once you have a root, you can describe the <strong>distance</strong> to any other note. That distance is called an <strong>interval</strong>.</p>
      </div>
    </div>

    <!-- ── Step 2: Intervals ─────────────────────────────────────────────── -->
    <div v-if="step === 'intervals'" class="flex-col gap-6">
      <p class="text-muted" style="line-height: 1.6">Tap any two notes - hear the sound and see the <strong>interval</strong> between them.</p>

      <NoteStrip class="note-strip" :from="fromIdx" :to="toIdx" @pick="pickNote" />

      <div class="card flex items-center justify-between min-h-7" style="min-height: 7rem">
        <template v-if="intervalInfo">
          <div class="flex-col">
            <p class="iv-name m-0 text-accent text-bold" style="font-size: 1.5rem">{{ intervalInfo.name }}</p>
            <p class="m-0 text-muted text-tiny text-uppercase letter-spacing-wide">{{ intervalInfo.semi }} semitone{{ intervalInfo.semi !== 1 ? 's' : '' }}</p>
            <p class="m-0 text-small" style="margin-top: 0.2rem">{{ intervalInfo.feel }}</p>
          </div>
          <div v-if="fromIdx !== null && toIdx !== null" class="iv-path text-tiny text-dim text-bold letter-spacing-wide text-uppercase">
            {{ CHROMATIC[fromIdx] }} → {{ CHROMATIC[toIdx] }}
          </div>
        </template>
        <template v-else-if="fromIdx !== null">
          <div class="iv-hint text-muted text-bold">Now pick a second note</div>
        </template>
        <template v-else>
          <div class="iv-hint text-muted text-bold">Pick a starting note</div>
        </template>
      </div>

      <div class="flex-col gap-2">
        <p class="text-dim text-tiny text-bold text-uppercase letter-spacing-wide m-0">All intervals from root — tap to hear</p>
        <div class="flex-wrap gap-1">
          <button v-for="iv in INTERVALS" :key="iv.semi" class="ref-item btn text-tiny flex items-center gap-2"
            :class="{ highlight: intervalInfo && intervalInfo.semi === iv.semi, primary: intervalInfo && intervalInfo.semi === iv.semi }"
            style="padding: 0.25rem 0.5rem"
            @click="pickRefInterval(iv.semi)">
            <span class="text-bold" style="min-width: 0.8rem">{{ iv.semi }}</span>
            <span class="text-muted">{{ iv.name }}</span>
          </button>
        </div>
      </div>

      <div class="card p-3" style="border-style: dashed">
        <p class="text-muted text-small m-0">Three intervals matter most: <strong>Minor 3rd</strong> (3 semitones), <strong>Major 3rd</strong> (4), and <strong>Perfect 5th</strong> (7). Stack a 3rd and a 5th above any root and you have a <strong>chord</strong>. Stack several chords in a row and you have a <strong>progression</strong>.</p>
      </div>
    </div>

    <!-- ── Step 3: Scales ────────────────────────────────────────────────── -->
    <div v-if="step === 'scales'" class="flex-col gap-6">
      <p class="text-muted" style="line-height: 1.6">A <strong>scale</strong> is a fixed pattern of intervals repeating from a root. The Major scale uses the same intervals every time — that's why it always sounds the same no matter which root you pick. Pick a root, choose a scale, hear which notes light up.</p>

      <PickerRow label="Root">
        <NoteStrip small :from="scaleRoot" @pick="pickScaleRoot" />
      </PickerRow>

      <PickerRow label="Scale">
        <div class="flex-wrap gap-2">
          <button
            v-for="(sc, si) in SCALES"
            :key="si"
            class="scale-tab btn text-small"
            :class="{ primary: scaleIdx === si }"
            @click="scaleIdx = si"
          >{{ sc.name }}</button>
        </div>
      </PickerRow>

      <div class="flex items-center gap-4">
        <div class="flex items-center gap-1 text-tiny text-dim text-bold text-uppercase letter-spacing-wide">
          <span style="width: 0.75rem; height: 0.75rem; border-radius: 3px; background: var(--accent-bg); border: 1px solid var(--accent)"></span>
          Root
        </div>
        <div class="flex items-center gap-1 text-tiny text-dim text-bold text-uppercase letter-spacing-wide">
          <span style="width: 0.75rem; height: 0.75rem; border-radius: 3px; background: var(--raised); border: 1px solid var(--border2)"></span>
          Scale
        </div>
      </div>

      <div class="flex-wrap gap-2">
        <div
          v-for="(note, i) in CHROMATIC"
          :key="i"
          class="scale-tile tile"
          :class="{
            active:   scaleNotes.includes(i),
            root:     i === scaleRoot,
            sharp:    IS_SHARP.has(i),
            playing:  scalePlayingNote === i,
          }"
          @pointerdown.prevent="playNote(60 + i)"
        >{{ note }}</div>
      </div>

      <div class="card flex items-center justify-between gap-4">
        <div class="flex-col flex-1">
          <p class="m-0 text-accent text-bold" style="font-size: 1rem">{{ scaleFullName }}</p>
          <p class="m-0 text-muted text-small" style="line-height: 1.5">{{ SCALES[scaleIdx].feel }}</p>
        </div>
        <button class="btn primary text-tiny text-bold letter-spacing-wide" @click="playScale">Play scale</button>
      </div>
    </div>

    <!-- ── Step 4: Progressions ──────────────────────────────────────────── -->
    <div v-if="step === 'progressions'" class="flex-col gap-6">
      <p class="text-muted" style="line-height: 1.6">Chords are labelled with <strong>Roman numerals</strong> based on the scale they come from — every chord in a key uses only notes from that key's scale. That's why they all sound good together. Tap any chord to hear it, or tap a progression to play it.</p>

      <PickerRow label="Key">
        <NoteStrip small :from="progRoot" @pick="pickProgRoot" />
      </PickerRow>

      <div class="flex-col gap-2">
        <p class="text-accent text-bold text-tiny text-uppercase letter-spacing-wide m-0">Chords in key</p>
        <div class="flex-wrap gap-2">
          <button
            v-for="(roman, di) in ROMAN"
            :key="di"
            class="tile flex-col"
            style="min-width: 3.5rem; gap: 0.1rem; padding: 0.5rem 0.4rem"
            :class="{
              active: activeDegrees.has(di),
              playing: progActiveDeg === di,
            }"
            @pointerdown.prevent="tapDiatonic(di)"
          >
            <span class="text-tiny text-dim" style="font-size: 0.65rem">{{ roman }}</span>
            <span class="text-bold" :style="{ color: DIA_TYPES[di] === 'maj' ? 'var(--accent)' : (DIA_TYPES[di] === 'min' ? 'var(--accent-lo)' : 'var(--text3)') }">{{ chordLabel(progRoot, di) }}</span>
          </button>
        </div>
      </div>

      <div class="flex-col gap-2">
        <p class="text-accent text-bold text-tiny text-uppercase letter-spacing-wide m-0">Common progressions</p>
        <div class="list">
          <button
            v-for="(prog, pi) in PROGS"
            :key="pi"
            class="card card-hover text-left flex-col gap-2"
            :class="{ active: activeProg === pi }"
            style="padding: 0.75rem 1rem"
            @click="tapProg(pi)"
          >
            <div class="flex items-baseline gap-3">
              <span class="text-accent text-bold">{{ prog.name }}</span>
              <span class="text-dim text-tiny text-bold text-uppercase letter-spacing-wide">{{ prog.feel }}</span>
            </div>
            <div v-if="activeProg === pi" class="flex-col gap-2 mt-2">
              <div class="flex gap-2 flex-wrap">
                <span
                  v-for="(deg, ci) in prog.degIdx"
                  :key="ci"
                  class="chip"
                  :class="{ active: progActiveChordIdx === ci }"
                  :style="{ color: progActiveChordIdx === ci ? 'var(--accent-hi)' : (DIA_TYPES[deg] === 'min' ? 'var(--accent-lo)' : 'var(--accent)') }"
                >{{ chordLabel(progRoot, deg) }}</span>
              </div>
              <div class="text-dim text-tiny">{{ prog.songs }}</div>
            </div>
          </button>
        </div>
      </div>
    </div>

    <!-- ── Step 5: Chords ───────────────────────────────────────────────── -->
    <div v-if="step === 'chords'" class="flex-col gap-6">
      <p class="text-muted" style="line-height: 1.6">A <strong>chord</strong> is three or more notes played at once. Just three chord types are behind most of the music you know — they differ only by one note.</p>

      <PickerRow label="Root">
        <NoteStrip small :from="chordsRoot" @pick="chordsRoot = $event" />
      </PickerRow>

      <div class="list">
        <div v-for="ct in CHORD_TYPES" :key="ct.chord" class="card flex-col gap-3">
          <div class="flex items-start justify-between gap-4">
            <div class="flex-col gap-1 flex-1">
              <span class="text-accent text-bold" style="font-size: 1rem">{{ ct.chord }}</span>
              <span class="text-muted text-small" style="line-height: 1.5">{{ ct.def }}</span>
            </div>
            <button class="btn primary text-tiny text-bold letter-spacing-wide" @pointerdown.prevent="playChord(ct.itvs.map(s => 60 + chordsRoot + s))">Hear it</button>
          </div>
          <div class="flex gap-2">
            <span v-for="s in ct.itvs" :key="s" class="text-tiny text-dim text-bold text-uppercase letter-spacing-wide p-1" style="background: var(--input); border: 1px solid var(--border); border-radius: 4px">
              +{{ s }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Step 6: Improvising ───────────────────────────────────────────── -->
    <div v-if="step === 'improvising'" class="flex-col gap-6">
      <p class="text-muted" style="line-height: 1.6">Improvising is about choosing notes that sound <strong>intentional</strong>. The key: match your scale to the chord type you're playing over.</p>

      <div class="list">
        <div v-for="ct in CHORD_TYPES" :key="ct.chord" class="card flex-col gap-2">
          <span class="text-accent text-bold text-small">{{ ct.chord }}</span>
          <div class="flex-wrap gap-2">
            <span v-for="sc in ct.scales" :key="sc.name" class="flex-col gap-1 p-2 border-radius-6" style="background: var(--input); border: 1px solid var(--border2); border-radius: 6px">
              <span class="text-bold text-tiny">{{ sc.name }}</span>
              <span class="text-dim text-tiny" style="font-size: 0.65rem">{{ sc.desc }}</span>
            </span>
          </div>
        </div>
      </div>

      <div class="flex-col gap-3">
        <div v-for="tip in [
          { n: '1', t: 'Start with <strong>minor pentatonic</strong> — 5 notes, no clashes, works over almost anything minor.' },
          { n: '2', t: 'Land on <strong>chord tones</strong> (root, 3rd, 5th) — they resolve. Other notes work best as passing notes.' },
          { n: '3', t: '<strong>Rhythm beats note choice.</strong> One confident two-note groove sounds better than a hundred random pitches.' }
        ]" :key="tip.n" class="flex items-start gap-3">
          <span class="bubble">{{ tip.n }}</span>
          <span class="text-muted text-small" style="line-height: 1.5" v-html="tip.t"></span>
        </div>
      </div>

      <div class="card flex-col gap-4" style="background: var(--surface2)">
        <div class="flex items-baseline gap-2 flex-wrap">
          <span class="text-bold text-tiny text-uppercase letter-spacing-wide">Hear the difference</span>
          <span class="text-dim text-tiny">Chord plays first, then the note — all in C</span>
        </div>
        <div class="flex-wrap gap-2">
          <button
            v-for="(ct, i) in CHORD_TYPES"
            :key="ct.chord"
            class="btn text-tiny"
            :class="{ primary: improvChordIdx === i }"
            @click="improvChordIdx = i"
          >{{ ct.chord }}</button>
        </div>
        <div class="flex gap-4 mobile-flex-col">
          <div class="flex-col gap-2 flex-1">
            <div class="text-tiny text-bold text-uppercase letter-spacing-wide text-accent" style="color: var(--good)">Works well</div>
            <button
              v-for="n in IMPROV_EXAMPLES[improvChordIdx].goodNotes"
              :key="n.semi"
              class="card card-hover flex-col gap-1 text-left"
              style="padding: 0.5rem 0.75rem; border-left: 3px solid var(--good-dim)"
              @pointerdown.prevent="playImprovExample(IMPROV_EXAMPLES[improvChordIdx].chordSemi, n.semi)"
            >
              <span class="text-bold text-small">{{ n.name }}</span>
              <span class="text-dim text-tiny" style="line-height: 1.3">{{ n.why }}</span>
            </button>
          </div>
          <div class="flex-col gap-2 flex-1">
            <div class="text-tiny text-bold text-uppercase letter-spacing-wide" style="color: var(--bad)">Clashes</div>
            <button
              v-for="n in IMPROV_EXAMPLES[improvChordIdx].badNotes"
              :key="n.semi"
              class="card card-hover flex-col gap-1 text-left"
              style="padding: 0.5rem 0.75rem; border-left: 3px solid var(--bad-dim)"
              @pointerdown.prevent="playImprovExample(IMPROV_EXAMPLES[improvChordIdx].chordSemi, n.semi)"
            >
              <span class="text-bold text-small">{{ n.name }}</span>
              <span class="text-dim text-tiny" style="line-height: 1.3">{{ n.why }}</span>
            </button>
          </div>
        </div>
      </div>

      <div class="card p-3 text-center" style="border-style: dashed">
        <p class="text-muted text-small m-0">Try it in <strong>Jam Mode</strong> — pick a key and scale to see safe pads highlighted.</p>
      </div>
    </div>

    <!-- ── Step 7: Beats ─────────────────────────────────────────────────── -->
    <div v-if="step === 'beats'" class="flex-col gap-6">
      <p class="text-muted" style="line-height: 1.6">A good beat is built from three layers: <strong>kick</strong>, <strong>snare</strong>, and <strong>hi-hat</strong>. Each has a job. Together they create rhythm that makes people move.</p>

      <div class="card flex-col gap-4">
        <p class="text-accent text-bold text-tiny text-uppercase letter-spacing-wide m-0">The simplest beat that works</p>
        <div class="flex-col gap-3">
          <div v-for="step in [
            { n: '1', t: '<strong>Snare on beats 2 and 4.</strong> This is the backbeat — the most important rule in drumming. Get this right first, everything else is decoration.' },
            { n: '2', t: '<strong>Kick on beat 1.</strong> Add beat 3 for a rock feel, or only beat 1 for something more sparse. Experiment from there.' },
            { n: '3', t: '<strong>Hi-hat on every 8th note</strong> (every other step) for a steady groove. Move to every step for urgency, or just the offbeats for a bouncy feel.' }
          ]" :key="step.n" class="flex items-start gap-3">
            <span class="bubble">{{ step.n }}</span>
            <div class="text-muted text-small" style="line-height: 1.5" v-html="step.t"></div>
          </div>
        </div>
      </div>

      <div class="list">
        <div v-for="(pattern, pi) in BEAT_PATTERNS" :key="pattern.name" class="beat-pattern card flex-col gap-3">
          <div class="flex-col gap-2">
            <div class="flex items-center justify-between gap-4">
              <span class="text-accent text-bold">{{ pattern.name }}</span>
              <div class="flex gap-2">
                <button
                  class="bp-play-btn btn text-tiny text-bold"
                  :class="{ primary: loadedPattern === pi && drumIsPlaying }"
                  style="padding: 0.25rem 0.6rem"
                  @click="loadBeat(pi)"
                >{{ loadedPattern === pi && drumIsPlaying ? 'Stop' : 'Play' }}</button>
                <button class="bp-edit-btn btn text-tiny" style="padding: 0.25rem 0.6rem" @click="editBeat(pi)">Edit &rarr;</button>
              </div>
            </div>
            <p class="text-muted text-tiny m-0" style="line-height: 1.45">{{ pattern.desc }}</p>
          </div>
          <div class="flex-col gap-1 overflow-x-auto pb-2">
            <div class="flex items-center gap-1" style="min-width: 360px">
              <div style="width: 4rem"></div>
              <div v-for="b in 4" :key="b" class="flex-1 text-center text-tiny text-bold text-dim" style="color: var(--accent-mid)">{{ b }}</div>
            </div>
            <div v-for="row in pattern.rows" :key="row.name" class="flex items-center gap-1" style="min-width: 360px">
              <div class="text-tiny text-dim text-bold" style="width: 4rem">{{ row.name }}</div>
              <div
                v-for="(on, si) in row.steps"
                :key="si"
                class="flex-1"
                style="height: 1.5rem; border-radius: 3px; background: var(--input); border: 1px solid var(--border)"
                :style="{
                  background: (on === 1 ? (drumIsPlaying && loadedPattern === pi && si === drumCurrentStep ? 'var(--accent)' : 'var(--accent-bg)') : (drumIsPlaying && loadedPattern === pi && si === drumCurrentStep ? 'var(--border2)' : 'var(--input)')),
                  borderColor: (on === 1 ? (drumIsPlaying && loadedPattern === pi && si === drumCurrentStep ? 'var(--accent)' : 'var(--accent-mid)') : (drumIsPlaying && loadedPattern === pi && si === drumCurrentStep ? 'var(--accent)' : 'var(--border)')),
                  borderLeftWidth: si % 4 === 0 ? '2px' : '1px',
                  borderLeftColor: si % 4 === 0 ? (on === 1 ? 'var(--accent)' : 'var(--border2)') : (on === 1 ? 'var(--accent-mid)' : 'var(--border)')
                }"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <div class="flex-col gap-3">
        <div v-for="tip in BEAT_TIPS" :key="tip.num" class="flex items-start gap-3">
          <span class="bubble">{{ tip.num }}</span>
          <span class="text-muted text-small" style="line-height: 1.5" v-html="tip.text"></span>
        </div>
      </div>

      <button class="btn primary text-bold w-full" style="padding: 0.75rem 1rem" @click="emit('navigate', 'drums')">
        Build your own beat in the Drum Computer &rarr;
      </button>
    </div>

    <!-- Step footer -->
    <div class="step-footer">
      <button class="nav-btn btn" @click="step = STEPS[stepIndex - 1].id" :disabled="stepIndex === 0">← Back</button>
      <span class="step-counter text-tiny text-dim text-bold letter-spacing-wide">{{ stepIndex + 1 }} / {{ STEPS.length }}</span>
      <button class="nav-btn btn" @click="step = STEPS[stepIndex + 1].id" :disabled="stepIndex === STEPS.length - 1">Next →</button>
    </div>

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
  .learn-mode { padding: 1rem; gap: 1rem; }
  .hidden-mobile { display: none !important; }
}

@media (orientation: landscape) and (max-height: 500px) {
  .learn-mode { padding: 0.75rem 1rem; gap: 0.75rem; }
}
</style>
