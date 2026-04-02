import { describe, it, expect } from 'vitest'
import { detectChord } from './chordDetect.js'
import { NOTES, NOTE_TO_SEMI } from '../constants/musicConstants.js'

// Helper: given note names, return A-based indices
function noteIndices(...names) {
  return names.map(n => NOTES.indexOf(n))
}

// Helper: C major in A-based indices = C(3), E(5), G(10) - wait, let's compute properly
// NOTES = ['A','A#','B','C','C#','D','D#','E','F','F#','G','G#']
// C=3, E=7 (wait: A=0,A#=1,B=2,C=3,C#=4,D=5,D#=6,E=7,F=8,F#=9,G=10,G#=11)

describe('detectChord', () => {
  describe('single note input', () => {
    it('returns null for a single note', () => {
      expect(detectChord([3])).toBeNull() // C alone
    })
  })

  describe('two note input', () => {
    it('detects power chord (C5: C + G)', () => {
      const result = detectChord(noteIndices('C', 'G'))
      expect(result).not.toBeNull()
      expect(result.suffix).toBe('5')
    })

    it('returns null for an unrecognized two-note interval', () => {
      // C + C# = semitone apart, no chord type matches
      expect(detectChord(noteIndices('C', 'C#'))).toBeNull()
    })
  })

  describe('major chords', () => {
    it('detects C major', () => {
      const result = detectChord(noteIndices('C', 'E', 'G'))
      expect(result).not.toBeNull()
      expect(result.root).toBe('C')
      expect(result.suffix).toBe('')
      expect(result.name).toBe('Major')
      expect(result.inversion).toBe('')
    })

    it('detects A major', () => {
      const result = detectChord(noteIndices('A', 'C#', 'E'))
      expect(result).not.toBeNull()
      expect(result.root).toBe('A')
      expect(result.suffix).toBe('')
    })

    it('detects G major', () => {
      const result = detectChord(noteIndices('G', 'B', 'D'))
      expect(result).not.toBeNull()
      expect(result.root).toBe('G')
      expect(result.suffix).toBe('')
    })
  })

  describe('minor chords', () => {
    it('detects A minor', () => {
      const result = detectChord(noteIndices('A', 'C', 'E'))
      expect(result).not.toBeNull()
      expect(result.root).toBe('A')
      expect(result.suffix).toBe('m')
      expect(result.name).toBe('Minor')
    })

    it('detects D minor', () => {
      const result = detectChord(noteIndices('D', 'F', 'A'))
      expect(result).not.toBeNull()
      expect(result.root).toBe('D')
      expect(result.suffix).toBe('m')
    })
  })

  describe('diminished chords', () => {
    it('detects B diminished', () => {
      const result = detectChord(noteIndices('B', 'D', 'F'))
      expect(result).not.toBeNull()
      expect(result.root).toBe('B')
      expect(result.suffix).toBe('°')
      expect(result.name).toBe('Diminished')
    })
  })

  describe('augmented chords', () => {
    it('detects C augmented', () => {
      const result = detectChord(noteIndices('C', 'E', 'G#'))
      expect(result).not.toBeNull()
      expect(result.root).toBe('C')
      expect(result.suffix).toBe('+')
      expect(result.name).toBe('Augmented')
    })
  })

  describe('seventh chords', () => {
    it('detects G dominant 7th', () => {
      const result = detectChord(noteIndices('G', 'B', 'D', 'F'))
      expect(result).not.toBeNull()
      expect(result.root).toBe('G')
      expect(result.suffix).toBe('7')
      expect(result.name).toBe('Dominant 7th')
    })

    it('detects C major 7th', () => {
      const result = detectChord(noteIndices('C', 'E', 'G', 'B'))
      expect(result).not.toBeNull()
      expect(result.root).toBe('C')
      expect(result.suffix).toBe('maj7')
      expect(result.name).toBe('Major 7th')
    })

    it('detects C minor 7th', () => {
      // Cm7 = C, D#, G, A# - C (semi 0) is lowest, so root position is unambiguous
      const result = detectChord(noteIndices('C', 'D#', 'G', 'A#'))
      expect(result).not.toBeNull()
      expect(result.root).toBe('C')
      expect(result.suffix).toBe('m7')
      expect(result.name).toBe('Minor 7th')
    })
  })

  describe('inversions', () => {
    it('detects B minor inversion (B D F# - D is lowest semitone)', () => {
      // Bm = B(semi 11), D(semi 2), F#(semi 6)
      // Sorted semis: [2, 6, 11] - D is lowest, but root is B → inversion /D
      const result = detectChord(noteIndices('B', 'D', 'F#'))
      expect(result).not.toBeNull()
      expect(result.root).toBe('B')
      expect(result.suffix).toBe('m')
      expect(result.inversion).toBe('/D')
      expect(result.display).toContain('/D')
    })

    it('root position chord has empty inversion string', () => {
      const result = detectChord(noteIndices('C', 'E', 'G'))
      expect(result.inversion).toBe('')
    })
  })

  describe('unrecognized note combinations', () => {
    it('returns null for notes with no matching chord type', () => {
      // C, C#, D - chromatic cluster, not a chord
      expect(detectChord(noteIndices('C', 'C#', 'D'))).toBeNull()
    })

    it('returns null for empty input', () => {
      expect(detectChord([])).toBeNull()
    })
  })

  describe('duplicate note indices', () => {
    it('treats duplicate semitones as one note (C major octave doubled)', () => {
      // C=3, E=7, G=10, C=3 - duplicate C
      const result = detectChord([3, 7, 10, 3])
      expect(result).not.toBeNull()
      expect(result.root).toBe('C')
      expect(result.suffix).toBe('')
    })
  })

  describe('all 12 roots produce major chords', () => {
    // major intervals: 0, 4, 7 semitones from root (C-based)
    it('detects major chord for every root note', () => {
      for (let rootSemi = 0; rootSemi < 12; rootSemi++) {
        const third = (rootSemi + 4) % 12
        const fifth = (rootSemi + 7) % 12
        // Convert C-based semis back to A-based indices
        const NOTE_TO_SEMI = [9, 10, 11, 0, 1, 2, 3, 4, 5, 6, 7, 8]
        const SEMI_TO_A = Array(12)
        NOTE_TO_SEMI.forEach((s, i) => { SEMI_TO_A[s] = i })
        const indices = [SEMI_TO_A[rootSemi], SEMI_TO_A[third], SEMI_TO_A[fifth]]
        const result = detectChord(indices)
        expect(result).not.toBeNull()
        expect(result.suffix).toBe('')
      }
    })
  })
})
