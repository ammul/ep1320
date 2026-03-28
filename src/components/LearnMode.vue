<script setup>
import { ref, computed } from 'vue'
import { playNote, playChord } from '../audioEngine.js'

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

const SCALES = [
  { name: 'Major',         steps: [0,2,4,5,7,9,11], feel: 'Bright and resolved' },
  { name: 'Natural Minor', steps: [0,2,3,5,7,8,10], feel: 'Dark and emotional' },
  { name: 'Minor Pent.',   steps: [0,3,5,7,10],      feel: '5 notes — easy to improvise over' },
  { name: 'Major Pent.',   steps: [0,2,4,7,9],       feel: '5 notes — always sounds positive' },
  { name: 'Dorian',        steps: [0,2,3,5,7,9,10],  feel: 'Soulful, funky minor' },
  { name: 'Mixolydian',    steps: [0,2,4,5,7,9,10],  feel: 'Bluesy, rock feel' },
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

const IMPROV = [
  { chord:'Major chord',   color:'#c8a96e', scales:[
    { name:'Major pentatonic', desc:'always safe' },
    { name:'Major scale',      desc:'full palette' },
    { name:'Mixolydian',       desc:'bluesy edge' },
  ]},
  { chord:'Minor chord',   color:'#8a7a9e', scales:[
    { name:'Minor pentatonic', desc:'easy, no clashes' },
    { name:'Natural minor',    desc:'dark and expressive' },
    { name:'Dorian',           desc:'soulful minor' },
  ]},
  { chord:'Dominant 7th',  color:'#9e7a5a', scales:[
    { name:'Mixolydian',       desc:'natural match' },
    { name:'Blues scale',      desc:'gritty tension' },
  ]},
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

const STEPS = ['Intervals', 'Scales', 'Progressions', 'Improvising', 'Beats']
const step  = ref(0)

// ── Step 1: Intervals ────────────────────────────────────────────────────────
const fromIdx = ref(null)
const toIdx   = ref(null)

function pickNote(i) {
  playNote(60 + i)
  if (fromIdx.value === null) {
    fromIdx.value = i
  } else if (toIdx.value === null && i !== fromIdx.value) {
    toIdx.value = i
  } else {
    fromIdx.value = i
    toIdx.value   = null
  }
}

const intervalInfo = computed(() => {
  if (fromIdx.value === null || toIdx.value === null) return null
  const semi = ((toIdx.value - fromIdx.value) + 12) % 12
  return INTERVALS.find(iv => iv.semi === semi) ?? null
})

// ── Step 2: Scales ───────────────────────────────────────────────────────────
const scaleRoot = ref(0)
const scaleIdx  = ref(0)

const scaleNotes = computed(() =>
  SCALES[scaleIdx.value].steps.map(s => (scaleRoot.value + s) % 12)
)

function pickScaleRoot(i) {
  scaleRoot.value = i
  playNote(60 + i)
}

function playScale() {
  const { steps } = SCALES[scaleIdx.value]
  steps.forEach((s, i) =>
    setTimeout(() => playNote(60 + scaleRoot.value + s, 0.5), i * 190)
  )
  setTimeout(() => playNote(72 + scaleRoot.value, 0.8), steps.length * 190)
}

// ── Step 3: Progressions ─────────────────────────────────────────────────────
const progRoot   = ref(0)
const activeProg = ref(null)
let   _progTimers = []

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
  activeProg.value = activeProg.value === pi ? null : pi
  if (activeProg.value === null) return
  PROGS[pi].degIdx.forEach((deg, i) => {
    _progTimers.push(
      setTimeout(() => playChord(chordMidis(progRoot.value, deg), 0.9), i * 900)
    )
  })
}

const activeDegrees = computed(() =>
  activeProg.value === null ? new Set() : new Set(PROGS[activeProg.value].degIdx)
)
</script>

<template>
  <div class="learn-mode">

    <!-- Step navigation -->
    <div class="step-nav">
      <button
        v-for="(s, i) in STEPS"
        :key="i"
        class="step-btn"
        :class="{ active: step === i, done: step > i }"
        @click="step = i"
      >
        <span class="step-num">{{ i + 1 }}</span>
        <span class="step-label">{{ s }}</span>
      </button>
    </div>

    <!-- ── Step 1: Intervals ─────────────────────────────────────────────── -->
    <div v-if="step === 0" class="step-content">
      <p class="step-intro">Tap any two notes — hear the sound and see the <strong>interval</strong> between them.</p>

      <div class="note-strip">
        <button
          v-for="(note, i) in CHROMATIC"
          :key="i"
          class="note-pill"
          :class="{
            sharp:  IS_SHARP.has(i),
            from:   fromIdx === i,
            to:     toIdx === i,
          }"
          @pointerdown.prevent="pickNote(i)"
        >{{ note }}</button>
      </div>

      <div class="interval-result">
        <template v-if="intervalInfo">
          <div class="iv-name">{{ intervalInfo.name }}</div>
          <div class="iv-semi">{{ intervalInfo.semi }} semitone{{ intervalInfo.semi !== 1 ? 's' : '' }}</div>
          <div class="iv-feel">{{ intervalInfo.feel }}</div>
          <div class="iv-path">
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
        <div class="ref-label">All intervals from root</div>
        <div class="ref-grid">
          <div v-for="iv in INTERVALS" :key="iv.semi" class="ref-item"
            :class="{ highlight: intervalInfo && intervalInfo.semi === iv.semi }">
            <span class="ref-semi">{{ iv.semi }}</span>
            <span class="ref-name">{{ iv.name }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Step 2: Scales ────────────────────────────────────────────────── -->
    <div v-if="step === 1" class="step-content">
      <p class="step-intro">A <strong>scale</strong> is a set of notes that all sound good together. Pick a root, choose a scale — hear which notes light up.</p>

      <div class="picker-row">
        <span class="picker-label">Root</span>
        <div class="note-strip small">
          <button
            v-for="(note, i) in CHROMATIC"
            :key="i"
            class="note-pill"
            :class="{ sharp: IS_SHARP.has(i), from: scaleRoot === i }"
            @pointerdown.prevent="pickScaleRoot(i)"
          >{{ note }}</button>
        </div>
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

      <div class="scale-display">
        <div
          v-for="(note, i) in CHROMATIC"
          :key="i"
          class="scale-tile"
          :class="{
            active: scaleNotes.includes(i),
            root:   i === scaleRoot,
            sharp:  IS_SHARP.has(i),
          }"
          @pointerdown.prevent="playNote(60 + i)"
        >{{ note }}</div>
      </div>

      <div class="scale-meta">
        <span class="scale-feel">{{ SCALES[scaleIdx].feel }}</span>
        <button class="play-scale-btn" @click="playScale">Play scale</button>
      </div>
    </div>

    <!-- ── Step 3: Progressions ──────────────────────────────────────────── -->
    <div v-if="step === 2" class="step-content">
      <p class="step-intro">Chords are labelled with <strong>Roman numerals</strong> based on the scale they come from. Tap any chord to hear it, or tap a progression to play it.</p>

      <div class="picker-row">
        <span class="picker-label">Key</span>
        <div class="note-strip small">
          <button
            v-for="(note, i) in CHROMATIC"
            :key="i"
            class="note-pill"
            :class="{ sharp: IS_SHARP.has(i), from: progRoot === i }"
            @pointerdown.prevent="progRoot = i; activeProg = null; playNote(60 + i)"
          >{{ note }}</button>
        </div>
      </div>

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
          }"
          @pointerdown.prevent="tapDiatonic(di)"
        >
          <span class="dc-roman">{{ roman }}</span>
          <span class="dc-name">{{ chordLabel(progRoot, di) }}</span>
        </button>
      </div>

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
                v-for="deg in prog.degIdx"
                :key="deg"
                class="prog-chord-pill"
                :class="DIA_TYPES[deg]"
              >{{ chordLabel(progRoot, deg) }}</span>
            </div>
            <div class="prog-songs">{{ prog.songs }}</div>
          </div>
        </button>
      </div>
    </div>

    <!-- ── Step 4: Improvising ───────────────────────────────────────────── -->
    <div v-if="step === 3" class="step-content">
      <p class="step-intro">Improvising is about choosing notes that sound <strong>intentional</strong>. The key: match your scale to the chord type.</p>

      <div class="improv-grid">
        <div
          v-for="card in IMPROV"
          :key="card.chord"
          class="improv-card"
          :style="{ '--card-color': card.color }"
        >
          <div class="ic-chord">{{ card.chord }}</div>
          <div class="ic-scales">
            <div v-for="sc in card.scales" :key="sc.name" class="ic-scale">
              <span class="ic-name">{{ sc.name }}</span>
              <span class="ic-desc">{{ sc.desc }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="tips">
        <div class="tip">
          <span class="tip-num">1</span>
          <span>Start with <strong>minor pentatonic</strong> — 5 notes, no clashes, works over almost anything minor.</span>
        </div>
        <div class="tip">
          <span class="tip-num">2</span>
          <span>Land on <strong>chord tones</strong> (root, 3rd, 5th) — they resolve. Other notes work best as passing notes.</span>
        </div>
        <div class="tip">
          <span class="tip-num">3</span>
          <span><strong>Rhythm beats note choice.</strong> One confident two-note groove sounds better than a hundred random pitches.</span>
        </div>
      </div>

      <div class="improv-cta">
        Try it in <strong>Jam Mode</strong> — pick a key and scale to see safe pads highlighted.
      </div>
    </div>

    <!-- ── Step 5: Beats ─────────────────────────────────────────────────── -->
    <div v-if="step === 4" class="step-content">
      <p class="step-intro">A good beat is built from three layers: <strong>kick</strong>, <strong>snare</strong>, and <strong>hi-hat</strong>. Each has a job. Together they create rhythm that makes people move.</p>

      <div class="beat-patterns">
        <div v-for="pattern in BEAT_PATTERNS" :key="pattern.name" class="beat-pattern">
          <div class="bp-header">
            <span class="bp-name">{{ pattern.name }}</span>
            <span class="bp-desc">{{ pattern.desc }}</span>
          </div>
          <div class="bp-grid">
            <div class="bp-beat-nums">
              <div class="bp-inst-spacer"></div>
              <div v-for="b in 4" :key="b" class="bp-beat-num">{{ b }}</div>
            </div>
            <div v-for="row in pattern.rows" :key="row.name" class="bp-row">
              <div class="bp-inst">{{ row.name }}</div>
              <div
                v-for="(on, si) in row.steps"
                :key="si"
                class="bp-cell"
                :class="{
                  on:         on === 1,
                  'beat-1':   si % 4 === 0,
                }"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <div class="beat-tips">
        <div v-for="tip in BEAT_TIPS" :key="tip.num" class="tip">
          <span class="tip-num">{{ tip.num }}</span>
          <span v-html="tip.text"></span>
        </div>
      </div>

      <button class="beat-cta" @click="emit('navigate', 'drums')">
        Build your own beat in the Drum Computer &rarr;
      </button>
    </div>

    <!-- Step footer -->
    <div class="step-footer">
      <button class="nav-btn" @click="step--" :disabled="step === 0">← Back</button>
      <span class="step-counter">{{ step + 1 }} / {{ STEPS.length }}</span>
      <button class="nav-btn" @click="step++" :disabled="step === STEPS.length - 1">Next →</button>
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
  gap: 1.25rem;
}

/* ── Step navigation ──────────────────────────────────────────────────────── */
.step-nav {
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
}

.step-btn {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.45rem 0.75rem;
  border-radius: 20px;
  border: 1px solid var(--border2);
  background: transparent;
  color: var(--text3);
  font-family: inherit;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s, color 0.15s;
  letter-spacing: 0.03em;
}

.step-btn:hover {
  border-color: var(--accent-mid);
  color: var(--text2);
}

.step-btn.active {
  background: var(--accent-bg);
  border-color: var(--accent);
  color: var(--accent);
}

.step-btn.done {
  color: var(--accent-mid);
  border-color: var(--border2);
}

.step-num {
  width: 1.2rem;
  height: 1.2rem;
  border-radius: 50%;
  background: var(--border2);
  color: var(--text3);
  font-size: 0.72rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.step-btn.active .step-num {
  background: var(--accent);
  color: var(--bg);
}

.step-btn.done .step-num {
  background: var(--accent-mid);
  color: var(--bg);
}

/* ── Step content ─────────────────────────────────────────────────────────── */
.step-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.step-intro {
  font-size: 0.87rem;
  color: var(--text2);
  line-height: 1.6;
  margin: 0;
}

.step-intro strong {
  color: var(--accent);
  font-weight: 600;
}

/* ── Note strip ───────────────────────────────────────────────────────────── */
.note-strip {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.note-pill {
  padding: 0.45rem 0.55rem;
  min-width: 2.4rem;
  border-radius: 6px;
  border: 1px solid var(--border2);
  background: var(--raised);
  color: var(--accent);
  font-size: 0.88rem;
  font-weight: 700;
  font-family: inherit;
  cursor: pointer;
  text-align: center;
  user-select: none;
  touch-action: none;
  transition: background 0.1s, border-color 0.1s, transform 0.07s;
  -webkit-tap-highlight-color: transparent;
}

.note-pill:hover { background: var(--border); }
.note-pill:active { transform: scale(0.93); }
.note-pill.sharp { background: var(--input); color: var(--accent-lo); font-size: 0.8rem; }
.note-pill.sharp:hover { background: var(--border3); }

.note-pill.from {
  background: var(--accent);
  border-color: var(--accent);
  color: var(--bg);
}

.note-pill.to {
  background: var(--selected);
  border-color: var(--accent);
  color: var(--accent-hi);
  box-shadow: 0 0 6px var(--accent-glow);
}

/* ── Interval result ──────────────────────────────────────────────────────── */
.interval-result {
  min-height: 7rem;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  gap: 0.3rem;
  padding: 1rem;
  background: var(--raised);
  border: 1px solid var(--border2);
  border-radius: 10px;
}

.iv-name {
  font-size: clamp(1.5rem, 6vw, 2.2rem);
  font-weight: 700;
  color: var(--accent);
  line-height: 1;
  letter-spacing: 0.02em;
}

.iv-semi {
  font-size: 0.82rem;
  color: var(--accent-mid);
  font-weight: 600;
  letter-spacing: 0.05em;
}

.iv-feel {
  font-size: 0.88rem;
  color: var(--text2);
}

.iv-path {
  font-size: 0.78rem;
  color: var(--text4);
  margin-top: 0.2rem;
  letter-spacing: 0.05em;
}

.iv-hint {
  font-size: 1rem;
  color: var(--text3);
  font-weight: 600;
}

.iv-hint-sub {
  font-size: 0.82rem;
  color: var(--accent-mid);
}

/* ── Interval reference ───────────────────────────────────────────────────── */
.iv-reference {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.ref-label {
  font-size: 0.72rem;
  color: var(--text4);
  text-transform: uppercase;
  letter-spacing: 0.07em;
  font-weight: 600;
}

.ref-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
}

.ref-item {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  border: 1px solid var(--border);
  background: var(--input);
  font-size: 0.75rem;
  transition: border-color 0.15s;
}

.ref-item.highlight {
  border-color: var(--accent);
  background: var(--accent-bg);
}

.ref-semi {
  color: var(--accent-mid);
  font-weight: 700;
  font-size: 0.7rem;
  min-width: 0.8rem;
}

.ref-name {
  color: var(--text3);
}

.ref-item.highlight .ref-semi { color: var(--accent); }
.ref-item.highlight .ref-name { color: var(--text2); }

/* ── Picker row ───────────────────────────────────────────────────────────── */
.picker-row {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}

.picker-label {
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--accent);
  text-transform: uppercase;
  letter-spacing: 0.07em;
  padding-top: 0.5rem;
  flex-shrink: 0;
  min-width: 2.5rem;
}

/* ── Scale tabs ───────────────────────────────────────────────────────────── */
.scale-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.scale-tab {
  padding: 0.35rem 0.7rem;
  border-radius: 5px;
  border: 1px solid var(--border2);
  background: transparent;
  color: var(--text3);
  font-size: 0.8rem;
  font-family: inherit;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.12s, color 0.12s, border-color 0.12s;
}

.scale-tab:hover { background: var(--raised); color: var(--text2); }
.scale-tab.active {
  background: var(--accent-bg);
  border-color: var(--accent);
  color: var(--accent);
}

/* ── Scale display ────────────────────────────────────────────────────────── */
.scale-display {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.scale-tile {
  min-width: 2.8rem;
  padding: 0.6rem 0.4rem;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: var(--input);
  color: var(--text5);
  font-size: 0.82rem;
  font-weight: 600;
  text-align: center;
  transition: background 0.15s, border-color 0.15s, color 0.15s;
  user-select: none;
  touch-action: none;
  cursor: pointer;
}

.scale-tile.active {
  background: var(--raised);
  border-color: var(--border2);
  color: var(--text2);
}

.scale-tile.root {
  background: var(--accent-bg);
  border-color: var(--accent);
  color: var(--accent);
  font-size: 0.9rem;
}

.scale-tile.sharp { font-size: 0.75rem; }
.scale-tile.active.sharp { color: var(--text3); }
.scale-tile.root.sharp { color: var(--accent); font-size: 0.82rem; }

.scale-meta {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.scale-feel {
  font-size: 0.85rem;
  color: var(--text3);
  flex: 1;
}

.play-scale-btn {
  padding: 0.4rem 1rem;
  border-radius: 6px;
  border: 1px solid var(--accent-mid);
  background: transparent;
  color: var(--accent);
  font-size: 0.82rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  letter-spacing: 0.04em;
  transition: background 0.15s, border-color 0.15s;
  flex-shrink: 0;
}

.play-scale-btn:hover {
  background: var(--accent-bg);
  border-color: var(--accent);
}

/* ── Diatonic row ─────────────────────────────────────────────────────────── */
.diatonic-row {
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
}

.diatonic-chord {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.2rem;
  padding: 0.55rem 0.5rem;
  min-width: 3.2rem;
  border-radius: 7px;
  border: 1px solid var(--border2);
  background: var(--raised);
  cursor: pointer;
  font-family: inherit;
  user-select: none;
  touch-action: none;
  transition: background 0.12s, border-color 0.12s, transform 0.08s;
  -webkit-tap-highlight-color: transparent;
}

.diatonic-chord:hover { background: var(--border); }
.diatonic-chord:active { transform: scale(0.94); }

.diatonic-chord.highlight {
  background: var(--selected);
  border-color: var(--accent);
  box-shadow: 0 0 6px var(--accent-glow);
}

.diatonic-chord.min { border-color: var(--border); }
.diatonic-chord.dim { opacity: 0.7; }

.dc-roman {
  font-size: 0.68rem;
  color: var(--text4);
  font-weight: 700;
  letter-spacing: 0.03em;
}

.dc-name {
  font-size: 0.88rem;
  font-weight: 700;
  color: var(--accent);
  line-height: 1;
}

.diatonic-chord.min .dc-name { color: var(--accent-lo); }
.diatonic-chord.dim .dc-name { color: var(--text3); }
.diatonic-chord.highlight .dc-roman { color: var(--accent-mid); }
.diatonic-chord.highlight .dc-name { color: var(--accent-hi); }

/* ── Progression list ─────────────────────────────────────────────────────── */
.prog-list {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.prog-item {
  width: 100%;
  text-align: left;
  padding: 0.65rem 0.85rem;
  border-radius: 8px;
  border: 1px solid var(--border2);
  background: var(--raised);
  cursor: pointer;
  font-family: inherit;
  transition: border-color 0.12s, background 0.12s;
  -webkit-tap-highlight-color: transparent;
}

.prog-item:hover { background: var(--border); }

.prog-item.active {
  border-color: var(--accent);
  background: var(--accent-bg);
}

.prog-top {
  display: flex;
  align-items: baseline;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.prog-name {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--accent);
  letter-spacing: 0.02em;
}

.prog-feel {
  font-size: 0.78rem;
  color: var(--text4);
}

.prog-bottom {
  margin-top: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.prog-chords {
  display: flex;
  gap: 0.35rem;
  flex-wrap: wrap;
}

.prog-chord-pill {
  padding: 0.2rem 0.55rem;
  border-radius: 4px;
  font-size: 0.82rem;
  font-weight: 700;
  background: var(--input);
  color: var(--accent);
  border: 1px solid var(--border2);
}

.prog-chord-pill.min { color: var(--accent-lo); }
.prog-chord-pill.dim { color: var(--text3); }

.prog-songs {
  font-size: 0.76rem;
  color: var(--text4);
  letter-spacing: 0.02em;
}

/* ── Improv grid ──────────────────────────────────────────────────────────── */
.improv-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.6rem;
}

.improv-card {
  border-radius: 8px;
  border: 1px solid var(--border2);
  background: var(--raised);
  overflow: hidden;
}

.ic-chord {
  padding: 0.55rem 0.7rem;
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--card-color);
  border-bottom: 1px solid var(--border);
  letter-spacing: 0.03em;
}

.ic-scales {
  padding: 0.5rem 0.7rem;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.ic-scale {
  display: flex;
  flex-direction: column;
  gap: 0.05rem;
}

.ic-name {
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--text2);
}

.ic-desc {
  font-size: 0.7rem;
  color: var(--text4);
}

/* ── Tips ─────────────────────────────────────────────────────────────────── */
.tips {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.tip {
  display: flex;
  align-items: flex-start;
  gap: 0.65rem;
  font-size: 0.85rem;
  color: var(--text2);
  line-height: 1.5;
}

.tip strong { color: var(--accent); font-weight: 600; }

.tip-num {
  flex-shrink: 0;
  width: 1.4rem;
  height: 1.4rem;
  border-radius: 50%;
  background: var(--accent-bg);
  border: 1px solid var(--accent-mid);
  color: var(--accent);
  font-size: 0.72rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 0.1rem;
}

.improv-cta {
  padding: 0.7rem 1rem;
  border-radius: 8px;
  border: 1px dashed var(--border2);
  font-size: 0.83rem;
  color: var(--text3);
  text-align: center;
}

.improv-cta strong { color: var(--accent); }

/* ── Step footer ──────────────────────────────────────────────────────────── */
.step-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding-top: 0.25rem;
  border-top: 1px solid var(--border);
}

.nav-btn {
  padding: 0.4rem 0.9rem;
  border-radius: 6px;
  border: 1px solid var(--border2);
  background: transparent;
  color: var(--text3);
  font-size: 0.82rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  letter-spacing: 0.03em;
  transition: color 0.15s, border-color 0.15s, background 0.15s;
}

.nav-btn:hover:not(:disabled) {
  color: var(--accent);
  border-color: var(--accent-mid);
  background: var(--accent-bg);
}

.nav-btn:disabled {
  opacity: 0.25;
  cursor: default;
}

.step-counter {
  font-size: 0.78rem;
  color: var(--text4);
  letter-spacing: 0.05em;
}

/* ── Beats ────────────────────────────────────────────────────────────────── */
.beat-patterns {
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
}

.beat-pattern {
  background: var(--raised);
  border: 1px solid var(--border2);
  border-radius: 10px;
  padding: 0.85rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.bp-header {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.bp-name {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--accent);
  letter-spacing: 0.02em;
}

.bp-desc {
  font-size: 0.78rem;
  color: var(--text3);
  line-height: 1.45;
}

.bp-grid {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.bp-beat-nums,
.bp-row {
  display: grid;
  grid-template-columns: 4rem repeat(16, 1fr);
  gap: 0.15rem;
  min-width: 360px;
}

.bp-inst-spacer { }

.bp-beat-num {
  font-size: 0.6rem;
  color: var(--accent-mid);
  font-weight: 700;
  text-align: center;
  padding: 0.1rem 0;
  grid-column: span 4;
}

.bp-inst {
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--text4);
  display: flex;
  align-items: center;
}

.bp-cell {
  height: 1.5rem;
  border-radius: 3px;
  background: var(--input);
  border: 1px solid var(--border);
  transition: background 0.1s;
}

.bp-cell.beat-1 {
  border-left: 2px solid var(--border2);
}

.bp-cell.on {
  background: var(--accent-bg);
  border-color: var(--accent-mid);
}

.bp-cell.on.beat-1 {
  border-left-color: var(--accent);
  background: var(--accent-bg);
}

.beat-tips {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.beat-cta {
  display: block;
  width: 100%;
  text-align: center;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  border: 1px solid var(--accent-mid);
  background: transparent;
  color: var(--accent);
  font-size: 0.85rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  letter-spacing: 0.03em;
  transition: background 0.15s, border-color 0.15s;
}

.beat-cta:hover {
  background: var(--accent-bg);
  border-color: var(--accent);
}

/* ── Responsive ───────────────────────────────────────────────────────────── */
@media (max-width: 600px) {
  .learn-mode {
    padding: 1rem;
    gap: 1rem;
  }

  .improv-grid {
    grid-template-columns: 1fr;
  }

  .diatonic-row {
    gap: 0.3rem;
  }

  .diatonic-chord {
    min-width: 2.6rem;
    padding: 0.45rem 0.35rem;
  }
}

@media (orientation: landscape) and (max-height: 500px) {
  .learn-mode {
    padding: 0.75rem 1rem;
    gap: 0.75rem;
  }

  .step-label {
    display: none;
  }

  .improv-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>
