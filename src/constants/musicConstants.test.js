import { describe, it, expect } from 'vitest'
import {
  NOTES, LABELS, SHARPS, CHORD_TYPES, CHORD_SUFFIX,
  FLAT_MAP, OPEN_STRINGS, STRING_NAMES, FRET_COUNT,
  NOTE_TO_SEMI, SEMI_TO_NAME, CHORD_DETECT_TYPES,
  PIANO_WHITE, PIANO_BLACK,
} from '@/constants/musicConstants.js'

describe('NOTES', () => {
  it('has exactly 12 entries', () => {
    expect(NOTES).toHaveLength(12)
  })

  it('starts with A', () => {
    expect(NOTES[0]).toBe('A')
  })

  it('contains only expected notes', () => {
    expect(NOTES).toEqual(['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#'])
  })
})

describe('LABELS', () => {
  it('has exactly 12 entries', () => {
    expect(LABELS).toHaveLength(12)
  })
})

describe('SHARPS', () => {
  it('is a Set', () => {
    expect(SHARPS).toBeInstanceOf(Set)
  })

  it('contains only sharp notes from NOTES', () => {
    for (const s of SHARPS) {
      expect(NOTES).toContain(s)
      expect(s).toContain('#')
    }
  })

  it('has exactly 5 sharps', () => {
    expect(SHARPS.size).toBe(5)
  })
})

describe('NOTE_TO_SEMI and SEMI_TO_NAME', () => {
  it('NOTE_TO_SEMI has 12 entries', () => {
    expect(NOTE_TO_SEMI).toHaveLength(12)
  })

  it('SEMI_TO_NAME has 12 entries', () => {
    expect(SEMI_TO_NAME).toHaveLength(12)
  })

  it('round-trips A-based index → semi → name for all 12 notes', () => {
    for (let i = 0; i < 12; i++) {
      const semi = NOTE_TO_SEMI[i]
      expect(semi).toBeGreaterThanOrEqual(0)
      expect(semi).toBeLessThan(12)
      const name = SEMI_TO_NAME[semi]
      expect(name).toBe(NOTES[i])
    }
  })

  it('NOTE_TO_SEMI values are all unique', () => {
    const uniq = new Set(NOTE_TO_SEMI)
    expect(uniq.size).toBe(12)
  })

  it('A (index 0) maps to semitone 9 (C-based)', () => {
    expect(NOTE_TO_SEMI[0]).toBe(9)
  })

  it('C (index 3) maps to semitone 0 (C-based)', () => {
    expect(NOTE_TO_SEMI[3]).toBe(0)
  })
})

describe('CHORD_TYPES intervals', () => {
  it('major = [0, 4, 7]', () => {
    expect(CHORD_TYPES.maj).toEqual([0, 4, 7])
  })

  it('minor = [0, 3, 7]', () => {
    expect(CHORD_TYPES.min).toEqual([0, 3, 7])
  })

  it('diminished = [0, 3, 6]', () => {
    expect(CHORD_TYPES.dim).toEqual([0, 3, 6])
  })

  it('augmented = [0, 4, 8]', () => {
    expect(CHORD_TYPES.aug).toEqual([0, 4, 8])
  })

  it('dominant 7th = [0, 4, 7, 10]', () => {
    expect(CHORD_TYPES.dom7).toEqual([0, 4, 7, 10])
  })

  it('major 7th = [0, 4, 7, 11]', () => {
    expect(CHORD_TYPES.maj7).toEqual([0, 4, 7, 11])
  })

  it('minor 7th = [0, 3, 7, 10]', () => {
    expect(CHORD_TYPES.min7).toEqual([0, 3, 7, 10])
  })

  it('sus4 = [0, 5, 7]', () => {
    expect(CHORD_TYPES.sus4).toEqual([0, 5, 7])
  })

  it('all chord types start with 0', () => {
    for (const intervals of Object.values(CHORD_TYPES)) {
      expect(intervals[0]).toBe(0)
    }
  })
})

describe('CHORD_SUFFIX', () => {
  it('major suffix is empty string', () => {
    expect(CHORD_SUFFIX.maj).toBe('')
  })

  it('has a suffix for every CHORD_TYPES key', () => {
    for (const key of Object.keys(CHORD_TYPES)) {
      expect(CHORD_SUFFIX).toHaveProperty(key)
    }
  })
})

describe('FLAT_MAP', () => {
  it('maps flats to sharps', () => {
    expect(FLAT_MAP.Ab).toBe('G#')
    expect(FLAT_MAP.Bb).toBe('A#')
    expect(FLAT_MAP.Db).toBe('C#')
    expect(FLAT_MAP.Eb).toBe('D#')
    expect(FLAT_MAP.Gb).toBe('F#')
  })

  it('all mapped values are in NOTES', () => {
    for (const val of Object.values(FLAT_MAP)) {
      expect(NOTES).toContain(val)
    }
  })
})

describe('OPEN_STRINGS', () => {
  it('has exactly 6 entries (one per guitar string)', () => {
    expect(OPEN_STRINGS).toHaveLength(6)
  })

  it('all indices are valid A-based note indices (0–11)', () => {
    for (const idx of OPEN_STRINGS) {
      expect(idx).toBeGreaterThanOrEqual(0)
      expect(idx).toBeLessThan(12)
    }
  })

  it('standard tuning: E A D G B E (A-based indices 7 0 5 10 2 7)', () => {
    expect(OPEN_STRINGS).toEqual([7, 0, 5, 10, 2, 7])
  })
})

describe('STRING_NAMES', () => {
  it('has exactly 6 entries', () => {
    expect(STRING_NAMES).toHaveLength(6)
  })

  it('matches standard guitar string names', () => {
    expect(STRING_NAMES).toEqual(['E', 'A', 'D', 'G', 'B', 'e'])
  })
})

describe('FRET_COUNT', () => {
  it('is 7', () => {
    expect(FRET_COUNT).toBe(7)
  })
})

describe('CHORD_DETECT_TYPES', () => {
  it('is an array', () => {
    expect(Array.isArray(CHORD_DETECT_TYPES)).toBe(true)
  })

  it('every entry has intervals, suffix, and name', () => {
    for (const type of CHORD_DETECT_TYPES) {
      expect(type).toHaveProperty('intervals')
      expect(type).toHaveProperty('suffix')
      expect(type).toHaveProperty('name')
    }
  })

  it('every intervals array starts with 0', () => {
    for (const type of CHORD_DETECT_TYPES) {
      expect(type.intervals[0]).toBe(0)
    }
  })

  it('all interval values are in range 0–11', () => {
    for (const type of CHORD_DETECT_TYPES) {
      for (const v of type.intervals) {
        expect(v).toBeGreaterThanOrEqual(0)
        expect(v).toBeLessThan(12)
      }
    }
  })

  it('includes major, minor, diminished, augmented entries', () => {
    const names = CHORD_DETECT_TYPES.map(t => t.name)
    expect(names).toContain('Major')
    expect(names).toContain('Minor')
    expect(names).toContain('Diminished')
    expect(names).toContain('Augmented')
  })
})

describe('PIANO_WHITE', () => {
  it('has 7 entries (C D E F G A B)', () => {
    expect(PIANO_WHITE).toHaveLength(7)
  })

  it('all indices are valid A-based note indices', () => {
    for (const idx of PIANO_WHITE) {
      expect(idx).toBeGreaterThanOrEqual(0)
      expect(idx).toBeLessThan(12)
    }
  })
})

describe('PIANO_BLACK', () => {
  it('has 5 entries (the 5 black keys)', () => {
    expect(PIANO_BLACK).toHaveLength(5)
  })

  it('every entry has noteIdx and after', () => {
    for (const key of PIANO_BLACK) {
      expect(key).toHaveProperty('noteIdx')
      expect(key).toHaveProperty('after')
    }
  })
})
