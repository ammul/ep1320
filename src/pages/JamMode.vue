<script setup>
import { ref, computed } from 'vue'
import { displayMode } from '../state/displayMode.js'
import { padSize } from '../state/padSize.js'
import { NOTES, SHARPS, FRET_COUNT, NOTE_TO_SEMI } from '../constants/musicConstants.js'
import { JAM_SCALES as SCALES } from '../constants/scales.js'
import { buildGuitarNeck, sliceRows } from '../utils/musicUtils.js'
import { activeInputNotes, midiStatus } from '../audio/midiManager.js'
import { octave } from '../state/octave.js'
import { useNotePlayback } from '../composables/useNotePlayback.js'
import PianoOctave from '../components/PianoOctave.vue'
import ScaleLegend from '../components/ScaleLegend.vue'
import RootNotePicker from '../components/RootNotePicker.vue'
import ModeLayout from '../components/ModeLayout.vue'
import PageHeader from '../components/PageHeader.vue'

// Semitone offsets from root considered "anchor" notes (root, minor 3rd, major 3rd, 5th)
const ANCHOR_OFFSETS = new Set([0, 3, 4, 7])

const selectedRoot   = ref('A')
const selectedScaleId = ref('mi.p')
const showInfo       = ref(false)
const pianoOctave    = ref(4)

const SUBTITLE = { pad: 'lit pads', notes: 'highlighted notes', guitar: 'highlighted frets', piano: 'highlighted keys' }
const subtitle = computed(() => `pick a key and scale - ${SUBTITLE[displayMode.value] ?? 'highlighted items'} are safe to play`)

const selectedScale = computed(() => SCALES.find(s => s.id === selectedScaleId.value))
const rootIndex     = computed(() => NOTES.indexOf(selectedRoot.value))

const activeIndices = computed(() => {
  const root = rootIndex.value
  return new Set(selectedScale.value.intervals.map(i => (root + i) % 12))
})

const anchorIndices = computed(() => {
  const root = rootIndex.value
  return new Set(
    selectedScale.value.intervals
      .filter(i => ANCHOR_OFFSETS.has(i))
      .map(i => (root + i) % 12)
  )
})

const cols = computed(() => padSize.value === '4x4' ? 4 : 3)

const pads = computed(() =>
  Array.from({ length: 4 * cols.value }, (_, i) => {
    const noteIndex = i % 12
    const octaveOffset = Math.floor(i / 12)
    return {
      number:      i + 1,
      label:       String(i + 1),
      note:        NOTES[noteIndex],
      noteIndex,
      octaveOffset,
      isSharp:     SHARPS.has(NOTES[noteIndex]),
      isActive:    activeIndices.value.has(noteIndex),
      isAnchor:    anchorIndices.value.has(noteIndex),
      isRoot:      noteIndex === rootIndex.value,
      midi:        12 * (octave.value + 1 + octaveOffset) + NOTE_TO_SEMI[noteIndex],
    }
  })
)

const rows = computed(() => sliceRows(pads.value, cols.value))

const chromaTiles = computed(() =>
  NOTES.map((note, i) => ({
    note,
    noteIndex: i,
    isSharp:  SHARPS.has(note),
    isActive: activeIndices.value.has(i),
    isAnchor: anchorIndices.value.has(i),
    isRoot:   i === rootIndex.value,
  }))
)

const pressedIndices = computed(() => {
  const result = new Set()
  for (const n of activeInputNotes.value) {
    result.add(NOTE_TO_SEMI.indexOf(n % 12))
  }
  return result
})

const guitarNeck = computed(() =>
  buildGuitarNeck(noteIdx => ({
    isActive: activeIndices.value.has(noteIdx),
    isAnchor: anchorIndices.value.has(noteIdx),
    isRoot:   noteIdx === rootIndex.value,
  }))
)

const scaleNotes = computed(() =>
  selectedScale.value.intervals.map(i => ({
    note:     NOTES[(rootIndex.value + i) % 12],
    isAnchor: ANCHOR_OFFSETS.has(i),
    isRoot:   i === 0,
  }))
)

// MIDI base notes for each guitar string (stringIdx 0-5: E2 A2 D3 G3 B3 E4)
const STRING_BASE_MIDI = [40, 45, 50, 55, 59, 64]
const { pressDown, pressUp, pressToggle } = useNotePlayback()

function padMidi(noteIndex, octave) {
  return 12 * (octave + 1) + NOTE_TO_SEMI[noteIndex]
}

function onPadDown(noteIndex, octaveOffset = 0) { pressDown(12 * (octave.value + 1 + octaveOffset) + NOTE_TO_SEMI[noteIndex]) }
function onPadUp(noteIndex, octaveOffset = 0)   { pressUp(12 * (octave.value + 1 + octaveOffset) + NOTE_TO_SEMI[noteIndex]) }

function onCellDown(stringIdx, fret) { pressDown(STRING_BASE_MIDI[stringIdx] + fret) }
function onCellUp(stringIdx, fret)   { pressUp(STRING_BASE_MIDI[stringIdx] + fret) }

function onPianoToggle(noteIdx) { pressToggle(padMidi(noteIdx, pianoOctave.value)) }
</script>

<template>
  <div class="card w-full" style="background: var(--surface)">
    <PageHeader title="Jam Mode" :subtitle="subtitle" />

    <div class="flex-col gap-4 my-6" style="margin: 1.5rem 0">
      <div class="flex items-center gap-4 mobile-flex-col items-start">
        <label class="text-accent text-bold text-tiny text-uppercase letter-spacing-wide" style="min-width: 5rem">Key</label>
        <RootNotePicker v-model="selectedRoot" />
      </div>

      <div class="flex items-center gap-4 mobile-flex-col items-start">
        <label class="text-accent text-bold text-tiny text-uppercase letter-spacing-wide" style="min-width: 5rem">Scale</label>
        <div class="flex items-center gap-2 flex-wrap">
          <select v-model="selectedScaleId" class="select" style="padding: 0.4rem 0.8rem; font-size: 0.9rem" @change="showInfo = false">
            <option v-for="s in SCALES" :key="s.id" :value="s.id">{{ s.label }}</option>
          </select>
          <button class="bubble" :class="{ active: showInfo }" style="font-style: italic; cursor: pointer" @click="showInfo = !showInfo" aria-label="Scale info">i</button>
        </div>
        <p v-if="showInfo" class="card p-3 text-small text-muted w-full" style="border-left: 3px solid var(--accent)">{{ selectedScale.description }}</p>
      </div>
    </div>

    <ModeLayout>
      <template #pad>
        <div class="flex-col gap-2 max-w-680" style="max-width: 420px; margin: 0 auto">
          <div class="row" v-for="(row, ri) in rows" :key="ri" :style="{ display: 'grid', gap: '0.6rem', gridTemplateColumns: `repeat(${row.length}, 1fr)` }">
            <div
              v-for="pad in row"
              :key="pad.number"
              class="pad"
              :class="{
                active:   pad.isActive && !pad.isAnchor && !pad.isRoot,
                anchor:   pad.isAnchor && !pad.isRoot,
                root:     pad.isRoot,
                inactive: !pad.isActive,
                pressed:  pressedIndices.has(pad.noteIndex),
              }"
              @pointerdown.prevent="onPadDown(pad.noteIndex, pad.octaveOffset)"
              @pointerup="onPadUp(pad.noteIndex, pad.octaveOffset)"
              @pointerleave="onPadUp(pad.noteIndex, pad.octaveOffset)"
              @pointercancel="onPadUp(pad.noteIndex, pad.octaveOffset)"
            >
              <span class="pad-label">{{ pad.label }}</span>
              <span class="pad-note">{{ pad.note }}</span>
              <span v-if="midiStatus === 'connected'" class="pad-midi">{{ pad.midi }}</span>
            </div>
          </div>
        </div>
      </template>

      <template #notes>
        <div class="flex-wrap gap-2 mb-2">
          <div
            v-for="tile in chromaTiles"
            :key="tile.note"
            class="chroma-tile"
            :class="{
              active:   tile.isActive && !tile.isAnchor && !tile.isRoot,
              anchor:   tile.isAnchor && !tile.isRoot,
              root:     tile.isRoot,
              inactive: !tile.isActive,
              pressed:  pressedIndices.has(tile.noteIndex),
            }"
            @pointerdown.prevent="onPadDown(tile.noteIndex)"
            @pointerup="onPadUp(tile.noteIndex)"
            @pointerleave="onPadUp(tile.noteIndex)"
            @pointercancel="onPadUp(tile.noteIndex)"
          >
            <span class="tile-note">{{ tile.note }}</span>
          </div>
        </div>
      </template>

      <template #piano>
        <PianoOctave
          :activeIndices="activeIndices"
          :rootIndex="rootIndex"
          v-model:octave="pianoOctave"
          :dimInactive="true"
          :clickable="true"
          @toggle="onPianoToggle"
        />
      </template>

      <template #guitar>
        <div class="overflow-x-auto mb-2">
          <div class="flex-col min-w-380" style="min-width: 380px">
            <div v-for="(string, si) in guitarNeck" :key="si" class="flex items-center" style="border-bottom: 1px solid var(--border3)">
              <div class="text-tiny text-dim text-bold text-right pr-2" style="width: 1.8rem; padding-right: 0.5rem">{{ string.name }}</div>
              <div
                v-for="cell in string.cells"
                :key="cell.fret"
                class="flex-1 flex items-center justify-center relative pointer-events-auto cursor-pointer"
                style="height: 2rem; border-right: 1px solid var(--border3)"
                :style="cell.isOpen ? { borderRightWidth: '3px', borderRightColor: 'var(--border2)' } : {}"
                @pointerdown.prevent="onCellDown(string.stringIdx, cell.fret)"
                @pointerup="onCellUp(string.stringIdx, cell.fret)"
                @pointerleave="onCellUp(string.stringIdx, cell.fret)"
                @pointercancel="onCellUp(string.stringIdx, cell.fret)"
              >
                <span
                  v-if="cell.isActive"
                  class="neck-dot"
                  :class="{ root: cell.isRoot, anchor: cell.isAnchor && !cell.isRoot }"
                ></span>
              </div>
            </div>
            <div class="flex items-center mt-1">
              <div style="width: 1.8rem"></div>
              <div v-for="f in FRET_COUNT + 1" :key="f" class="flex-1 text-center text-tiny text-dim">
                {{ f - 1 === 0 ? '' : f - 1 }}
              </div>
            </div>
          </div>
        </div>
      </template>
    </ModeLayout>

    <ScaleLegend />

    <div class="flex items-center gap-2 mt-3 flex-wrap">
      <span class="text-tiny text-dim text-bold text-uppercase letter-spacing-wide mr-1">Notes</span>
      <span
        v-for="n in scaleNotes"
        :key="n.note"
        class="chip text-small text-bold"
        :style="n.isRoot ? { background: 'var(--rust-bg)', borderColor: 'var(--rust)', color: 'var(--rust-hi)' } : (n.isAnchor ? { background: 'var(--accent-bg)', borderColor: 'var(--accent-mid)', color: 'var(--accent)' } : {})"
      >{{ n.note }}</span>
    </div>
  </div>
</template>

<style scoped>
.bubble.active { background: var(--accent-bg); border-color: var(--accent); color: var(--accent); }

.pad {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 0.15rem; padding: 0.75rem 0.5rem; border-radius: 8px; border: 1px solid var(--border);
  aspect-ratio: 1; transition: background 0.15s, border-color 0.15s;
  user-select: none; touch-action: none; cursor: pointer;
}
.pad.inactive { background: var(--bg); opacity: 0.35; }
.pad.active   { background: var(--raised); border-color: var(--border2); }
.pad.anchor   { background: var(--accent-bg); border-color: var(--accent-mid); }
.pad.root     { background: var(--rust-bg); border-color: var(--rust); }
.pad.pressed  { background: var(--accent-bg); border-color: var(--accent); opacity: 1; }

.pad-label { font-size: 0.7rem; color: var(--text4); font-weight: 600; letter-spacing: 0.1em; }
.pad-note  { font-size: 1.5rem; font-weight: 700; line-height: 1; }
.pad-midi  { font-size: 0.6rem; color: var(--text5); letter-spacing: 0.03em; }

.pad.inactive .pad-note { color: var(--text5); }
.pad.active   .pad-note { color: var(--text2); }
.pad.anchor   .pad-note { color: var(--accent); }
.pad.root     .pad-note { color: var(--rust-hi); }
.pad.pressed  .pad-note { color: var(--accent); }

.chroma-tile {
  display: flex; align-items: center; justify-content: center;
  width: 3.2rem; height: 3.2rem; border-radius: 8px; border: 1px solid var(--border);
  transition: background 0.15s, border-color 0.15s; user-select: none; touch-action: none; cursor: pointer;
}
.chroma-tile.inactive { background: transparent; border-color: transparent; opacity: 0.4; }
.chroma-tile.active   { background: var(--raised); border-color: var(--border2); }
.chroma-tile.anchor   { background: var(--accent-bg); border-color: var(--accent-mid); }
.chroma-tile.root     { background: var(--rust-bg); border-color: var(--rust); }
.chroma-tile.pressed  { background: var(--accent-bg); border-color: var(--accent); opacity: 1; }

.tile-note { font-size: 1.1rem; font-weight: 700; line-height: 1; }
.chroma-tile.inactive .tile-note { color: var(--text5); }
.chroma-tile.active   .tile-note { color: var(--text2); }
.chroma-tile.anchor   .tile-note { color: var(--accent); }
.chroma-tile.root     .tile-note { color: var(--rust-hi); }
.chroma-tile.pressed  .tile-note { color: var(--accent); }

.neck-dot { width: 14px; height: 14px; border-radius: 50%; background: var(--text3); display: block; }
.neck-dot.anchor { background: var(--accent-lo); }
.neck-dot.root { background: var(--dot-root); box-shadow: 0 0 4px var(--rust-glow); }

@media (max-width: 600px) {
  .p-6 { padding: 1.25rem 1rem !important; }
  .pad-note { font-size: 1.2rem; }
}
@media (orientation: landscape) and (max-height: 500px) {
  .p-6 { padding: 0.75rem 1rem !important; }
}
</style>
