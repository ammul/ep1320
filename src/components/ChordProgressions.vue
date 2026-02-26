<script setup>
import { ref, computed, watch } from 'vue'

const NOTES  = ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#']
const LABELS = ['.',  '0',  'i', '1', '2',  '3', '4',  '5', '6', '7',  '8', '9']
const SHARPS = new Set(['A#', 'C#', 'D#', 'F#', 'G#'])

const CHORD_TYPES = {
  maj:  [0, 4, 7],
  min:  [0, 3, 7],
  dim:  [0, 3, 6],
  aug:  [0, 4, 8],
  dom7: [0, 4, 7, 10],
  maj7: [0, 4, 7, 11],
  min7: [0, 3, 7, 10],
  sus4: [0, 5, 7],
}

const CHORD_SUFFIX = {
  maj: '', min: 'm', dim: '°', aug: '+',
  dom7: '7', maj7: 'maj7', min7: 'm7', sus4: 'sus4',
}

const PROGRESSIONS = {
  major: [
    {
      id: 'I-V-vi-IV',
      label: 'I – V – vi – IV',
      description: 'Pop / rock workhorse (Let It Be, No Woman No Cry, …)',
      chords: [
        { degree: 0, type: 'maj', numeral: 'I' },
        { degree: 7, type: 'maj', numeral: 'V' },
        { degree: 9, type: 'min', numeral: 'vi' },
        { degree: 5, type: 'maj', numeral: 'IV' },
      ],
    },
    {
      id: 'I-IV-V',
      label: 'I – IV – V',
      description: '12-bar blues foundation',
      chords: [
        { degree: 0, type: 'maj', numeral: 'I' },
        { degree: 5, type: 'maj', numeral: 'IV' },
        { degree: 7, type: 'maj', numeral: 'V' },
      ],
    },
    {
      id: 'I-vi-IV-V',
      label: 'I – vi – IV – V',
      description: '50s doo-wop (Stand By Me, Every Breath You Take, …)',
      chords: [
        { degree: 0, type: 'maj', numeral: 'I' },
        { degree: 9, type: 'min', numeral: 'vi' },
        { degree: 5, type: 'maj', numeral: 'IV' },
        { degree: 7, type: 'maj', numeral: 'V' },
      ],
    },
    {
      id: 'ii-V-I',
      label: 'ii⁷ – V⁷ – Imaj7',
      description: 'Jazz turnaround',
      chords: [
        { degree: 2, type: 'min7', numeral: 'ii⁷' },
        { degree: 7, type: 'dom7', numeral: 'V⁷' },
        { degree: 0, type: 'maj7', numeral: 'Imaj7' },
      ],
    },
    {
      id: 'I-V-vi-iii-IV',
      label: 'I – V – vi – iii – IV',
      description: 'Canon in D (Pachelbel)',
      chords: [
        { degree: 0, type: 'maj', numeral: 'I' },
        { degree: 7, type: 'maj', numeral: 'V' },
        { degree: 9, type: 'min', numeral: 'vi' },
        { degree: 4, type: 'min', numeral: 'iii' },
        { degree: 5, type: 'maj', numeral: 'IV' },
      ],
    },
    {
      id: 'I-IV-I-V',
      label: 'I – IV – I – V',
      description: 'Country / folk cadence',
      chords: [
        { degree: 0, type: 'maj', numeral: 'I' },
        { degree: 5, type: 'maj', numeral: 'IV' },
        { degree: 0, type: 'maj', numeral: 'I' },
        { degree: 7, type: 'maj', numeral: 'V' },
      ],
    },
  ],
  minor: [
    {
      id: 'i-VI-III-VII',
      label: 'i – VI – III – VII',
      description: 'Minor pop / anthemic rock (Stairway, Smells Like Teen Spirit, …)',
      chords: [
        { degree: 0,  type: 'min', numeral: 'i' },
        { degree: 8,  type: 'maj', numeral: 'VI' },
        { degree: 3,  type: 'maj', numeral: 'III' },
        { degree: 10, type: 'maj', numeral: 'VII' },
      ],
    },
    {
      id: 'i-VII-VI-VII',
      label: 'i – VII – VI – V',
      description: 'Andalusian cadence (flamenco / Andalusian)',
      chords: [
        { degree: 0,  type: 'min', numeral: 'i' },
        { degree: 10, type: 'maj', numeral: 'VII' },
        { degree: 8,  type: 'maj', numeral: 'VI' },
        { degree: 7,  type: 'maj', numeral: 'V' },
      ],
    },
    {
      id: 'i-iv-V',
      label: 'i – iv – V',
      description: 'Harmonic minor cadence',
      chords: [
        { degree: 0, type: 'min', numeral: 'i' },
        { degree: 5, type: 'min', numeral: 'iv' },
        { degree: 7, type: 'maj', numeral: 'V' },
      ],
    },
    {
      id: 'i-VI-VII',
      label: 'i – VI – VII',
      description: 'Dark rock loop (Fly Away, Smoke on the Water feel)',
      chords: [
        { degree: 0,  type: 'min', numeral: 'i' },
        { degree: 8,  type: 'maj', numeral: 'VI' },
        { degree: 10, type: 'maj', numeral: 'VII' },
      ],
    },
    {
      id: 'i-iv-i-V',
      label: 'i – iv – i – V',
      description: 'Tango / flamenco',
      chords: [
        { degree: 0, type: 'min', numeral: 'i' },
        { degree: 5, type: 'min', numeral: 'iv' },
        { degree: 0, type: 'min', numeral: 'i' },
        { degree: 7, type: 'maj', numeral: 'V' },
      ],
    },
    {
      id: 'ii-dim-V-i',
      label: 'ii° – V⁷ – i',
      description: 'Jazz minor turnaround',
      chords: [
        { degree: 2, type: 'dim',  numeral: 'ii°' },
        { degree: 7, type: 'dom7', numeral: 'V⁷' },
        { degree: 0, type: 'min',  numeral: 'i' },
      ],
    },
  ],
}

const selectedRoot     = ref('A')
const mode             = ref('major')
const progressionId    = ref('I-V-vi-IV')
const activeChordIndex = ref(0)

const progressions = computed(() => PROGRESSIONS[mode.value])

const selectedProgression = computed(
  () => progressions.value.find(p => p.id === progressionId.value) ?? progressions.value[0]
)

watch(mode, () => {
  progressionId.value = progressions.value[0].id
  activeChordIndex.value = 0
})

watch(progressionId, () => { activeChordIndex.value = 0 })

const rootIndex = computed(() => NOTES.indexOf(selectedRoot.value))

function chordName(degree, type) {
  const root = NOTES[(rootIndex.value + degree) % 12]
  return root + CHORD_SUFFIX[type]
}

function chordPadIndices(degree, type) {
  const root = (rootIndex.value + degree) % 12
  return new Set(CHORD_TYPES[type].map(i => (root + i) % 12))
}

function buildRows(activeSet, rootPad) {
  const pads = NOTES.map((note, i) => ({
    label: LABELS[i],
    note,
    isSharp: SHARPS.has(note),
    isActive: activeSet.has(i),
    isRoot: i === rootPad,
  }))
  return [
    pads.slice(9, 12),
    pads.slice(6, 9),
    pads.slice(3, 6),
    pads.slice(0, 3),
  ]
}

const chordCards = computed(() =>
  selectedProgression.value.chords.map((chord, idx) => {
    const chordRootPad = (rootIndex.value + chord.degree) % 12
    const padIndices   = chordPadIndices(chord.degree, chord.type)
    const pressLabels  = [...padIndices].sort((a, b) => a - b).map(i => LABELS[i])
    return {
      idx,
      numeral:     chord.numeral,
      name:        chordName(chord.degree, chord.type),
      rows:        buildRows(padIndices, chordRootPad),
      pressLabels,
    }
  })
)

function handleKey(e) {
  if (e.key === 'ArrowRight') {
    activeChordIndex.value = (activeChordIndex.value + 1) % chordCards.value.length
    e.preventDefault()
  } else if (e.key === 'ArrowLeft') {
    activeChordIndex.value =
      (activeChordIndex.value - 1 + chordCards.value.length) % chordCards.value.length
    e.preventDefault()
  }
}
</script>

<template>
  <div class="chord-prog" tabindex="0" @keydown="handleKey">
    <div class="chord-prog-header">
      <h2>Chord Progressions</h2>
      <p class="subtitle">multi-pad chords for claves mode · click or ← → to step through</p>
    </div>

    <div class="controls">
      <div class="control-group">
        <label>Key</label>
        <div class="note-picker">
          <button
            v-for="note in NOTES"
            :key="note"
            :class="{ active: selectedRoot === note, sharp: SHARPS.has(note) }"
            @click="selectedRoot = note"
          >{{ note }}</button>
        </div>
      </div>

      <div class="control-group">
        <label>Mode</label>
        <div class="mode-toggle">
          <button :class="{ active: mode === 'major' }" @click="mode = 'major'">Major</button>
          <button :class="{ active: mode === 'minor' }" @click="mode = 'minor'">Minor</button>
        </div>
      </div>

      <div class="control-group">
        <label>Progression</label>
        <select v-model="progressionId">
          <option v-for="p in progressions" :key="p.id" :value="p.id">{{ p.label }}</option>
        </select>
      </div>
    </div>

    <p class="prog-description">{{ selectedProgression.description }}</p>

    <div class="chord-row">
      <div
        v-for="card in chordCards"
        :key="card.idx"
        class="chord-card"
        :class="{ active: card.idx === activeChordIndex }"
        @click="activeChordIndex = card.idx"
      >
        <div class="chord-numeral">{{ card.numeral }}</div>
        <div class="chord-name">{{ card.name }}</div>

        <div class="mini-grid">
          <div class="mini-row" v-for="(row, ri) in card.rows" :key="ri">
            <div
              v-for="pad in row"
              :key="pad.label"
              class="mini-pad"
              :class="{
                active: pad.isActive,
                root: pad.isRoot,
                sharp: pad.isSharp,
                inactive: !pad.isActive,
              }"
            >
              <span class="mini-label">{{ pad.label }}</span>
              <span class="mini-note" v-if="pad.isActive">{{ pad.note }}</span>
            </div>
          </div>
        </div>

        <div class="press-labels">
          <span class="press-hint">press</span>
          <span v-for="lbl in card.pressLabels" :key="lbl" class="press-badge">{{ lbl }}</span>
        </div>
      </div>
    </div>

    <div class="step-dots">
      <span
        v-for="(card, i) in chordCards"
        :key="i"
        class="dot"
        :class="{ active: i === activeChordIndex }"
        @click="activeChordIndex = i"
      />
    </div>
  </div>
</template>

<style scoped>
.chord-prog {
  background: #242019;
  border: 1px solid #3a3228;
  border-radius: 12px;
  padding: 2rem;
  outline: none;
}

.chord-prog-header h2 {
  font-size: 1.4rem;
  color: #c8a96e;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.subtitle {
  margin-top: 0.3rem;
  font-size: 0.85rem;
  color: #7a6f60;
}

/* Controls */
.controls {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  margin: 1.5rem 0 1rem;
}

.control-group {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.control-group label {
  font-weight: 600;
  color: #c8a96e;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-size: 0.8rem;
  min-width: 5rem;
}

.note-picker {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.note-picker button {
  padding: 0.3rem 0.6rem;
  border-radius: 5px;
  border: 1px solid #4a4030;
  background: #1e1c18;
  color: #a09080;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  min-width: 2.4rem;
  text-align: center;
  transition: background 0.12s, border-color 0.12s, color 0.12s;
}

.note-picker button.sharp { background: #161412; color: #7a6f60; }
.note-picker button:hover  { border-color: #c8a96e; color: #e8dcc8; }
.note-picker button.active { background: #c8a96e; border-color: #c8a96e; color: #1a1714; }

.mode-toggle {
  display: flex;
  gap: 0.35rem;
}

.mode-toggle button {
  padding: 0.3rem 0.9rem;
  border-radius: 5px;
  border: 1px solid #4a4030;
  background: #1e1c18;
  color: #a09080;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.12s, border-color 0.12s, color 0.12s;
}

.mode-toggle button:hover  { border-color: #c8a96e; color: #e8dcc8; }
.mode-toggle button.active { background: #c8a96e; border-color: #c8a96e; color: #1a1714; }

select {
  background: #1e1c18;
  border: 1px solid #4a4030;
  border-radius: 6px;
  color: #e8dcc8;
  padding: 0.4rem 0.8rem;
  font-size: 0.9rem;
  cursor: pointer;
  outline: none;
  max-width: 100%;
}

select:focus { border-color: #c8a96e; }

.prog-description {
  font-size: 0.82rem;
  color: #7a6f60;
  margin-bottom: 1.5rem;
  font-style: italic;
}

/* Chord row */
.chord-row {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.chord-card {
  flex: 1 1 120px;
  max-width: 160px;
  background: #1e1c18;
  border: 1px solid #3a3228;
  border-radius: 8px;
  padding: 0.75rem 0.6rem;
  cursor: pointer;
  transition: border-color 0.15s, box-shadow 0.15s, background 0.15s;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;
}

.chord-card:hover {
  background: #252219;
  border-color: #6a5a30;
}

.chord-card.active {
  border-color: #c8a96e;
  background: #2a2318;
  box-shadow: 0 0 0 1px #c8a96e44;
}

.chord-numeral {
  font-size: 0.7rem;
  color: #6a5a40;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.chord-name {
  font-size: 1.1rem;
  font-weight: 700;
  color: #c8a96e;
  line-height: 1;
}

.chord-card.active .chord-name { color: #f0c87a; }

/* Mini grid */
.mini-grid {
  display: flex;
  flex-direction: column;
  gap: 3px;
  margin: 0.25rem 0;
}

.mini-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 3px;
}

.mini-pad {
  width: 36px;
  height: 36px;
  border-radius: 4px;
  border: 1px solid #2e2820;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1px;
  transition: background 0.12s;
}

.mini-pad.inactive { background: #1a1714; opacity: 0.3; }
.mini-pad.active   { background: #2e2820; border-color: #6a5a30; }
.mini-pad.root     { background: #3a2e10; border-color: #c8a96e; }

.mini-label {
  font-size: 0.6rem;
  font-weight: 700;
  color: #4a4030;
  line-height: 1;
}

.mini-pad.active .mini-label { color: #8a7850; }
.mini-pad.root   .mini-label { color: #c8a96e; }

.mini-note {
  font-size: 0.62rem;
  font-weight: 700;
  line-height: 1;
  color: #c8a96e;
}

.mini-pad.root .mini-note { color: #f0c87a; }

/* Press labels */
.press-labels {
  display: flex;
  align-items: center;
  gap: 3px;
  flex-wrap: wrap;
  justify-content: center;
}

.press-hint {
  font-size: 0.65rem;
  color: #4a4030;
  margin-right: 2px;
}

.press-badge {
  background: #2e2820;
  border: 1px solid #4a4030;
  border-radius: 3px;
  padding: 1px 5px;
  font-size: 0.7rem;
  font-weight: 700;
  color: #c8a96e;
}

/* Step dots */
.step-dots {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1.25rem;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #3a3228;
  cursor: pointer;
  transition: background 0.15s;
}

.dot:hover  { background: #6a5a30; }
.dot.active { background: #c8a96e; }

@media (max-width: 600px) {
  .chord-prog {
    padding: 1.25rem 1rem;
  }

  .control-group {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .control-group label {
    min-width: unset;
  }

  .chord-card {
    flex: 1 1 calc(50% - 0.375rem);
    max-width: calc(50% - 0.375rem);
  }

  .mini-pad {
    width: 30px;
    height: 30px;
  }
}
</style>
