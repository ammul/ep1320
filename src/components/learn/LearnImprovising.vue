<script setup>
import { ref } from 'vue'
import { playNote, playChord } from '@/audio/audioEngine.js'
import { IMPROV_CHORD_TYPES as CHORD_TYPES, IMPROV_EXAMPLES } from '@/constants/chordTypes.js'

const improvChordIdx = ref(0)

function playImprovExample(chordSemis, noteSemi) {
  const root = 60
  playChord(chordSemis.map(s => root + s), 2.5)
  setTimeout(() => playNote(root + noteSemi, 2.0), 500)
}
</script>

<template>
  <div class="step-content">
    <p class="step-intro">Improvising is about choosing notes that sound <strong>intentional</strong>. The key: match your scale to the chord type you're playing over.</p>

    <div class="improv-list">
      <div v-for="ct in CHORD_TYPES" :key="ct.chord" class="improv-item">
        <span class="improv-chord-name">{{ ct.chord }}</span>
        <div class="improv-scales">
          <span v-for="sc in ct.scales" :key="sc.name" class="improv-scale-pill">
            <span class="isp-name">{{ sc.name }}</span>
            <span class="isp-desc">{{ sc.desc }}</span>
          </span>
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

    <div class="improv-examples">
      <div class="ie-header">
        <span class="ie-title">Hear the difference</span>
        <span class="ie-subtitle">Chord plays first, then the note — all in C</span>
      </div>
      <div class="ie-chord-picker">
        <button
          v-for="(ct, i) in CHORD_TYPES"
          :key="ct.chord"
          class="ie-chord-btn"
          :class="{ active: improvChordIdx === i }"
          @click="improvChordIdx = i"
        >{{ ct.chord }}</button>
      </div>
      <div class="ie-columns">
        <div class="ie-col">
          <div class="ie-col-label good">Works well</div>
          <button
            v-for="n in IMPROV_EXAMPLES[improvChordIdx].goodNotes"
            :key="n.semi"
            class="ie-note-btn good"
            @pointerdown.prevent="playImprovExample(IMPROV_EXAMPLES[improvChordIdx].chordSemi, n.semi)"
          >
            <span class="ie-note-name">{{ n.name }}</span>
            <span class="ie-note-why">{{ n.why }}</span>
          </button>
        </div>
        <div class="ie-col">
          <div class="ie-col-label bad">Clashes</div>
          <button
            v-for="n in IMPROV_EXAMPLES[improvChordIdx].badNotes"
            :key="n.semi"
            class="ie-note-btn bad"
            @pointerdown.prevent="playImprovExample(IMPROV_EXAMPLES[improvChordIdx].chordSemi, n.semi)"
          >
            <span class="ie-note-name">{{ n.name }}</span>
            <span class="ie-note-why">{{ n.why }}</span>
          </button>
        </div>
      </div>
    </div>

    <div class="improv-cta">
      Try it in <strong>Jam Mode</strong> — pick a key and scale to see safe pads highlighted.
    </div>
  </div>
</template>

<style scoped>
.step-content {
  display: flex;
  flex-direction: column;
  gap: 1.35rem;
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

.improv-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.improv-item {
  background: var(--raised);
  border: 1px solid var(--border2);
  border-radius: 10px;
  padding: 0.85rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.improv-chord-name {
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--accent);
  letter-spacing: 0.02em;
}

.improv-scales {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.improv-scale-pill {
  display: flex;
  flex-direction: column;
  gap: 0.05rem;
  padding: 0.3rem 0.6rem;
  border-radius: 6px;
  border: 1px solid var(--border2);
  background: var(--input);
}

.isp-name {
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--text2);
}

.isp-desc {
  font-size: 0.68rem;
  color: var(--text4);
}

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

.improv-examples {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  padding: 1rem;
  border-radius: 10px;
  border: 1px solid var(--border);
  background: var(--surface2);
}

.ie-header {
  display: flex;
  align-items: baseline;
  gap: 0.6rem;
  flex-wrap: wrap;
}

.ie-title {
  font-size: 0.82rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--text2);
}

.ie-subtitle {
  font-size: 0.78rem;
  color: var(--text4);
}

.ie-chord-picker {
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
}

.ie-chord-btn {
  padding: 0.3rem 0.75rem;
  border-radius: 6px;
  border: 1px solid var(--border2);
  background: transparent;
  color: var(--text3);
  font-size: 0.8rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: background 0.12s, border-color 0.12s, color 0.12s;
}

.ie-chord-btn:hover  { border-color: var(--accent-mid); color: var(--text2); }
.ie-chord-btn.active { background: var(--accent-bg); border-color: var(--accent); color: var(--accent); }

.ie-columns {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.6rem;
}

.ie-col {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.ie-col-label {
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  padding-bottom: 0.25rem;
}

.ie-col-label.good { color: var(--good); }
.ie-col-label.bad  { color: var(--bad); }

.ie-note-btn {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.15rem;
  padding: 0.45rem 0.65rem;
  border-radius: 7px;
  border: 1px solid var(--border2);
  background: var(--input);
  text-align: left;
  cursor: pointer;
  font-family: inherit;
  transition: border-color 0.12s, background 0.12s;
}

.ie-note-btn:hover { background: var(--surface); }

.ie-note-btn.good { border-left: 3px solid var(--good-dim); }
.ie-note-btn.bad  { border-left: 3px solid var(--bad-dim); }

.ie-note-btn.good:hover { border-color: var(--good); border-left-color: var(--good); }
.ie-note-btn.bad:hover  { border-color: var(--bad);  border-left-color: var(--bad); }

.ie-note-name {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--text);
}

.ie-note-why {
  font-size: 0.74rem;
  color: var(--text4);
  line-height: 1.3;
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
</style>
