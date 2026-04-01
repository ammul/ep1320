<script setup>
const emit = defineEmits(['navigate'])

const learnCard = {
  id: 'learn',
  label: 'Learn',
  description: 'Step-by-step lessons on intervals, scales, chords, and rhythm — including how to build a beat from scratch.',
  featured: true,
}

const tools = [
  {
    id: 'chords',
    label: 'Chord Progressions',
    description: 'Browse classic progressions — I–V–vi–IV, ii–V–I, Canon in D and more — transposed to any root key. Connect via MIDI to preview chords or loop a progression straight to your synth.',
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
    description: 'Pick a key and scale — see exactly which notes are safe to play. Anchor notes (root, 3rd, 5th) are highlighted. Tap pads to hear the notes, then layer over a running drum beat.',
  },
  {
    id: 'drums',
    label: 'Drum Computer',
    description: 'Build a drum loop from 8 instruments across 16 steps. The beat keeps running while you switch to other tools — set it going and improvise over it.',
    preview: ['1', '2', '3', '4'],
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
      <p class="tagline">Play music. No sheet music required.</p>
      <p class="sub">
        Tonarium is a free toolkit for people who love music but never learned to read it.
        Explore scales, chords, and progressions visually — then jam over a beat you built yourself.
        Works with synths, guitars, and the TE EP-1320.
      </p>
    </section>

    <button class="tool-card learn-card" :class="{ featured: learnCard.featured }" @click="emit('navigate', learnCard.id)">
      <div class="card-body">
        <div class="card-text">
          <span v-if="learnCard.featured" class="badge">Start here</span>
          <h2>{{ learnCard.label }}</h2>
          <p>{{ learnCard.description }}</p>
        </div>
      </div>
      <span class="open-label">Open &rarr;</span>
    </button>

    <p class="display-hint">Use <strong>Settings</strong> (⚙ in the header) to choose your instrument view — EP-1320, Notes, Guitar, or Piano. All tools adapt to the selected mode.</p>

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

    <section class="about">
      <p>Built by <a href="https://github.com/ammul" target="_blank" rel="noopener">ammul</a> — lazy music fan.</p>
      <a href="https://github.com/ammul/tonarium" target="_blank" rel="noopener" class="github-btn">
        <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
        </svg>
        View on GitHub
      </a>
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

.learn-card {
  margin-bottom: 0.75rem;
}

.display-hint {
  font-size: 0.8rem;
  color: var(--text3);
  line-height: 1.5;
  margin: 0 0 1.25rem;
  padding: 0 0.25rem;
}

.display-hint strong {
  color: var(--text2);
  font-weight: 600;
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

.about {
  margin-top: 3rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--border);
}

.about p {
  font-size: 0.85rem;
  color: var(--text3);
  line-height: 1.6;
  margin: 0 0 0.75rem;
}

.about a {
  color: var(--accent);
  text-decoration: none;
}

.about a:hover {
  text-decoration: underline;
}

.github-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.35rem 0.8rem;
  border: 1px solid var(--border2);
  border-radius: 6px;
  background: var(--input);
  color: var(--text2);
  font-size: 0.82rem;
  font-weight: 600;
  text-decoration: none;
  transition: border-color 0.15s, color 0.15s, background 0.15s;
}

.github-btn:hover {
  border-color: var(--accent);
  color: var(--accent);
  background: var(--accent-bg);
  text-decoration: none;
}
</style>
