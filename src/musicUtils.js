import { NOTES, LABELS, SHARPS, OPEN_STRINGS, STRING_NAMES, FRET_COUNT } from './musicConstants.js'

// Build a 4xN pad grid from a set of active note indices.
// cols=3 gives 4x3 (12 pads), cols=4 gives 4x4 (16 pads).
// Row order top->bottom maps to high->low pitch.
// Pads beyond index 11 wrap around the chromatic octave with octaveOffset=1.
export function buildRows(activeSet, rootPad, cols = 3) {
  const total = 4 * cols
  const pads = Array.from({ length: total }, (_, i) => {
    const noteIdx = i % 12
    return {
      label:        String(i + 1),
      note:         NOTES[noteIdx],
      noteIndex:    noteIdx,
      octaveOffset: Math.floor(i / 12),
      isSharp:      SHARPS.has(NOTES[noteIdx]),
      isActive:     activeSet.has(noteIdx),
      isRoot:       noteIdx === rootPad,
    }
  })
  const rows = []
  for (let r = 3; r >= 0; r--) {
    rows.push(pads.slice(r * cols, (r + 1) * cols))
  }
  return rows
}

// Slice a pre-built pads array into 4 rows (top->bottom: high->low pitch).
export function sliceRows(pads, cols = 3) {
  const rows = []
  for (let r = 3; r >= 0; r--) {
    rows.push(pads.slice(r * cols, (r + 1) * cols))
  }
  return rows
}

// Build guitar neck data (6 strings, displayed high->low: e B G D A E).
// cellExtras(noteIdx) -> object of extra properties merged into each cell.
export function buildGuitarNeck(cellExtras) {
  const neck = []
  for (let s = 5; s >= 0; s--) {
    const cells = []
    for (let f = 0; f <= FRET_COUNT; f++) {
      const noteIdx = (OPEN_STRINGS[s] + f) % 12
      cells.push({
        noteIdx,
        note: NOTES[noteIdx],
        fret: f,
        isOpen: f === 0,
        ...cellExtras(noteIdx),
      })
    }
    neck.push({ stringIdx: s, name: STRING_NAMES[s], cells })
  }
  return neck
}
