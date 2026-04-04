<script setup>
import { ref, computed, onUnmounted } from 'vue'
import { displayMode } from '@/state/displayMode.js'
import { NOTES, LABELS, SHARPS, CHORD_TYPES, CHORD_SUFFIX, FLAT_MAP, NOTE_TO_SEMI } from '@/constants/musicConstants.js'
import { buildRows } from '@/utils/musicUtils.js'
import { padCols } from '@/state/padSize.js'
import { startNote, stopNote } from '@/audio/audioEngine.js'
import ChordCardBody from '@/components/music/ChordCardBody.vue'
import PageHeader from '@/components/ui/PageHeader.vue'

const input = ref('D f#m E D')

function parseToken(token) {
  const s = token[0].toUpperCase() + token.slice(1)
  let noteStr, suffix
  if (s.length >= 2 && (s[1] === '#' || s[1] === 'b')) {
    noteStr = s.slice(0, 2)
    suffix = s.slice(2).toLowerCase()
  } else {
    noteStr = s[0]
    suffix = s.slice(1).toLowerCase()
  }
  const note = FLAT_MAP[noteStr] ?? noteStr
  const noteIndex = NOTES.indexOf(note)
  if (noteIndex === -1) return null

  const SUFFIX_MAP = {
    '': 'maj', 'maj': 'maj',
    'm': 'min', 'min': 'min',
    'm7': 'min7', 'min7': 'min7',
    'maj7': 'maj7',
    '7': 'dom7',
    'dim': 'dim', '°': 'dim',
    'aug': 'aug', '+': 'aug',
    'sus4': 'sus4',
  }
  const type = SUFFIX_MAP[suffix]
  if (!type) return null

  return { noteIndex, note, type }
}

const tokens = computed(() =>
  input.value.trim().split(/\s+/).filter(Boolean).map(tok => ({
    raw: tok,
    parsed: parseToken(tok),
  }))
)

const parseErrors = computed(() => tokens.value.filter(t => !t.parsed).map(t => t.raw))

const activeCardMidis = ref([])

function onCardDown(card) {
  for (const midi of activeCardMidis.value) stopNote(midi)
  const midis = CHORD_TYPES[card.type].map(i => 60 + NOTE_TO_SEMI[card.chordRootIdx] + i)
  activeCardMidis.value = midis
  for (const midi of midis) startNote(midi)
}

function onCardUp() {
  for (const midi of activeCardMidis.value) stopNote(midi)
  activeCardMidis.value = []
}

onUnmounted(() => {
  for (const midi of activeCardMidis.value) stopNote(midi)
})

const chordCards = computed(() =>
  tokens.value
    .filter(t => t.parsed)
    .map((t, idx) => {
      const { noteIndex, note, type } = t.parsed
      const activeSet = new Set(CHORD_TYPES[type].map(i => (noteIndex + i) % 12))
      const sorted    = [...activeSet].sort((a, b) => a - b)
      return {
        idx,
        name:         note + CHORD_SUFFIX[type],
        type,
        chordRootIdx: noteIndex,
        rows:         buildRows(activeSet, noteIndex, padCols.value),
        pressLabels:  sorted.map(i => LABELS[i]),
        noteNames:    sorted.map(i => NOTES[i]),
      }
    })
)

</script>

<template>
  <div class="prog-builder">
    <PageHeader title="Progression Builder" subtitle="type chords separated by spaces" />

    <div class="input-row">
      <input
        v-model="input"
        class="chord-input"
        placeholder="e.g. D f#m E D"
        spellcheck="false"
        autocomplete="off"
      />
    </div>

    <p class="hint">
      Supported: <span class="mono">C D# Gb Am Em7 Fmaj7 Bdim Caug Asus4</span>
    </p>

    <div v-if="parseErrors.length" class="parse-errors">
      Unrecognised:
      <span v-for="e in parseErrors" :key="e" class="error-token">{{ e }}</span>
    </div>

    <template v-if="chordCards.length">
      <div class="chord-row" :class="{ 'piano-mode': displayMode === 'piano' }">
        <div
          v-for="card in chordCards"
          :key="card.idx"
          class="chord-card"
          :class="{ 'piano-mode': displayMode === 'piano' }"
          @pointerdown.prevent="onCardDown(card)"
          @pointerup="onCardUp"
          @pointerleave="onCardUp"
          @pointercancel="onCardUp"
        >
          <div class="chord-info">
            <div class="chord-name">{{ card.name }}</div>
          </div>
          <div class="chord-body-wrap">
            <ChordCardBody
              :rows="card.rows"
              :pressLabels="card.pressLabels"
              :noteNames="card.noteNames"
              :chordRootIdx="card.chordRootIdx"
              :chordType="card.type"
            />
          </div>
        </div>
      </div>

    </template>

    <p v-else-if="input.trim()" class="empty-hint">No valid chords recognised yet.</p>
  </div>
</template>

<style scoped>
.prog-builder {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 2rem;
}

.input-row { margin: 1.5rem 0 0.6rem; }

.chord-input {
  width: 100%;
  box-sizing: border-box;
  background: var(--input);
  border: 1px solid var(--border2);
  border-radius: 8px;
  color: var(--text);
  font-size: 1.1rem;
  font-family: inherit;
  padding: 0.6rem 0.9rem;
  outline: none;
  letter-spacing: 0.06em;
  transition: border-color 0.15s;
}

.chord-input:focus { border-color: var(--accent); }
.chord-input::placeholder { color: var(--text5); }

.hint { font-size: 0.78rem; color: var(--text4); margin-bottom: 0.5rem; }
.mono { font-family: monospace; color: var(--text3); }

.parse-errors {
  font-size: 0.8rem;
  color: var(--error-text2);
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  flex-wrap: wrap;
}

.error-token {
  background: var(--error-bg);
  border: 1px solid var(--error-bd);
  border-radius: 4px;
  padding: 1px 6px;
  font-family: monospace;
  color: var(--error-text);
}

.empty-hint { font-size: 0.85rem; color: var(--text4); font-style: italic; margin-top: 1rem; }

.chord-row {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-top: 1.25rem;
}

.chord-row.piano-mode {
  flex-direction: column;
  gap: 0.5rem;
}

.chord-card {
  flex: 1 1 120px;
  max-width: 160px;
  background: var(--input);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 0.75rem 0.6rem;
  cursor: pointer;
  transition: border-color 0.15s, box-shadow 0.15s, background 0.15s;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;
  user-select: none;
  touch-action: none;
}

.chord-card.piano-mode {
  flex-direction: row;
  align-items: center;
  max-width: 100%;
  flex: 1 1 100%;
  padding: 0.6rem 1rem;
  gap: 1rem;
}

.chord-card:hover { background: var(--hover); border-color: var(--accent-mid); }

.chord-card.active {
  border-color: var(--accent);
  background: var(--accent-bg);
  box-shadow: 0 0 0 1px var(--accent-glow);
}

.chord-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
  gap: 0.15rem;
}

.chord-card.piano-mode .chord-info {
  width: 4.5rem;
}

.chord-body-wrap {
  flex: 1;
  min-width: 0;
}

.chord-name { font-size: 1.1rem; font-weight: 700; color: var(--rust); line-height: 1; }

@media (max-width: 600px) {
  .prog-builder { padding: 1.25rem 1rem; }
  .chord-card { flex: 1 1 calc(50% - 0.375rem); max-width: calc(50% - 0.375rem); }
}

@media (orientation: landscape) and (max-height: 500px) {
  .prog-builder { padding: 0.75rem 1rem; }
  .chord-row { margin-top: 0.5rem; }
}
</style>
