export const JAM_SCALES = [
  {
    id: 'mi.p',
    label: 'mi.p - Minor Pentatonic',
    intervals: [0, 3, 5, 7, 10],
    description: 'The most forgiving scale for improv. 5 notes, zero clashes - every one works over almost any minor chord or progression. Start here if you\'re new to soloing.',
  },
  {
    id: 'ma.p',
    label: 'ma.p - Major Pentatonic',
    intervals: [0, 2, 4, 7, 9],
    description: '5 open, consonant notes that sound good over almost any major chord. Bright and uplifting - nothing feels out of place. Great for country, pop, and folk melodies.',
  },
  {
    id: 'min',
    label: 'min - Minor (Natural)',
    intervals: [0, 2, 3, 5, 7, 8, 10],
    description: 'Minor pentatonic with 2 extra notes, adding more colour and expression. Dark and emotional. A couple of notes need more care - avoid landing on the 2nd or 6th for too long.',
  },
  {
    id: 'maj',
    label: 'maj - Major (Ionian)',
    intervals: [0, 2, 4, 5, 7, 9, 11],
    description: 'Major pentatonic with 2 extra notes, giving more melodic options. Bright and resolved. The 4th can sound slightly tense if held - use it as a passing note.',
  },
  {
    id: 'dor',
    label: 'dor - Dorian',
    intervals: [0, 2, 3, 5, 7, 9, 10],
    description: 'Minor but slightly brighter - a raised 6th gives it a soulful, funky edge. Works well over minor chord jams. Think Santana, Oye Como Va, or modal jazz leads.',
  },
  {
    id: 'mix',
    label: 'mix - Mixolydian',
    intervals: [0, 2, 4, 5, 7, 9, 10],
    description: 'Major with a bluesy, unresolved edge - the flat 7th adds a rock and roll feel. Works perfectly over dominant 7th chords or a classic rock jam.',
  },
  {
    id: 'chr',
    label: 'chr - Chromatic',
    intervals: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
    description: 'All 12 notes - no filtering. Every note is available. Useful for playing chromatically or sending any MIDI note to a connected device.',
  },
]

export const VISUALIZER_SCALES = [
  { id: '12t',  label: '12T - Chromatic',         intervals: [0,1,2,3,4,5,6,7,8,9,10,11], description: 'All 12 semitones. No inherent tonality - every key plays, nothing is highlighted. Useful for atonal passages or when you want full chromatic access.' },
  { id: 'maj',  label: 'maj - Major (Ionian)',     intervals: [0,2,4,5,7,9,11],             description: 'The familiar "happy" scale. Bright, stable, and resolved. The default western scale - works for pop, folk, classical, and most upbeat music.' },
  { id: 'min',  label: 'min - Minor (Aeolian)',    intervals: [0,2,3,5,7,8,10],             description: 'Natural minor. Dark, melancholic, and introspective. The most common minor scale - great for moody, emotional, or dramatic pieces.' },
  { id: 'dor',  label: 'dor - Dorian',             intervals: [0,2,3,5,7,9,10],             description: 'Minor with a raised 6th. Slightly brighter and jazzier than natural minor - sounds soulful and funky. Think "Scarborough Fair" or modal jazz.' },
  { id: 'phr',  label: 'phr - Phrygian',           intervals: [0,1,3,5,7,8,10],             description: 'Minor with a flattened 2nd. Very dark and tense, with a distinctly Spanish or flamenco flavour. Creates a brooding, exotic feel.' },
  { id: 'lyd',  label: 'lyd - Lydian',             intervals: [0,2,4,6,7,9,11],             description: 'Major with a raised 4th. Dreamy, ethereal, and floating - the raised 4th gives it an otherworldly quality. Common in film scores and ambient music.' },
  { id: 'mix',  label: 'mix - Mixolydian',         intervals: [0,2,4,5,7,9,10],             description: 'Major with a flattened 7th. Bright but slightly unresolved - sounds bluesy and rock-oriented. Think classic rock, Celtic, and blues-inflected pop.' },
  { id: 'loc',  label: 'loc - Locrian',            intervals: [0,1,3,5,6,8,10],             description: 'The most dissonant mode - minor with a flattened 2nd and 5th. Extremely unstable and tense; rarely used as a tonic but effective for dark, unsettling textures.' },
  { id: 'ma.p', label: 'ma.p - Major Pentatonic',  intervals: [0,2,4,7,9],                  description: 'Five-note major scale (no 4th or 7th). Open, consonant, and universally pleasing - nothing clashes. Common in folk, country, and East Asian music.' },
  { id: 'mi.p', label: 'mi.p - Minor Pentatonic',  intervals: [0,3,5,7,10],                 description: 'Five-note minor scale. The backbone of blues, rock, and R&B. Every note works over almost any chord - great for expressive leads and improvisation.' },
]

export const LEARN_SCALES = [
  { name: 'Major',         steps: [0,2,4,5,7,9,11], feel: 'Bright and resolved' },
  { name: 'Natural Minor', steps: [0,2,3,5,7,8,10], feel: 'Dark and emotional' },
  { name: 'Minor Pent.',   steps: [0,3,5,7,10],      feel: '5 notes - easy to improvise over' },
  { name: 'Major Pent.',   steps: [0,2,4,7,9],       feel: '5 notes - always sounds positive' },
  { name: 'Dorian',        steps: [0,2,3,5,7,9,10],  feel: 'Soulful, funky minor' },
  { name: 'Mixolydian',    steps: [0,2,4,5,7,9,10],  feel: 'Bluesy, rock feel' },
]
