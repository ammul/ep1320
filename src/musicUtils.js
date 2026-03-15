import { NOTES, LABELS, SHARPS, OPEN_STRINGS, STRING_NAMES, FRET_COUNT } from './musicConstants.js'

// Build 4×3 numpad-layout rows from a set of active pad indices.
// Row order top→bottom maps to high→low pitch: [9-11], [6-8], [3-5], [0-2]
export function buildRows(activeSet, rootPad) {
  const pads = NOTES.map((note, i) => ({
    label: LABELS[i],
    note,
    isSharp: SHARPS.has(note),
    isActive: activeSet.has(i),
    isRoot: i === rootPad,
  }))
  return [
    pads.slice(9, 12),
    pads.slice(6, 9),
    pads.slice(3, 6),
    pads.slice(0, 3),
  ]
}

// Slice a 12-element pads array into 4 rows (top→bottom: [9-11], [6-8], [3-5], [0-2]).
export function sliceRows(pads) {
  return [
    pads.slice(9, 12),
    pads.slice(6, 9),
    pads.slice(3, 6),
    pads.slice(0, 3),
  ]
}

// Build guitar neck data (6 strings, displayed high→low: e B G D A E).
// cellExtras(noteIdx) → object of extra properties merged into each cell.
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
