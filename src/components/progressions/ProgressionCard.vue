<script setup>
defineProps({
  progression: {
    type: Object,
    required: true,
    // { id, label, numeral, examples, chords: [{ degree, type, numeral }] }
  },
  rootNote: { type: String, required: true },
  isExpanded: { type: Boolean, default: false },
  isPlaying: { type: Boolean, default: false },
})

defineEmits(['toggle-expand', 'play', 'stop', 'loop-start', 'loop-stop'])
</script>

<template>
  <div class="prog-card" :class="{ expanded: isExpanded, playing: isPlaying }">
    <div class="prog-card-header" @click="$emit('toggle-expand')">
      <div class="prog-card-meta">
        <span class="prog-card-label">{{ progression.label }}</span>
        <span class="prog-card-numeral">{{ progression.numeral }}</span>
      </div>
      <div class="prog-card-controls" @click.stop>
        <button
          class="ctrl-btn"
          :class="{ active: isPlaying }"
          :aria-label="isPlaying ? 'Stop' : 'Play'"
          @click="isPlaying ? $emit('stop') : $emit('play')"
        >{{ isPlaying ? '■' : '▶' }}</button>
        <button
          class="ctrl-btn"
          aria-label="Loop"
          @click="$emit('loop-start')"
        >⟳</button>
        <button class="expand-btn" :aria-label="isExpanded ? 'Collapse' : 'Expand'">
          {{ isExpanded ? '▲' : '▼' }}
        </button>
      </div>
    </div>

    <div v-if="isExpanded" class="prog-card-body">
      <p class="prog-card-examples">{{ progression.examples }}</p>
      <div class="prog-card-chords">
        <span
          v-for="chord in progression.chords"
          :key="chord.numeral"
          class="chord-pill"
        >{{ chord.numeral }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.prog-card {
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--input);
  overflow: hidden;
  transition: border-color 0.15s;
}

.prog-card:hover     { border-color: var(--accent-mid); }
.prog-card.playing   { border-color: var(--accent); box-shadow: 0 0 0 2px var(--accent-bg); }

.prog-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.55rem 0.75rem;
  cursor: pointer;
  user-select: none;
}

.prog-card-meta {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  min-width: 0;
}

.prog-card-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.prog-card.playing .prog-card-label { color: var(--accent); }

.prog-card-numeral {
  font-size: 0.78rem;
  color: var(--text3);
  font-variant-numeric: tabular-nums;
}

.prog-card-controls {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  flex-shrink: 0;
}

.ctrl-btn,
.expand-btn {
  height: 1.7rem;
  min-width: 1.7rem;
  padding: 0 0.35rem;
  border: 1px solid var(--border2);
  border-radius: 4px;
  background: var(--input);
  color: var(--text2);
  font-size: 0.75rem;
  cursor: pointer;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.12s, border-color 0.12s, color 0.12s;
}

.ctrl-btn:hover,
.expand-btn:hover { border-color: var(--accent); color: var(--text); }

.ctrl-btn.active  { background: var(--accent); border-color: var(--accent); color: var(--on-accent); }

.prog-card-body {
  padding: 0.5rem 0.75rem 0.65rem;
  border-top: 1px solid var(--border3);
}

.prog-card-examples {
  font-size: 0.78rem;
  color: var(--text3);
  font-style: italic;
  margin-bottom: 0.5rem;
}

.prog-card-chords {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
}

.chord-pill {
  font-size: 0.72rem;
  font-weight: 700;
  padding: 0.15rem 0.45rem;
  border-radius: 4px;
  background: color-mix(in srgb, var(--accent) 12%, transparent);
  color: var(--accent-dim);
  border: 1px solid color-mix(in srgb, var(--accent) 22%, transparent);
}
</style>
