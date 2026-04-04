export const CHORD_TYPES = [
  {
    chord: 'Major chord',
    def:   'Bright, resolved. Root + major 3rd (4 semitones) + 5th (7 semitones).',
    itvs:  [0, 4, 7],
  },
  {
    chord: 'Minor chord',
    def:   'Dark, emotional. Like major but the 3rd is flattened by one semitone (3 semitones).',
    itvs:  [0, 3, 7],
  },
  {
    chord: 'Dominant 7th',
    def:   'Tense, bluesy. A major chord with a flattened 7th (10 semitones) added — wants to resolve.',
    itvs:  [0, 4, 7, 10],
  },
]

export const IMPROV_CHORD_TYPES = [
  {
    chord: 'Major chord',
    itvs:  [0, 4, 7],
    scales: [
      { name:'Major pentatonic', desc:'always safe' },
      { name:'Major scale',      desc:'full palette' },
      { name:'Mixolydian',       desc:'bluesy edge' },
    ],
  },
  {
    chord: 'Minor chord',
    itvs:  [0, 3, 7],
    scales: [
      { name:'Minor pentatonic', desc:'easy, no clashes' },
      { name:'Natural minor',    desc:'dark and expressive' },
      { name:'Dorian',           desc:'soulful minor' },
    ],
  },
  {
    chord: 'Dominant 7th',
    itvs:  [0, 4, 7, 10],
    scales: [
      { name:'Mixolydian',   desc:'natural match' },
      { name:'Blues scale',  desc:'gritty tension' },
    ],
  },
]

export const IMPROV_EXAMPLES = [
  {
    chordSemi: [0, 4, 7],
    goodNotes: [
      { semi: 2,  name: 'D',  why: 'Major 2nd — stepwise, bright' },
      { semi: 9,  name: 'A',  why: 'Major 6th — warm, uplifting' },
    ],
    badNotes: [
      { semi: 1,  name: 'C#', why: 'Minor 2nd — clashes immediately' },
      { semi: 3,  name: 'Eb', why: 'Minor 3rd — fights the major sound' },
    ],
  },
  {
    chordSemi: [0, 3, 7],
    goodNotes: [
      { semi: 3,  name: 'Eb', why: 'Minor 3rd — chord tone, dark' },
      { semi: 10, name: 'Bb', why: 'Minor 7th — Dorian/natural minor' },
    ],
    badNotes: [
      { semi: 4,  name: 'E',  why: 'Major 3rd — fights the minor 3rd' },
      { semi: 11, name: 'B',  why: 'Major 7th — ugly clash with Bb' },
    ],
  },
  {
    chordSemi: [0, 4, 7, 10],
    goodNotes: [
      { semi: 10, name: 'Bb', why: 'Minor 7th — the defining note' },
      { semi: 5,  name: 'F',  why: 'Perfect 4th — Mixolydian home' },
    ],
    badNotes: [
      { semi: 11, name: 'B',  why: 'Major 7th — contradicts the ♭7' },
      { semi: 6,  name: 'F#', why: 'Tritone — maximum tension' },
    ],
  },
]
