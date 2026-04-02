import { describe, it, expect } from 'vitest'
import { buildRows, sliceRows, buildGuitarNeck } from './musicUtils.js'
import { NOTES, OPEN_STRINGS, FRET_COUNT } from './musicConstants.js'

describe('buildRows', () => {
  it('returns 4 rows', () => {
    const rows = buildRows(new Set(), 0)
    expect(rows).toHaveLength(4)
  })

  it('each row has 3 pads', () => {
    const rows = buildRows(new Set(), 0)
    for (const row of rows) {
      expect(row).toHaveLength(3)
    }
  })

  it('top row contains pad indices 9, 10, 11 (G#, A, A# order)', () => {
    const rows = buildRows(new Set(), 0)
    expect(rows[0][0].note).toBe(NOTES[9])
    expect(rows[0][1].note).toBe(NOTES[10])
    expect(rows[0][2].note).toBe(NOTES[11])
  })

  it('bottom row contains pad indices 0, 1, 2 (A, A#, B order)', () => {
    const rows = buildRows(new Set(), 0)
    expect(rows[3][0].note).toBe(NOTES[0])
    expect(rows[3][1].note).toBe(NOTES[1])
    expect(rows[3][2].note).toBe(NOTES[2])
  })

  it('marks active pads correctly', () => {
    const rows = buildRows(new Set([0, 3, 9]), 0)
    // index 0 is bottom-left (row 3, col 0)
    expect(rows[3][0].isActive).toBe(true)
    // index 3 is row 2, col 0
    expect(rows[2][0].isActive).toBe(true)
    // index 9 is top-left (row 0, col 0)
    expect(rows[0][0].isActive).toBe(true)
    // index 1 should not be active
    expect(rows[3][1].isActive).toBe(false)
  })

  it('marks root pad correctly', () => {
    const rows = buildRows(new Set(), 5)
    // index 5 is in row 2 (indices 3-5), col 2
    expect(rows[2][2].isRoot).toBe(true)
    // others should not be root
    expect(rows[0][0].isRoot).toBe(false)
  })

  it('works with empty activeSet', () => {
    const rows = buildRows(new Set(), 0)
    for (const row of rows) {
      for (const pad of row) {
        expect(pad.isActive).toBe(false)
      }
    }
  })

  it('rootPad 0 marks bottom-left pad as root', () => {
    const rows = buildRows(new Set(), 0)
    expect(rows[3][0].isRoot).toBe(true)
  })

  it('rootPad 11 marks top-right pad as root', () => {
    const rows = buildRows(new Set(), 11)
    expect(rows[0][2].isRoot).toBe(true)
  })

  it('each pad has note, label, isSharp, isActive, isRoot properties', () => {
    const rows = buildRows(new Set(), 0)
    const pad = rows[0][0]
    expect(pad).toHaveProperty('note')
    expect(pad).toHaveProperty('label')
    expect(pad).toHaveProperty('isSharp')
    expect(pad).toHaveProperty('isActive')
    expect(pad).toHaveProperty('isRoot')
  })
})

describe('sliceRows', () => {
  it('returns 4 rows from a 12-element array', () => {
    const pads = Array.from({ length: 12 }, (_, i) => ({ i }))
    const rows = sliceRows(pads)
    expect(rows).toHaveLength(4)
  })

  it('top row is indices 9–11', () => {
    const pads = Array.from({ length: 12 }, (_, i) => ({ i }))
    const rows = sliceRows(pads)
    expect(rows[0].map(p => p.i)).toEqual([9, 10, 11])
  })

  it('bottom row is indices 0–2', () => {
    const pads = Array.from({ length: 12 }, (_, i) => ({ i }))
    const rows = sliceRows(pads)
    expect(rows[3].map(p => p.i)).toEqual([0, 1, 2])
  })
})

describe('buildGuitarNeck', () => {
  const neck = buildGuitarNeck(() => ({}))

  it('returns 6 strings', () => {
    expect(neck).toHaveLength(6)
  })

  it('each string has FRET_COUNT + 1 cells (open + 7 frets)', () => {
    for (const string of neck) {
      expect(string.cells).toHaveLength(FRET_COUNT + 1)
    }
  })

  it('first cell of each string is the open note', () => {
    for (const string of neck) {
      expect(string.cells[0].isOpen).toBe(true)
      expect(string.cells[0].fret).toBe(0)
    }
  })

  it('open string notes match OPEN_STRINGS (displayed high→low: indices 5→0)', () => {
    for (let s = 5; s >= 0; s--) {
      const displayIdx = 5 - s
      const openCell = neck[displayIdx].cells[0]
      expect(openCell.noteIdx).toBe(OPEN_STRINGS[s])
      expect(openCell.note).toBe(NOTES[OPEN_STRINGS[s]])
    }
  })

  it('notes advance chromatically along each string', () => {
    for (const string of neck) {
      const openNote = string.cells[0].noteIdx
      for (let f = 0; f <= FRET_COUNT; f++) {
        expect(string.cells[f].noteIdx).toBe((openNote + f) % 12)
      }
    }
  })

  it('merges extra properties from cellExtras', () => {
    const neckWithExtras = buildGuitarNeck(noteIdx => ({ testProp: noteIdx * 2 }))
    const cell = neckWithExtras[0].cells[0]
    expect(cell).toHaveProperty('testProp')
    expect(cell.testProp).toBe(cell.noteIdx * 2)
  })

  it('each string has stringIdx and name', () => {
    for (const string of neck) {
      expect(string).toHaveProperty('stringIdx')
      expect(string).toHaveProperty('name')
    }
  })
})
