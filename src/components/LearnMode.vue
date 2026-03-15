<script setup>
import { ref } from 'vue'

const expanded = ref(null)

function toggle(id) {
  expanded.value = expanded.value === id ? null : id
}

const cards = [
  {
    id: 'intervals',
    title: 'Intervals & Tone Steps',
    teaser: 'How notes relate to each other — the building blocks of melody and harmony',
    content: `
      <p>An <strong>interval</strong> is the distance between two notes, measured in semitones (the smallest step on the EP-1320 or piano). Understanding intervals lets you build any scale, chord, or melody from first principles.</p>

      <p><strong>Half step</strong> (1 semitone) — the smallest interval, e.g. C to C#.<br>
      <strong>Whole step</strong> (2 semitones) — e.g. C to D.</p>

      <table>
        <thead><tr><th>Semitones</th><th>Name</th><th>Example from C</th></tr></thead>
        <tbody>
          <tr><td>1</td><td>Minor 2nd</td><td>C → C#</td></tr>
          <tr><td>2</td><td>Major 2nd</td><td>C → D</td></tr>
          <tr><td>3</td><td>Minor 3rd</td><td>C → D#</td></tr>
          <tr><td>4</td><td>Major 3rd</td><td>C → E</td></tr>
          <tr><td>5</td><td>Perfect 4th</td><td>C → F</td></tr>
          <tr><td>6</td><td>Tritone</td><td>C → F#</td></tr>
          <tr><td>7</td><td>Perfect 5th</td><td>C → G</td></tr>
          <tr><td>8</td><td>Minor 6th</td><td>C → G#</td></tr>
          <tr><td>9</td><td>Major 6th</td><td>C → A</td></tr>
          <tr><td>10</td><td>Minor 7th</td><td>C → A#</td></tr>
          <tr><td>11</td><td>Major 7th</td><td>C → B</td></tr>
          <tr><td>12</td><td>Octave</td><td>C → C</td></tr>
        </tbody>
      </table>

      <p>On the EP-1320, each pad is one semitone apart. Moving up one row increases pitch by 3 semitones (pads 1–12 map to a chromatic octave, low→high).</p>
    `,
  },
  {
    id: 'scales',
    title: 'Scales',
    teaser: 'Ordered sets of notes that give music its mood and colour',
    content: `
      <p>A <strong>scale</strong> is a selection of notes from the 12 available, arranged by pitch. The intervals between scale steps define whether a scale feels major (bright), minor (dark), or modal (somewhere between).</p>

      <p><strong>Major scale</strong> — whole, whole, half, whole, whole, whole, half (W W H W W W H). Bright and resolved. C major: C D E F G A B.</p>

      <p><strong>Natural minor</strong> — W H W W H W W. Dark and emotional. A minor: A B C D E F G.</p>

      <p><strong>Pentatonic scales</strong> remove two "tension" notes from the 7-note scale, leaving 5 notes that all work safely together. Great starting point for improvising.</p>

      <table>
        <thead><tr><th>Scale</th><th>Differs from major at</th><th>Character</th></tr></thead>
        <tbody>
          <tr><td>Major (Ionian)</td><td>—</td><td>Bright, resolved</td></tr>
          <tr><td>Dorian</td><td>b3, b7</td><td>Soulful, funky minor</td></tr>
          <tr><td>Phrygian</td><td>b2, b3, b6, b7</td><td>Dark, Spanish/flamenco</td></tr>
          <tr><td>Lydian</td><td>#4</td><td>Dreamy, floating</td></tr>
          <tr><td>Mixolydian</td><td>b7</td><td>Bluesy, rock</td></tr>
          <tr><td>Natural Minor (Aeolian)</td><td>b3, b6, b7</td><td>Dark, emotional</td></tr>
          <tr><td>Locrian</td><td>b2, b3, b5, b6, b7</td><td>Dissonant, unstable</td></tr>
        </tbody>
      </table>

      <p>Try scales in <strong>Jam Mode</strong> — pick a key and scale to see which pads are safe to play.</p>
    `,
  },
  {
    id: 'progressions',
    title: 'Chord Progressions',
    teaser: 'How chords move together — the backbone of most songs',
    content: `
      <p>A <strong>chord progression</strong> is a sequence of chords that repeat throughout a song. Chords are built from the notes of a scale, so a progression in C major uses chords made of C major scale notes.</p>

      <p>Chords are labelled with <strong>Roman numerals</strong> based on which scale degree they're built on. Uppercase = major, lowercase = minor.</p>

      <p><strong>I – V – vi – IV</strong> (e.g. C – G – Am – F) is the most common pop progression. It underpins hundreds of songs because each chord naturally leads to the next.</p>

      <table>
        <thead><tr><th>Progression</th><th>Feel</th><th>Examples</th></tr></thead>
        <tbody>
          <tr><td>I – V – vi – IV</td><td>Pop / anthemic</td><td>Let It Be, No Woman No Cry</td></tr>
          <tr><td>I – IV – V</td><td>Blues, rock</td><td>12-bar foundation</td></tr>
          <tr><td>ii – V – I</td><td>Jazz resolution</td><td>Autumn Leaves, most jazz standards</td></tr>
          <tr><td>i – VII – VI – VII</td><td>Andalusian, flamenco</td><td>Hit the Road Jack, Stairway intro</td></tr>
          <tr><td>I – vi – IV – V</td><td>50s doo-wop</td><td>Stand By Me, Every Breath You Take</td></tr>
        </tbody>
      </table>

      <p>Try these in the <strong>Chord Progressions</strong> tab — tap cards to preview chords, or loop the progression via MIDI.</p>
    `,
  },
  {
    id: 'improv',
    title: 'Improvising',
    teaser: 'How to solo confidently over any chord or progression',
    content: `
      <p>Improvising is about choosing notes that sound intentional over a chord or progression. The good news: a few simple rules cover 90% of situations.</p>

      <p><strong>Start with the minor pentatonic.</strong> Five notes, no clashes — every note works over almost any minor chord or minor-key progression. In Jam Mode, pick your key and set the scale to "mi.p".</p>

      <p><strong>Target chord tones.</strong> The root, 3rd, and 5th of each chord are the safest landing spots — they sound resolved when you hold them. Other scale notes work best as passing notes (moving through rather than landing on).</p>

      <p><strong>Match scale to chord type:</strong></p>
      <table>
        <thead><tr><th>Chord type</th><th>Safe scale choice</th></tr></thead>
        <tbody>
          <tr><td>Major chord</td><td>Major pentatonic, major scale, Mixolydian</td></tr>
          <tr><td>Minor chord</td><td>Minor pentatonic, natural minor, Dorian</td></tr>
          <tr><td>Dominant 7th</td><td>Mixolydian, blues scale</td></tr>
          <tr><td>Any chord in a major key</td><td>Major pentatonic (always safe)</td></tr>
          <tr><td>Any chord in a minor key</td><td>Minor pentatonic (always safe)</td></tr>
        </tbody>
      </table>

      <p><strong>On the EP-1320:</strong> in Claves Mode, the 12 pads are a chromatic octave from your root note. Use Jam Mode to see which pads belong to your chosen scale — lit pads are safe, anchor pads (slightly brighter) are the best landing spots.</p>

      <p>Start with simple rhythmic patterns — one or two notes — before adding more pitches. Rhythm is more important than note choice when starting out.</p>
    `,
  },
]
</script>

<template>
  <div class="learn-mode">
    <div class="learn-header">
      <h2>Learn</h2>
      <p class="subtitle">music theory essentials — tap a card to expand</p>
    </div>

    <div class="card-grid">
      <div
        v-for="card in cards"
        :key="card.id"
        class="card"
        :class="{ expanded: expanded === card.id }"
      >
        <button class="card-header" @click="toggle(card.id)" :aria-expanded="expanded === card.id">
          <span class="card-title">{{ card.title }}</span>
          <span class="card-chevron" :class="{ open: expanded === card.id }">&#9660;</span>
        </button>
        <p class="card-teaser" v-if="expanded !== card.id">{{ card.teaser }}</p>
        <div v-if="expanded === card.id" class="card-body" v-html="card.content"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.learn-mode {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 2rem;
}

.learn-header h2 {
  font-size: 1.4rem;
  color: var(--accent);
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.subtitle {
  margin-top: 0.3rem;
  font-size: 0.85rem;
  color: var(--text3);
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-top: 1.5rem;
}

@media (max-width: 600px) {
  .card-grid {
    grid-template-columns: 1fr;
  }
}

.card {
  background: var(--raised);
  border: 1px solid var(--border2);
  border-radius: 8px;
  overflow: hidden;
  transition: border-color 0.15s;
}

.card.expanded {
  border-color: var(--accent-mid);
  grid-column: 1 / -1;
}

.card-header {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.9rem 1rem;
  background: transparent;
  border: none;
  cursor: pointer;
  text-align: left;
}

.card-header:hover {
  background: var(--hover);
}

.card-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--accent);
  letter-spacing: 0.03em;
}

.card-chevron {
  font-size: 0.65rem;
  color: var(--text4);
  flex-shrink: 0;
  transition: transform 0.2s;
  display: inline-block;
}

.card-chevron.open {
  transform: rotate(180deg);
}

.card-teaser {
  padding: 0 1rem 0.9rem;
  margin: 0;
  font-size: 0.82rem;
  color: var(--text3);
  line-height: 1.5;
}

.card-body {
  padding: 0 1rem 1rem;
  font-size: 0.85rem;
  color: var(--text2);
  line-height: 1.65;
}

.card-body :deep(p) {
  margin: 0 0 0.85rem;
}

.card-body :deep(p:last-child) {
  margin-bottom: 0;
}

.card-body :deep(strong) {
  color: var(--accent);
  font-weight: 600;
}

.card-body :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 0.75rem 0;
  font-size: 0.8rem;
}

.card-body :deep(th) {
  text-align: left;
  padding: 0.35rem 0.6rem;
  background: var(--input);
  color: var(--accent);
  font-weight: 600;
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid var(--border2);
}

.card-body :deep(td) {
  padding: 0.35rem 0.6rem;
  color: var(--text2);
  border-bottom: 1px solid var(--border);
}

.card-body :deep(tr:last-child td) {
  border-bottom: none;
}

.card-body :deep(tr:nth-child(even) td) {
  background: var(--input);
}

@media (max-width: 600px) {
  .learn-mode {
    padding: 1.25rem 1rem;
  }
}

@media (orientation: landscape) and (max-height: 500px) {
  .learn-mode {
    padding: 0.75rem 1rem;
  }

  .learn-header h2 {
    font-size: 1.1rem;
  }

  .subtitle {
    display: none;
  }

  .card-grid {
    margin-top: 0.75rem;
  }
}
</style>
