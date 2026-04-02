<script setup>
const emit = defineEmits(['navigate'])

const learnCard = {
  id: 'learn',
  label: 'Learn',
  description: 'Step-by-step lessons on intervals, scales, chords, and rhythm - including how to build a beat from scratch.',
  featured: true,
}

const tools = [
  {
    id: 'jam',
    label: 'Jam Mode',
    description: 'Pick a key and scale - see exactly which notes are safe to play. Anchor notes (root, 3rd, 5th) are highlighted. Tap pads to hear the notes, then layer over a running drum beat.',
  },
  {
    id: 'drums',
    label: 'Drum Computer',
    description: 'Build a drum loop from 8 instruments across 16 steps. The beat keeps running while you switch to other tools - set it going and improvise over it.',
  },
  {
    id: 'scales',
    label: 'Scale Visualizer',
    description: 'See any scale across all 12 notes. Understand which notes belong to a given key at a glance.',
  },
  {
    id: 'chords',
    label: 'Chord Progressions',
    description: 'Browse classic progressions (I-V-vi-IV, ii-V-I, Canon in D and more) transposed to any root key. Connect via MIDI to preview chords or loop a progression straight to your synth.',
    preview: ['I', 'V', 'vi', 'IV'],
  },
  {
    id: 'chord-detector',
    label: 'Chord Detector',
    description: 'Select a set of notes and instantly see what chord they form - useful for ear training and reverse engineering songs.',
  },
  {
    id: 'prog-builder',
    label: 'Progression Builder',
    description: 'Arrange your own chord sequence from scratch and see it laid out on your instrument of choice.',
  },
]
</script>

<template>
  <div class="max-w-680">
    <section class="mb-6">
      <p class="tagline">Play music. No sheet music required.</p>
      <p class="text-muted" style="line-height: 1.6; max-width: 520px">
        Tonarium is a free toolkit for people who love music but never learned to read it.
        Explore scales, chords, and progressions visually - then jam over a beat you built yourself.
        Works with synths and guitars.
      </p>
    </section>

    <button class="card card-hover featured mb-3 w-full flex items-center justify-between" @click="emit('navigate', learnCard.id)">
      <div class="flex-col gap-3 flex-1 text-left">
        <div class="flex-col gap-1">
          <span v-if="learnCard.featured" class="badge">Start here</span>
          <h2 class="m-0 text-accent" style="font-size: 1.1rem">{{ learnCard.label }}</h2>
          <p class="m-0 text-muted text-small" style="line-height: 1.55">{{ learnCard.description }}</p>
        </div>
      </div>
      <span class="open-label">Open &rarr;</span>
    </button>

    <p class="text-tiny text-muted mb-4 p-1">Use <strong>Settings</strong> (⚙ in the header) to choose your instrument view - Pad, Notes, Guitar, or Piano. All tools adapt to the selected mode.</p>

    <section class="flex-col gap-3">
      <button
        v-for="tool in tools"
        :key="tool.id"
        class="card card-hover w-full flex items-center justify-between"
        @click="emit('navigate', tool.id)"
      >
        <div class="flex-col gap-3 flex-1 text-left">
          <div class="flex-col gap-1">
            <h2 class="m-0" style="font-size: 1rem">{{ tool.label }}</h2>
            <p class="m-0 text-muted text-small" style="line-height: 1.55">{{ tool.description }}</p>
          </div>
          <div v-if="tool.preview" class="flex gap-2 flex-wrap">
            <span v-for="numeral in tool.preview" :key="numeral" class="chip">{{ numeral }}</span>
          </div>
        </div>
        <span class="open-label">Open &rarr;</span>
      </button>
    </section>

    <section class="mt-6 p-4" style="border-top: 1px solid var(--border)">
      <p class="text-small text-muted mb-3">Built by <a href="https://github.com/ammul" target="_blank" rel="noopener">ammul</a>.</p>
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
.tagline {
  font-size: clamp(1.3rem, 4vw, 1.9rem);
  font-weight: 700;
  color: var(--text);
  letter-spacing: 0.01em;
  line-height: 1.25;
  margin: 0 0 0.75rem;
}

.open-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text3);
  white-space: nowrap;
  flex-shrink: 0;
  transition: color 0.15s;
}

.card:hover .open-label { color: var(--accent); }

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

@media (max-width: 480px) {
  .card { flex-direction: column; align-items: flex-start; }
  .open-label { align-self: flex-end; }
}
</style>
