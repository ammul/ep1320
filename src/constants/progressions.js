export const GENRES = [
  { id: 'all',       label: 'All' },
  { id: 'pop',       label: 'Pop' },
  { id: 'rock',      label: 'Rock' },
  { id: 'blues',     label: 'Blues' },
  { id: 'jazz',      label: 'Jazz' },
  { id: 'soul',      label: 'Soul / R&B' },
  { id: 'classical', label: 'Classical' },
  { id: 'latin',     label: 'Latin' },
  { id: 'cinematic', label: 'Cinematic' },
  { id: 'modal',     label: 'Modal' },
]

export const ALL_PROGRESSIONS = [
  // ── POP ──────────────────────────────────────────────────────────────────
  { id: 'pop-1', genre: 'pop', key: 'major', label: 'Pop anthem',
    numeral: 'I – V – vi – IV',
    examples: 'Let It Be · No Woman No Cry · With or Without You',
    chords: [{ degree: 0, type: 'maj', numeral: 'I' }, { degree: 7, type: 'maj', numeral: 'V' }, { degree: 9, type: 'min', numeral: 'vi' }, { degree: 5, type: 'maj', numeral: 'IV' }] },

  { id: 'pop-2', genre: 'pop', key: 'major', label: '50s doo-wop',
    numeral: 'I – vi – IV – V',
    examples: 'Stand By Me · Blue Moon · Every Breath You Take',
    chords: [{ degree: 0, type: 'maj', numeral: 'I' }, { degree: 9, type: 'min', numeral: 'vi' }, { degree: 5, type: 'maj', numeral: 'IV' }, { degree: 7, type: 'maj', numeral: 'V' }] },

  { id: 'pop-3', genre: 'pop', key: 'major', label: 'Minor-start loop',
    numeral: 'vi – IV – I – V',
    examples: 'Poker Face · Africa · Wicked Game · Despacito',
    chords: [{ degree: 9, type: 'min', numeral: 'vi' }, { degree: 5, type: 'maj', numeral: 'IV' }, { degree: 0, type: 'maj', numeral: 'I' }, { degree: 7, type: 'maj', numeral: 'V' }] },

  { id: 'pop-4', genre: 'pop', key: 'major', label: 'Upbeat pop',
    numeral: 'I – IV – vi – V',
    examples: 'Walking on Sunshine · Edge of Glory',
    chords: [{ degree: 0, type: 'maj', numeral: 'I' }, { degree: 5, type: 'maj', numeral: 'IV' }, { degree: 9, type: 'min', numeral: 'vi' }, { degree: 7, type: 'maj', numeral: 'V' }] },

  { id: 'pop-5', genre: 'pop', key: 'major', label: 'Country / folk',
    numeral: 'I – IV – I – V',
    examples: 'Jolene · Take Me Home, Country Roads · many folk standards',
    chords: [{ degree: 0, type: 'maj', numeral: 'I' }, { degree: 5, type: 'maj', numeral: 'IV' }, { degree: 0, type: 'maj', numeral: 'I' }, { degree: 7, type: 'maj', numeral: 'V' }] },

  { id: 'pop-6', genre: 'pop', key: 'minor', label: 'Alt / grunge loop',
    numeral: 'i – VI – III – VII',
    examples: 'Smells Like Teen Spirit · Numb · In the End',
    chords: [{ degree: 0, type: 'min', numeral: 'i' }, { degree: 8, type: 'maj', numeral: 'VI' }, { degree: 3, type: 'maj', numeral: 'III' }, { degree: 10, type: 'maj', numeral: 'VII' }] },

  { id: 'pop-7', genre: 'pop', key: 'minor', label: 'Dark pop loop',
    numeral: 'i – VI – iv – VII',
    examples: 'Zombie · Mad World · Jar of Hearts',
    chords: [{ degree: 0, type: 'min', numeral: 'i' }, { degree: 8, type: 'maj', numeral: 'VI' }, { degree: 5, type: 'min', numeral: 'iv' }, { degree: 10, type: 'maj', numeral: 'VII' }] },

  { id: 'pop-8', genre: 'pop', key: 'minor', label: 'Descending minor',
    numeral: 'i – VII – VI – V',
    examples: 'Somebody That I Used to Know · Chandelier',
    chords: [{ degree: 0, type: 'min', numeral: 'i' }, { degree: 10, type: 'maj', numeral: 'VII' }, { degree: 8, type: 'maj', numeral: 'VI' }, { degree: 7, type: 'maj', numeral: 'V' }] },

  // ── ROCK ─────────────────────────────────────────────────────────────────
  { id: 'rock-1', genre: 'rock', key: 'major', label: 'Three-chord rock',
    numeral: 'I – IV – V',
    examples: 'Johnny B. Goode · Wild Thing · Twist and Shout',
    chords: [{ degree: 0, type: 'maj', numeral: 'I' }, { degree: 5, type: 'maj', numeral: 'IV' }, { degree: 7, type: 'maj', numeral: 'V' }] },

  { id: 'rock-2', genre: 'rock', key: 'major', label: 'Rock shuffle',
    numeral: 'I – V – IV – V',
    examples: 'La Grange · Sweet Home Chicago · Rock Around the Clock',
    chords: [{ degree: 0, type: 'maj', numeral: 'I' }, { degree: 7, type: 'maj', numeral: 'V' }, { degree: 5, type: 'maj', numeral: 'IV' }, { degree: 7, type: 'maj', numeral: 'V' }] },

  { id: 'rock-3', genre: 'rock', key: 'major', label: 'Classic build',
    numeral: 'I – iii – IV – V',
    examples: 'Brown Eyed Girl · Mony Mony · La Bamba',
    chords: [{ degree: 0, type: 'maj', numeral: 'I' }, { degree: 4, type: 'min', numeral: 'iii' }, { degree: 5, type: 'maj', numeral: 'IV' }, { degree: 7, type: 'maj', numeral: 'V' }] },

  { id: 'rock-4', genre: 'rock', key: 'major', label: 'Mixolydian rock',
    numeral: 'I – ♭VII – IV – I',
    examples: 'Sweet Home Alabama · Hey Jude · Free Bird',
    chords: [{ degree: 0, type: 'maj', numeral: 'I' }, { degree: 10, type: 'maj', numeral: '♭VII' }, { degree: 5, type: 'maj', numeral: 'IV' }, { degree: 0, type: 'maj', numeral: 'I' }] },

  { id: 'rock-5', genre: 'rock', key: 'major', label: 'Power loop',
    numeral: 'I – ♭VII – ♭VI – ♭VII',
    examples: 'Hard rock riff staple · driving guitar loops',
    chords: [{ degree: 0, type: 'maj', numeral: 'I' }, { degree: 10, type: 'maj', numeral: '♭VII' }, { degree: 8, type: 'maj', numeral: '♭VI' }, { degree: 10, type: 'maj', numeral: '♭VII' }] },

  { id: 'rock-6', genre: 'rock', key: 'minor', label: 'Hard rock loop',
    numeral: 'i – VII – VI – VII',
    examples: 'Enter Sandman · Paranoid · Sabbath feel',
    chords: [{ degree: 0, type: 'min', numeral: 'i' }, { degree: 10, type: 'maj', numeral: 'VII' }, { degree: 8, type: 'maj', numeral: 'VI' }, { degree: 10, type: 'maj', numeral: 'VII' }] },

  { id: 'rock-7', genre: 'rock', key: 'major', label: 'Pop-rock anthem',
    numeral: 'I – V – vi – iii – IV',
    examples: 'Canon-inspired · film trailers · arena anthems',
    chords: [{ degree: 0, type: 'maj', numeral: 'I' }, { degree: 7, type: 'maj', numeral: 'V' }, { degree: 9, type: 'min', numeral: 'vi' }, { degree: 4, type: 'min', numeral: 'iii' }, { degree: 5, type: 'maj', numeral: 'IV' }] },

  { id: 'rock-8', genre: 'rock', key: 'major', label: 'Mod / British invasion',
    numeral: 'I – IV – V – IV',
    examples: 'Louie Louie · Satisfaction · Lola',
    chords: [{ degree: 0, type: 'maj', numeral: 'I' }, { degree: 5, type: 'maj', numeral: 'IV' }, { degree: 7, type: 'maj', numeral: 'V' }, { degree: 5, type: 'maj', numeral: 'IV' }] },

  // ── BLUES ────────────────────────────────────────────────────────────────
  { id: 'blues-1', genre: 'blues', key: 'major', label: 'Classic 12-bar',
    numeral: 'I⁷ – IV⁷ – V⁷',
    examples: '12-bar blues foundation with dominant 7ths',
    chords: [{ degree: 0, type: 'dom7', numeral: 'I⁷' }, { degree: 5, type: 'dom7', numeral: 'IV⁷' }, { degree: 7, type: 'dom7', numeral: 'V⁷' }] },

  { id: 'blues-2', genre: 'blues', key: 'major', label: 'Quick-change blues',
    numeral: 'I⁷ – IV⁷ – I⁷ – V⁷ – IV⁷ – I⁷',
    examples: 'Crossroads · Sweet Little Angel · rapid turnaround',
    chords: [{ degree: 0, type: 'dom7', numeral: 'I⁷' }, { degree: 5, type: 'dom7', numeral: 'IV⁷' }, { degree: 0, type: 'dom7', numeral: 'I⁷' }, { degree: 7, type: 'dom7', numeral: 'V⁷' }, { degree: 5, type: 'dom7', numeral: 'IV⁷' }, { degree: 0, type: 'dom7', numeral: 'I⁷' }] },

  { id: 'blues-3', genre: 'blues', key: 'major', label: 'Blues turnaround',
    numeral: 'I⁷ – V⁷ – IV⁷ – I⁷',
    examples: 'Standard blues ending phrase',
    chords: [{ degree: 0, type: 'dom7', numeral: 'I⁷' }, { degree: 7, type: 'dom7', numeral: 'V⁷' }, { degree: 5, type: 'dom7', numeral: 'IV⁷' }, { degree: 0, type: 'dom7', numeral: 'I⁷' }] },

  { id: 'blues-4', genre: 'blues', key: 'minor', label: 'Minor blues',
    numeral: 'i – iv – V⁷',
    examples: 'The Thrill Is Gone · Stormy Monday',
    chords: [{ degree: 0, type: 'min', numeral: 'i' }, { degree: 5, type: 'min', numeral: 'iv' }, { degree: 7, type: 'dom7', numeral: 'V⁷' }] },

  { id: 'blues-5', genre: 'blues', key: 'minor', label: 'Slow minor blues',
    numeral: 'i – iv – i – V⁷',
    examples: 'Still Got the Blues · Little Wing · slow drag',
    chords: [{ degree: 0, type: 'min', numeral: 'i' }, { degree: 5, type: 'min', numeral: 'iv' }, { degree: 0, type: 'min', numeral: 'i' }, { degree: 7, type: 'dom7', numeral: 'V⁷' }] },

  { id: 'blues-6', genre: 'blues', key: 'major', label: 'Jump blues',
    numeral: 'I⁷ – IV⁷ – ♭VII⁷ – IV⁷',
    examples: 'Boogie-woogie · jump swing · rock and roll',
    chords: [{ degree: 0, type: 'dom7', numeral: 'I⁷' }, { degree: 5, type: 'dom7', numeral: 'IV⁷' }, { degree: 10, type: 'dom7', numeral: '♭VII⁷' }, { degree: 5, type: 'dom7', numeral: 'IV⁷' }] },

  // ── JAZZ ─────────────────────────────────────────────────────────────────
  { id: 'jazz-1', genre: 'jazz', key: 'major', label: 'Two-five-one',
    numeral: 'ii⁷ – V⁷ – Imaj7',
    examples: 'The foundation of jazz harmony',
    chords: [{ degree: 2, type: 'min7', numeral: 'ii⁷' }, { degree: 7, type: 'dom7', numeral: 'V⁷' }, { degree: 0, type: 'maj7', numeral: 'Imaj7' }] },

  { id: 'jazz-2', genre: 'jazz', key: 'major', label: 'Jazz turnaround',
    numeral: 'Imaj7 – vi⁷ – ii⁷ – V⁷',
    examples: 'Autumn Leaves · Misty · most jazz standards',
    chords: [{ degree: 0, type: 'maj7', numeral: 'Imaj7' }, { degree: 9, type: 'min7', numeral: 'vi⁷' }, { degree: 2, type: 'min7', numeral: 'ii⁷' }, { degree: 7, type: 'dom7', numeral: 'V⁷' }] },

  { id: 'jazz-3', genre: 'jazz', key: 'major', label: 'Chain of dominants',
    numeral: 'iii⁷ – VI⁷ – ii⁷ – V⁷',
    examples: 'Bebop staple · rhythm changes bridge',
    chords: [{ degree: 4, type: 'min7', numeral: 'iii⁷' }, { degree: 9, type: 'dom7', numeral: 'VI⁷' }, { degree: 2, type: 'min7', numeral: 'ii⁷' }, { degree: 7, type: 'dom7', numeral: 'V⁷' }] },

  { id: 'jazz-4', genre: 'jazz', key: 'major', label: 'Neo-soul groove',
    numeral: 'Imaj7 – IVmaj7 – ii⁷ – V⁷',
    examples: "Isn't She Lovely · smooth jazz standard",
    chords: [{ degree: 0, type: 'maj7', numeral: 'Imaj7' }, { degree: 5, type: 'maj7', numeral: 'IVmaj7' }, { degree: 2, type: 'min7', numeral: 'ii⁷' }, { degree: 7, type: 'dom7', numeral: 'V⁷' }] },

  { id: 'jazz-5', genre: 'jazz', key: 'minor', label: 'Minor ii-V-i',
    numeral: 'ii° – V⁷ – i',
    examples: 'Jazz minor resolution · Autumn Leaves (minor)',
    chords: [{ degree: 2, type: 'dim', numeral: 'ii°' }, { degree: 7, type: 'dom7', numeral: 'V⁷' }, { degree: 0, type: 'min', numeral: 'i' }] },

  { id: 'jazz-6', genre: 'jazz', key: 'minor', label: 'Minor jazz groove',
    numeral: 'i⁷ – iv⁷ – ♭VII⁷ – III⁷',
    examples: 'Modal jazz · Miles Davis · So What influence',
    chords: [{ degree: 0, type: 'min7', numeral: 'i⁷' }, { degree: 5, type: 'min7', numeral: 'iv⁷' }, { degree: 10, type: 'dom7', numeral: '♭VII⁷' }, { degree: 3, type: 'dom7', numeral: 'III⁷' }] },

  { id: 'jazz-7', genre: 'jazz', key: 'major', label: 'Tritone sub',
    numeral: 'ii⁷ – ♭II⁷ – Imaj7',
    examples: 'Smooth chromatic resolution · Parker bebop',
    chords: [{ degree: 2, type: 'min7', numeral: 'ii⁷' }, { degree: 1, type: 'dom7', numeral: '♭II⁷' }, { degree: 0, type: 'maj7', numeral: 'Imaj7' }] },

  { id: 'jazz-8', genre: 'jazz', key: 'major', label: 'Rhythm changes A',
    numeral: 'I – vi⁷ – ii⁷ – V⁷',
    examples: "I Got Rhythm · Oleo · Anthropology",
    chords: [{ degree: 0, type: 'maj', numeral: 'I' }, { degree: 9, type: 'min7', numeral: 'vi⁷' }, { degree: 2, type: 'min7', numeral: 'ii⁷' }, { degree: 7, type: 'dom7', numeral: 'V⁷' }] },

  // ── SOUL / R&B ───────────────────────────────────────────────────────────
  { id: 'soul-1', genre: 'soul', key: 'major', label: 'Gospel amen',
    numeral: 'IV – I – V – I',
    examples: 'Amazing Grace · church standards · gospel finales',
    chords: [{ degree: 5, type: 'maj', numeral: 'IV' }, { degree: 0, type: 'maj', numeral: 'I' }, { degree: 7, type: 'maj', numeral: 'V' }, { degree: 0, type: 'maj', numeral: 'I' }] },

  { id: 'soul-2', genre: 'soul', key: 'major', label: 'Soul groove',
    numeral: 'I – IV – V – IV',
    examples: 'Wilson Pickett · Otis Redding · Aretha Franklin',
    chords: [{ degree: 0, type: 'maj', numeral: 'I' }, { degree: 5, type: 'maj', numeral: 'IV' }, { degree: 7, type: 'maj', numeral: 'V' }, { degree: 5, type: 'maj', numeral: 'IV' }] },

  { id: 'soul-3', genre: 'soul', key: 'major', label: 'Motown drive',
    numeral: 'I – iii – IV – V',
    examples: "Reach Out I'll Be There · Stevie Wonder · Motown classics",
    chords: [{ degree: 0, type: 'maj', numeral: 'I' }, { degree: 4, type: 'min', numeral: 'iii' }, { degree: 5, type: 'maj', numeral: 'IV' }, { degree: 7, type: 'maj', numeral: 'V' }] },

  { id: 'soul-4', genre: 'soul', key: 'minor', label: 'R&B ballad',
    numeral: 'i – III – VII – IV',
    examples: "Ain't No Sunshine · Lean on Me · Use Me",
    chords: [{ degree: 0, type: 'min', numeral: 'i' }, { degree: 3, type: 'maj', numeral: 'III' }, { degree: 10, type: 'maj', numeral: 'VII' }, { degree: 5, type: 'maj', numeral: 'IV' }] },

  { id: 'soul-5', genre: 'soul', key: 'minor', label: 'Neo-soul vamp',
    numeral: 'i⁷ – IV – ♭VII – III',
    examples: "D'Angelo · Erykah Badu · Frank Ocean",
    chords: [{ degree: 0, type: 'min7', numeral: 'i⁷' }, { degree: 5, type: 'maj', numeral: 'IV' }, { degree: 10, type: 'maj', numeral: '♭VII' }, { degree: 3, type: 'maj', numeral: 'III' }] },

  { id: 'soul-6', genre: 'soul', key: 'major', label: 'Motown two-chord',
    numeral: 'I – IV',
    examples: 'Dancing in the Street · Superstition groove',
    chords: [{ degree: 0, type: 'maj', numeral: 'I' }, { degree: 5, type: 'maj', numeral: 'IV' }] },

  // ── CLASSICAL ────────────────────────────────────────────────────────────
  { id: 'class-1', genre: 'classical', key: 'major', label: 'Pachelbel canon',
    numeral: 'I – V – vi – iii – IV – I – IV – V',
    examples: 'Canon in D · A Whiter Shade of Pale · Go West',
    chords: [{ degree: 0, type: 'maj', numeral: 'I' }, { degree: 7, type: 'maj', numeral: 'V' }, { degree: 9, type: 'min', numeral: 'vi' }, { degree: 4, type: 'min', numeral: 'iii' }, { degree: 5, type: 'maj', numeral: 'IV' }, { degree: 0, type: 'maj', numeral: 'I' }, { degree: 5, type: 'maj', numeral: 'IV' }, { degree: 7, type: 'maj', numeral: 'V' }] },

  { id: 'class-2', genre: 'classical', key: 'minor', label: 'Andalusian cadence',
    numeral: 'i – VII – VI – V',
    examples: 'Flamenco standard · Rodrigo · classical Spanish guitar',
    chords: [{ degree: 0, type: 'min', numeral: 'i' }, { degree: 10, type: 'maj', numeral: 'VII' }, { degree: 8, type: 'maj', numeral: 'VI' }, { degree: 7, type: 'maj', numeral: 'V' }] },

  { id: 'class-3', genre: 'classical', key: 'major', label: 'Circle of fifths',
    numeral: 'I – IV – vii° – iii – vi – ii – V – I',
    examples: 'Bach · classical resolution chain through all diatonic chords',
    chords: [{ degree: 0, type: 'maj', numeral: 'I' }, { degree: 5, type: 'maj', numeral: 'IV' }, { degree: 11, type: 'dim', numeral: 'vii°' }, { degree: 4, type: 'min', numeral: 'iii' }, { degree: 9, type: 'min', numeral: 'vi' }, { degree: 2, type: 'min', numeral: 'ii' }, { degree: 7, type: 'maj', numeral: 'V' }, { degree: 0, type: 'maj', numeral: 'I' }] },

  { id: 'class-4', genre: 'classical', key: 'minor', label: 'Neapolitan cadence',
    numeral: 'i – ♭II – V – i',
    examples: 'Beethoven · Schubert · classical dramatic resolution',
    chords: [{ degree: 0, type: 'min', numeral: 'i' }, { degree: 1, type: 'maj', numeral: '♭II' }, { degree: 7, type: 'maj', numeral: 'V' }, { degree: 0, type: 'min', numeral: 'i' }] },

  { id: 'class-5', genre: 'classical', key: 'major', label: 'Plagal cadence',
    numeral: 'I – IV – I',
    examples: '"Amen" cadence · hymns · ecclesiastical endings',
    chords: [{ degree: 0, type: 'maj', numeral: 'I' }, { degree: 5, type: 'maj', numeral: 'IV' }, { degree: 0, type: 'maj', numeral: 'I' }] },

  { id: 'class-6', genre: 'classical', key: 'major', label: 'Falling sequence',
    numeral: 'I – vi – IV – ii – V – I',
    examples: 'Classical harmonic sequence · Bach-style voice leading',
    chords: [{ degree: 0, type: 'maj', numeral: 'I' }, { degree: 9, type: 'min', numeral: 'vi' }, { degree: 5, type: 'maj', numeral: 'IV' }, { degree: 2, type: 'min', numeral: 'ii' }, { degree: 7, type: 'maj', numeral: 'V' }, { degree: 0, type: 'maj', numeral: 'I' }] },

  // ── LATIN ────────────────────────────────────────────────────────────────
  { id: 'latin-1', genre: 'latin', key: 'major', label: 'Bossa nova',
    numeral: 'Imaj7 – VI⁷ – ii⁷ – V⁷',
    examples: 'The Girl from Ipanema · Corcovado · Wave',
    chords: [{ degree: 0, type: 'maj7', numeral: 'Imaj7' }, { degree: 9, type: 'dom7', numeral: 'VI⁷' }, { degree: 2, type: 'min7', numeral: 'ii⁷' }, { degree: 7, type: 'dom7', numeral: 'V⁷' }] },

  { id: 'latin-2', genre: 'latin', key: 'minor', label: 'Tango',
    numeral: 'i – iv – i – V',
    examples: 'La Cumparsita · Por Una Cabeza · tango standard',
    chords: [{ degree: 0, type: 'min', numeral: 'i' }, { degree: 5, type: 'min', numeral: 'iv' }, { degree: 0, type: 'min', numeral: 'i' }, { degree: 7, type: 'maj', numeral: 'V' }] },

  { id: 'latin-3', genre: 'latin', key: 'minor', label: 'Flamenco / Phrygian',
    numeral: 'i – ♭II – i – V',
    examples: 'Flamenco · Spanish guitar · Gipsy Kings',
    chords: [{ degree: 0, type: 'min', numeral: 'i' }, { degree: 1, type: 'maj', numeral: '♭II' }, { degree: 0, type: 'min', numeral: 'i' }, { degree: 7, type: 'maj', numeral: 'V' }] },

  { id: 'latin-4', genre: 'latin', key: 'major', label: 'Salsa / Cumbia',
    numeral: 'I – IV – V – IV',
    examples: 'Salsa · Cumbia · Cuban son rhythm',
    chords: [{ degree: 0, type: 'maj', numeral: 'I' }, { degree: 5, type: 'maj', numeral: 'IV' }, { degree: 7, type: 'maj', numeral: 'V' }, { degree: 5, type: 'maj', numeral: 'IV' }] },

  { id: 'latin-5', genre: 'latin', key: 'minor', label: 'Dorian groove',
    numeral: 'i – v – VI – III',
    examples: 'Oye Como Va · Evil Ways · Santana',
    chords: [{ degree: 0, type: 'min', numeral: 'i' }, { degree: 7, type: 'min', numeral: 'v' }, { degree: 8, type: 'maj', numeral: 'VI' }, { degree: 3, type: 'maj', numeral: 'III' }] },

  // ── CINEMATIC ────────────────────────────────────────────────────────────
  { id: 'cin-1', genre: 'cinematic', key: 'minor', label: 'Epic minor',
    numeral: 'i – VI – III – VII',
    examples: 'Game of Thrones · Hans Zimmer · Gladiator',
    chords: [{ degree: 0, type: 'min', numeral: 'i' }, { degree: 8, type: 'maj', numeral: 'VI' }, { degree: 3, type: 'maj', numeral: 'III' }, { degree: 10, type: 'maj', numeral: 'VII' }] },

  { id: 'cin-2', genre: 'cinematic', key: 'minor', label: 'Dramatic ballad',
    numeral: 'i – VI – iv – V',
    examples: 'Nothing Else Matters · dramatic film score',
    chords: [{ degree: 0, type: 'min', numeral: 'i' }, { degree: 8, type: 'maj', numeral: 'VI' }, { degree: 5, type: 'min', numeral: 'iv' }, { degree: 7, type: 'maj', numeral: 'V' }] },

  { id: 'cin-3', genre: 'cinematic', key: 'minor', label: 'Requiem descent',
    numeral: 'i – iv – VII – III',
    examples: 'Requiem for a Dream · dark orchestral score',
    chords: [{ degree: 0, type: 'min', numeral: 'i' }, { degree: 5, type: 'min', numeral: 'iv' }, { degree: 10, type: 'maj', numeral: 'VII' }, { degree: 3, type: 'maj', numeral: 'III' }] },

  { id: 'cin-4', genre: 'cinematic', key: 'minor', label: 'Dark epic',
    numeral: 'i – III – VII – VI',
    examples: 'Interstellar · dark fantasy · Inception',
    chords: [{ degree: 0, type: 'min', numeral: 'i' }, { degree: 3, type: 'maj', numeral: 'III' }, { degree: 10, type: 'maj', numeral: 'VII' }, { degree: 8, type: 'maj', numeral: 'VI' }] },

  { id: 'cin-5', genre: 'cinematic', key: 'major', label: 'Hopeful ascent',
    numeral: 'I – ii – IV – V',
    examples: 'Uplifting cues · end-of-film resolution',
    chords: [{ degree: 0, type: 'maj', numeral: 'I' }, { degree: 2, type: 'min', numeral: 'ii' }, { degree: 5, type: 'maj', numeral: 'IV' }, { degree: 7, type: 'maj', numeral: 'V' }] },

  { id: 'cin-6', genre: 'cinematic', key: 'minor', label: 'Dorian hero',
    numeral: 'i – v – VI – VII',
    examples: 'Tron Legacy · Mass Effect · sci-fi scores',
    chords: [{ degree: 0, type: 'min', numeral: 'i' }, { degree: 7, type: 'min', numeral: 'v' }, { degree: 8, type: 'maj', numeral: 'VI' }, { degree: 10, type: 'maj', numeral: 'VII' }] },

  // ── MODAL ────────────────────────────────────────────────────────────────
  { id: 'modal-1', genre: 'modal', key: 'minor', label: 'Dorian vamp',
    numeral: 'i – IV',
    examples: 'So What (Miles Davis) · Scarborough Fair · Eleanor Rigby',
    chords: [{ degree: 0, type: 'min', numeral: 'i' }, { degree: 5, type: 'maj', numeral: 'IV' }] },

  { id: 'modal-2', genre: 'modal', key: 'minor', label: 'Dorian groove',
    numeral: 'i – II – IV',
    examples: 'Chameleon (Herbie Hancock) · funk / jazz fusion',
    chords: [{ degree: 0, type: 'min', numeral: 'i' }, { degree: 2, type: 'maj', numeral: 'II' }, { degree: 5, type: 'maj', numeral: 'IV' }] },

  { id: 'modal-3', genre: 'modal', key: 'minor', label: 'Phrygian tension',
    numeral: 'i – ♭II',
    examples: 'Flamenco · death metal · exotic menace',
    chords: [{ degree: 0, type: 'min', numeral: 'i' }, { degree: 1, type: 'maj', numeral: '♭II' }] },

  { id: 'modal-4', genre: 'modal', key: 'major', label: 'Lydian float',
    numeral: 'I – II',
    examples: 'E.T. · Back to the Future · dream sequences · John Williams',
    chords: [{ degree: 0, type: 'maj', numeral: 'I' }, { degree: 2, type: 'maj', numeral: 'II' }] },

  { id: 'modal-5', genre: 'modal', key: 'major', label: 'Mixolydian vamp',
    numeral: 'I – ♭VII',
    examples: 'Norwegian Wood · Grateful Dead · Oasis',
    chords: [{ degree: 0, type: 'maj', numeral: 'I' }, { degree: 10, type: 'maj', numeral: '♭VII' }] },

  { id: 'modal-6', genre: 'modal', key: 'minor', label: 'Aeolian wall',
    numeral: 'i – VII – VI – VII',
    examples: 'Natural minor loop · indie · Radiohead · shoegaze',
    chords: [{ degree: 0, type: 'min', numeral: 'i' }, { degree: 10, type: 'maj', numeral: 'VII' }, { degree: 8, type: 'maj', numeral: 'VI' }, { degree: 10, type: 'maj', numeral: 'VII' }] },
]

export const LEARN_PROGS = [
  { name:'I – V – vi – IV',  degIdx:[0,4,5,3], feel:'Pop anthem',  songs:'Let It Be · No Woman No Cry' },
  { name:'I – IV – V',       degIdx:[0,3,4],   feel:'Blues / rock', songs:'Johnny B. Goode · Wild Thing' },
  { name:'ii – V – I',       degIdx:[1,4,0],   feel:'Jazz',         songs:'Autumn Leaves · most standards' },
  { name:'I – vi – IV – V',  degIdx:[0,5,3,4], feel:'50s doo-wop', songs:'Stand By Me · Blue Moon' },
]
