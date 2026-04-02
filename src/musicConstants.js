// Chromatic scale starting from A (A-based index 0-11)
export const NOTES  = ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#']
export const LABELS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']
export const SHARPS = new Set(['A#', 'C#', 'D#', 'F#', 'G#'])

// Chord type interval arrays (semitones from root)
export const CHORD_TYPES = {
  maj:  [0, 4, 7],
  min:  [0, 3, 7],
  dim:  [0, 3, 6],
  aug:  [0, 4, 8],
  dom7: [0, 4, 7, 10],
  maj7: [0, 4, 7, 11],
  min7: [0, 3, 7, 10],
  sus4: [0, 5, 7],
}

export const CHORD_SUFFIX = {
  maj: '', min: 'm', dim: '°', aug: '+',
  dom7: '7', maj7: 'maj7', min7: 'm7', sus4: 'sus4',
}

// Chord types for detection (array format with name/suffix metadata)
export const CHORD_DETECT_TYPES = [
  { intervals: [0, 7],           suffix: '5',     name: 'Power chord' },
  { intervals: [0, 4, 7],        suffix: '',       name: 'Major' },
  { intervals: [0, 3, 7],        suffix: 'm',      name: 'Minor' },
  { intervals: [0, 3, 6],        suffix: '°',      name: 'Diminished' },
  { intervals: [0, 4, 8],        suffix: '+',      name: 'Augmented' },
  { intervals: [0, 2, 7],        suffix: 'sus2',   name: 'Sus2' },
  { intervals: [0, 5, 7],        suffix: 'sus4',   name: 'Sus4' },
  { intervals: [0, 4, 7, 9],     suffix: '6',      name: 'Major 6th' },
  { intervals: [0, 3, 7, 9],     suffix: 'm6',     name: 'Minor 6th' },
  { intervals: [0, 4, 7, 10],    suffix: '7',      name: 'Dominant 7th' },
  { intervals: [0, 4, 7, 11],    suffix: 'maj7',   name: 'Major 7th' },
  { intervals: [0, 3, 7, 10],    suffix: 'm7',     name: 'Minor 7th' },
  { intervals: [0, 3, 6, 10],    suffix: 'm7♭5',  name: 'Half-diminished 7th' },
  { intervals: [0, 3, 6, 9],     suffix: '°7',     name: 'Diminished 7th' },
  { intervals: [0, 4, 7, 10, 2], suffix: '9',      name: 'Dominant 9th' },
  { intervals: [0, 4, 7, 11, 2], suffix: 'maj9',   name: 'Major 9th' },
  { intervals: [0, 3, 7, 10, 2], suffix: 'm9',     name: 'Minor 9th' },
]

// Flat -> sharp enharmonic equivalents
export const FLAT_MAP = { Ab: 'G#', Bb: 'A#', Cb: 'B', Db: 'C#', Eb: 'D#', Fb: 'E', Gb: 'F#' }

// Guitar standard tuning: open string note indices (E2, A2, D3, G3, B3, E4)
export const OPEN_STRINGS = [7, 0, 5, 10, 2, 7]
export const STRING_NAMES = ['E', 'A', 'D', 'G', 'B', 'e']
export const FRET_COUNT = 12

// Semitone conversion: A-based index (0-11) <-> C-based semitone (0-11)
export const NOTE_TO_SEMI = [9, 10, 11, 0, 1, 2, 3, 4, 5, 6, 7, 8]
export const SEMI_TO_NAME = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

// Piano keyboard layout (C-based display order, A-based note indices)
export const PIANO_WHITE = [3, 5, 7, 8, 10, 0, 2] // C D E F G A B
// after = number of white keys to the left (used to compute left% position)
export const PIANO_BLACK = [
  { noteIdx: 4,  after: 1 }, // C#
  { noteIdx: 6,  after: 2 }, // D#
  { noteIdx: 9,  after: 4 }, // F#
  { noteIdx: 11, after: 5 }, // G#
  { noteIdx: 1,  after: 6 }, // A#
]
