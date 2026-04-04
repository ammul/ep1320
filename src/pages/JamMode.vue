<script setup>
import { ref, computed } from 'vue'
import { displayMode } from '@/state/displayMode.js'
import { padCols as cols } from '@/state/padSize.js'
import { NOTES, SHARPS, NOTE_TO_SEMI } from '@/constants/musicConstants.js'
import { buildGuitarNeck, sliceRows } from '@/utils/musicUtils.js'
import { activeInputNotes, midiStatus } from '@/audio/midiManager.js'
import { octave } from '@/state/octave.js'
import { useNotePlayback } from '@/composables/useNotePlayback.js'
import PianoOctave from '@/components/music/PianoOctave.vue'
import ScaleLegend from '@/components/music/ScaleLegend.vue'
import RootNotePicker from '@/components/music/RootNotePicker.vue'
import ModeLayout from '@/components/layout/ModeLayout.vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import PickerRow from '@/components/ui/PickerRow.vue'
import ScaleSelector from '@/components/jam/ScaleSelector.vue'
import OctaveControl from '@/components/jam/OctaveControl.vue'
import GuitarNeck from '@/components/music/GuitarNeck.vue'
import { JAM_SCALES as SCALES } from '@/constants/scales.js'

// Semitone offsets from root considered "anchor" notes (root, minor 3rd, major 3rd, 5th)
const ANCHOR_OFFSETS = new Set([0, 3, 4, 7])

const selectedRoot    = ref('A')
const selectedScaleId = ref('mi.p')
const showInfo        = ref(false)
const pianoOctave     = ref(4)

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

function padMidi(noteIndex, oct) {
  return 12 * (oct + 1) + NOTE_TO_SEMI[noteIndex]
}

function onPadDown(noteIndex, octaveOffset = 0) { pressDown(12 * (octave.value + 1 + octaveOffset) + NOTE_TO_SEMI[noteIndex]) }
function onPadUp(noteIndex, octaveOffset = 0)   { pressUp(12 * (octave.value + 1 + octaveOffset) + NOTE_TO_SEMI[noteIndex]) }

function onCellDown(stringIdx, fret) { pressDown(STRING_BASE_MIDI[stringIdx] + fret) }
function onCellUp(stringIdx, fret)   { pressUp(STRING_BASE_MIDI[stringIdx] + fret) }

function onPianoToggle(noteIdx) { pressToggle(padMidi(noteIdx, pianoOctave.value)) }
</script>

<template>
  <div class="jam-mode">
    <PageHeader title="Jam Mode" :subtitle="subtitle" />

    <div class="controls">
      <PickerRow label="Key">
        <RootNotePicker v-model="selectedRoot" />
      </PickerRow>

      <PickerRow label="Scale">
        <ScaleSelector
          v-model="selectedScaleId"
          :scales="SCALES"
          v-model:showInfo="showInfo"
        />
      </PickerRow>

      <PickerRow label="Octave">
        <OctaveControl v-model="pianoOctave" :min="1" :max="7" />
      </PickerRow>
    </div>

    <ModeLayout>
      <template #pad>
        <div class="grid">
          <div class="row" v-for="(row, ri) in rows" :key="ri" :style="{ gridTemplateColumns: `repeat(${row.length}, 1fr)` }">
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
        <div class="chroma-strip">
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
          :showOctaveSelector="false"
          :dimInactive="true"
          :clickable="true"
          @toggle="onPianoToggle"
        />
      </template>

      <template #guitar>
        <GuitarNeck
          :strings="guitarNeck"
          :cell-class="cell => ({ active: cell.isActive, root: cell.isRoot })"
          @cell-down="onCellDown"
          @cell-up="onCellUp"
        >
          <template #cell="{ cell }">
            <span
              v-if="cell.isActive"
              class="neck-dot"
              :class="{ root: cell.isRoot, anchor: cell.isAnchor && !cell.isRoot }"
            ></span>
          </template>
        </GuitarNeck>
      </template>
    </ModeLayout>

    <ScaleLegend />

    <div class="scale-notes">
      <span class="scale-label">Notes</span>
      <span
        v-for="n in scaleNotes"
        :key="n.note"
        class="scale-note"
        :class="{ root: n.isRoot, anchor: n.isAnchor && !n.isRoot }"
      >{{ n.note }}</span>
    </div>
  </div>
</template>

<style scoped>
.jam-mode {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 2rem;
}

.controls {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  margin: 1.5rem 0;
}

/* Pad grid */
.grid {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  max-width: 420px;
  margin: 0 auto;
}

.row {
  display: grid;
  gap: 0.6rem;
}

.pad {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.15rem;
  padding: 0.75rem 0.5rem;
  border-radius: 8px;
  border: 1px solid var(--border);
  aspect-ratio: 1;
  transition: background 0.15s, border-color 0.15s;
  user-select: none;
  touch-action: none;
  cursor: pointer;
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

/* Notes mode */
.chroma-strip {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.chroma-tile {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3.2rem;
  height: 3.2rem;
  border-radius: 8px;
  border: 1px solid var(--border);
  transition: background 0.15s, border-color 0.15s;
  user-select: none;
  touch-action: none;
  cursor: pointer;
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

/* Guitar neck dots (page-specific) */
.neck-dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--text3);
  display: block;
}

.neck-dot.anchor {
  background: var(--accent-lo);
}

.neck-dot.root {
  background: var(--dot-root);
  box-shadow: 0 0 4px var(--rust-glow);
}

/* Scale notes strip */
.scale-notes {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.75rem;
  flex-wrap: wrap;
}

.scale-label {
  font-size: 0.75rem;
  color: var(--text4);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-right: 0.25rem;
}

.scale-note {
  padding: 0.25rem 0.6rem;
  border-radius: 4px;
  background: var(--raised);
  border: 1px solid var(--border2);
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text2);
}

.scale-note.anchor {
  background: var(--accent-bg);
  border-color: var(--accent-mid);
  color: var(--accent);
}

.scale-note.root {
  background: var(--rust-bg);
  border-color: var(--rust);
  color: var(--rust-hi);
}

@media (max-width: 600px) {
  .jam-mode {
    padding: 1.25rem 1rem;
  }

  .pad-note {
    font-size: 1.2rem;
  }
}

@media (orientation: landscape) and (max-height: 500px) {
  .jam-mode {
    padding: 0.75rem 1rem;
  }

  .controls {
    margin: 0.5rem 0;
    gap: 0.5rem;
  }

  .scale-notes {
    margin-top: 0.5rem;
  }
}
</style>
