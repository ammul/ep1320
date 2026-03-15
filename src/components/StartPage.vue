<script setup>
import { displayMode } from '../displayMode.js'

const emit = defineEmits(['navigate'])

const modes = [
  { id: 'ep1320',  label: 'EP-1320', description: 'Chromatic pad grid layout, as on the TE EP-1320 synthesizer.', default: true },
  { id: 'notes',   label: 'Notes',   description: 'Plain chromatic note name tiles.' },
  { id: 'guitar',  label: 'Guitar',  description: '6-string fretboard or chord diagrams in standard tuning.' },
  { id: 'piano',   label: 'Piano',   description: 'Piano keyboard layout.' },
]

const tools = [
  {
    id: 'chords',
    label: 'Chord Progressions',
    description: 'Browse classic progressions — I–V–vi–IV, ii–V–I, Canon in D and more — transposed to any root key. Connect via MIDI to preview chords or loop a progression straight to your synth.',
    featured: true,
    preview: ['I', 'V', 'vi', 'IV'],
  },
  {
    id: 'claves',
    label: 'Claves Mode',
    description: 'Chromatic 4×3 pad layout matching the EP-1320. Connect via MIDI and tap pads to play notes directly on your synth — hold for sustain.',
  },
  {
    id: 'jam',
    label: 'Jam Mode',
    description: 'Pick a key and scale — see exactly which notes are safe to play. Anchor notes (root, 3rd, 5th) are highlighted so you always know where to land.',
  },
  {
    id: 'scales',
    label: 'Scale Visualizer',
    description: 'See any scale across all 12 notes. Understand which notes belong to a given key at a glance.',
  },
  {
    id: 'chord-detector',
    label: 'Chord Detector',
    description: 'Select a set of notes and instantly see what chord they form — useful for ear training and reverse engineering songs.',
  },
  {
    id: 'prog-builder',
    label: 'Progression Builder',
    description: 'Arrange your own chord sequence from scratch and see it laid out on your instrument of choice.',
  },
]
</script>

<template>
  <div class="start-page">
    <section class="hero">
      <p class="tagline">Music theory you can see and play.</p>
      <p class="sub">
        Tonarium is a visual toolkit for understanding harmony — explore scales, chords,
        and progressions across guitar, piano, or pad layout (ep1320 synthesizer).
      </p>
    </section>

    <section class="modes-card">
      <div class="modes-header">
        <h2>Display Modes</h2>
        <p>All tools render their content in the selected mode. Switch anytime using the Display dropdown in the header, or pick one below.</p>
      </div>
      <div class="modes-list">
        <button
          v-for="mode in modes"
          :key="mode.id"
          class="mode-row"
          :class="{ active: displayMode === mode.id }"
          @click="displayMode = mode.id"
        >
          <div class="mode-row-text">
            <span class="mode-name">{{ mode.label }}</span>
            <span v-if="mode.default" class="mode-default">default</span>
            <span class="mode-desc">{{ mode.description }}</span>
          </div>
          <span class="mode-active-dot" v-if="displayMode === mode.id"></span>
        </button>
      </div>
    </section>

    <section class="tools">
      <button
        v-for="tool in tools"
        :key="tool.id"
        class="tool-card"
        :class="{ featured: tool.featured }"
        @click="emit('navigate', tool.id)"
      >
        <div class="card-body">
          <div class="card-text">
            <span v-if="tool.featured" class="badge">Start here</span>
            <h2>{{ tool.label }}</h2>
            <p>{{ tool.description }}</p>
          </div>
          <div v-if="tool.preview" class="preview-chips">
            <span v-for="numeral in tool.preview" :key="numeral" class="chip">{{ numeral }}</span>
          </div>
        </div>
        <span class="open-label">Open &rarr;</span>
      </button>
    </section>
  </div>
</template>

<style scoped>
.start-page {
  max-width: 680px;
  margin: 0 auto;
  padding: 0 0.5rem 3rem;
}

/* Hero */
.hero {
  margin-bottom: 2.5rem;
}

.tagline {
  font-size: clamp(1.3rem, 4vw, 1.9rem);
  font-weight: 700;
  color: var(--text);
  letter-spacing: 0.01em;
  line-height: 1.25;
  margin: 0 0 0.75rem;
}

.sub {
  font-size: 0.95rem;
  color: var(--text3);
  line-height: 1.6;
  margin: 0;
  max-width: 520px;
}

/* Display modes card */
.modes-card {
  background: var(--raised);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 1.1rem 1.25rem;
  margin-bottom: 0.75rem;
}

.modes-header {
  margin-bottom: 0.9rem;
}

.modes-header h2 {
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--text3);
  margin: 0 0 0.35rem;
}

.modes-header p {
  font-size: 0.82rem;
  color: var(--text3);
  margin: 0;
  line-height: 1.5;
}

.modes-list {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.mode-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  background: transparent;
  border: 1px solid var(--border3);
  border-radius: 6px;
  padding: 0.5rem 0.6rem;
  cursor: pointer;
  text-align: left;
  width: 100%;
  transition: background 0.12s, border-color 0.12s;
}

.mode-row:hover {
  background: var(--hover);
  border-color: var(--border2);
}

.mode-row.active {
  background: color-mix(in srgb, var(--accent) 8%, transparent);
  border-color: color-mix(in srgb, var(--accent) 25%, transparent);
}

.mode-row-text {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  flex-wrap: wrap;
  min-width: 0;
}

.mode-name {
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--text);
  white-space: nowrap;
}

.mode-row.active .mode-name {
  color: var(--accent);
}

.mode-default {
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text3);
  border: 1px solid var(--border2);
  border-radius: 3px;
  padding: 0.1rem 0.35rem;
}

.mode-desc {
  font-size: 0.8rem;
  color: var(--text3);
  line-height: 1.4;
}

.mode-active-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--accent);
  flex-shrink: 0;
}

/* Tool grid */
.tools {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.75rem;
}

/* Cards */
.tool-card {
  background: var(--raised);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 1.1rem 1.25rem;
  cursor: pointer;
  text-align: left;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  transition: border-color 0.15s, background 0.15s;
  width: 100%;
}

.tool-card:hover {
  border-color: var(--accent);
  background: var(--hover);
}

.tool-card.featured {
  border-color: var(--accent);
  padding: 1.4rem 1.25rem;
}

.card-body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.card-text {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.badge {
  display: inline-block;
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--accent);
  background: color-mix(in srgb, var(--accent) 12%, transparent);
  border: 1px solid color-mix(in srgb, var(--accent) 30%, transparent);
  border-radius: 4px;
  padding: 0.15rem 0.45rem;
  align-self: flex-start;
}

.tool-card h2 {
  font-size: 1rem;
  font-weight: 700;
  color: var(--text);
  margin: 0;
  letter-spacing: 0.02em;
}

.tool-card.featured h2 {
  font-size: 1.1rem;
  color: var(--accent);
}

.tool-card p {
  font-size: 0.85rem;
  color: var(--text3);
  margin: 0;
  line-height: 1.55;
}

/* Chord numeral preview */
.preview-chips {
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
}

.chip {
  display: inline-block;
  background: var(--input);
  border: 1px solid var(--border2);
  border-radius: 5px;
  padding: 0.25rem 0.6rem;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text3);
  font-family: inherit;
  letter-spacing: 0.03em;
}

.open-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text3);
  white-space: nowrap;
  flex-shrink: 0;
  transition: color 0.15s;
}

.tool-card:hover .open-label {
  color: var(--accent);
}

@media (max-width: 480px) {
  .tool-card {
    flex-direction: column;
    align-items: flex-start;
  }

  .open-label {
    align-self: flex-end;
  }
}
</style>
