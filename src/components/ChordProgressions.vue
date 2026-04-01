<script setup>
import { ref, computed, watch } from 'vue'
import { displayMode } from '../displayMode.js'
import { NOTES, LABELS, CHORD_TYPES, CHORD_SUFFIX } from '../musicConstants.js'
import { buildRows } from '../musicUtils.js'
import { padSize } from '../padSize.js'
import ChordCardBody from './ChordCardBody.vue'
import RootNotePicker from './RootNotePicker.vue'
import { midiStatus, midiChannel, chordOn, chordOff } from '../midiManager.js'
import { startNote, stopNote, stopAllNotes, playNote } from '../audioEngine.js'

const GENRES = [
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

const ALL_PROGRESSIONS = [
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

const SOLO_ADVICE = {
  maj:  { scale: 'Major pentatonic', why: 'Open and resolved - all 5 notes sound great over a major chord.' },
  min:  { scale: 'Minor pentatonic', why: 'Dark and expressive - every note fits naturally over a minor chord.' },
  dom7: { scale: 'Minor pentatonic', why: 'The bluesy feel of the minor pentatonic adds perfect tension over a dominant 7th.' },
  maj7: { scale: 'Major pentatonic', why: 'Smooth and bright - the major pentatonic floats beautifully over a maj7 chord.' },
  min7: { scale: 'Minor pentatonic', why: 'The minor pentatonic is built for minor 7ths - soulful and natural.' },
  dim:  { scale: 'Minor pentatonic', why: 'Stick to root and 5th - pentatonic avoids the worst clashes over a diminished chord.' },
  aug:  { scale: 'Major pentatonic', why: 'Keep to the bright notes - avoid the 5th, which clashes with the augmented chord.' },
  sus4: { scale: 'Major pentatonic', why: 'The open sound of pentatonic matches the unresolved feel of a sus4 chord.' },
}

const selectedRoot   = ref('A')
const selectedGenre  = ref('all')
const selectedId     = ref('pop-1')
const showInfoIdx    = ref(null)

const chordOctave   = ref(4)
const bpm           = ref(80)
const beatsPerChord = ref(4)
const loopActiveIdx = ref(null)
const loopPlaying   = ref(false)
let _loopTimer      = null
let _currentMidis   = []

const filteredProgressions = computed(() =>
  selectedGenre.value === 'all'
    ? ALL_PROGRESSIONS
    : ALL_PROGRESSIONS.filter(p => p.genre === selectedGenre.value)
)

const selectedProgression = computed(() =>
  ALL_PROGRESSIONS.find(p => p.id === selectedId.value) ?? ALL_PROGRESSIONS[0]
)

watch(selectedGenre, () => {
  const still = filteredProgressions.value.find(p => p.id === selectedId.value)
  if (!still) selectedId.value = filteredProgressions.value[0]?.id ?? ALL_PROGRESSIONS[0].id
  stopLoop()
})

const rootIndex = computed(() => NOTES.indexOf(selectedRoot.value))

const chordCards = computed(() =>
  selectedProgression.value.chords.map((chord, idx) => {
    const chordRootIdx = (rootIndex.value + chord.degree) % 12
    const padIndices   = new Set(CHORD_TYPES[chord.type].map(i => (chordRootIdx + i) % 12))
    const sorted       = [...padIndices].sort((a, b) => a - b)
    return {
      idx,
      numeral:      chord.numeral,
      name:         NOTES[chordRootIdx] + CHORD_SUFFIX[chord.type],
      type:         chord.type,
      chordRootIdx,
      rows:         buildRows(padIndices, chordRootIdx, padSize.value === '4x4' ? 4 : 3),
      pressLabels:  sorted.map(i => LABELS[i]),
      noteNames:    sorted.map(i => NOTES[i]),
    }
  })
)

function cardMidis(card) {
  const aMidi = 12 * (chordOctave.value + 1) + 9
  const root  = aMidi + card.chordRootIdx
  return CHORD_TYPES[card.type].map(i => root + i)
}

function previewChord(card) {
  chordOff(_currentMidis)
  _currentMidis.forEach(m => stopNote(m))
  _currentMidis = cardMidis(card)
  chordOn(_currentMidis)
  _currentMidis.forEach(m => startNote(m))
}
function stopPreview(card) {
  chordOff(cardMidis(card))
  cardMidis(card).forEach(m => stopNote(m))
}

function playLoop() {
  if (_loopTimer) { stopLoop(); return }
  let idx = 0
  const advance = () => {
    chordOff(_currentMidis)
    _currentMidis.forEach(m => stopNote(m))
    loopActiveIdx.value = idx
    _currentMidis = cardMidis(chordCards.value[idx])
    chordOn(_currentMidis)
    const beatSec = Math.max(0.1, (60 / bpm.value) * beatsPerChord.value - 0.05)
    _currentMidis.forEach(m => playNote(m, beatSec))
    idx = (idx + 1) % chordCards.value.length
  }
  advance()
  const ms = (60000 / bpm.value) * beatsPerChord.value
  _loopTimer = setInterval(advance, ms)
  loopPlaying.value = true
}
function stopLoop() {
  clearInterval(_loopTimer)
  _loopTimer = null
  loopPlaying.value = false
  chordOff(_currentMidis)
  stopAllNotes()
  _currentMidis = []
  loopActiveIdx.value = null
}

watch([selectedId, selectedRoot], stopLoop)
</script>

<template>
  <div class="chord-prog">
    <div class="chord-prog-header">
      <h2>Chord Progressions</h2>
      <p class="subtitle">explore chord sequences by genre - transposed to any key</p>
    </div>

    <div class="controls">
      <div class="control-group">
        <label>Key</label>
        <RootNotePicker v-model="selectedRoot" />
      </div>
    </div>

    <!-- Genre filter -->
    <div class="genre-filter">
      <button
        v-for="g in GENRES"
        :key="g.id"
        class="genre-btn"
        :class="{ active: selectedGenre === g.id }"
        @click="selectedGenre = g.id"
      >{{ g.label }}</button>
    </div>

    <!-- Progression list -->
    <div class="prog-list">
      <button
        v-for="p in filteredProgressions"
        :key="p.id"
        class="prog-item"
        :class="{ active: selectedId === p.id }"
        @click="selectedId = p.id; showInfoIdx = null"
      >
        <span class="prog-label">{{ p.label }}</span>
        <span class="prog-key-badge" :class="p.key">{{ p.key }}</span>
        <span class="prog-numeral">{{ p.numeral }}</span>
      </button>
    </div>

    <!-- Description of selected -->
    <p class="prog-examples">{{ selectedProgression.examples }}</p>

    <!-- MIDI toolbar -->
    <div v-if="midiStatus === 'connected'" class="midi-toolbar">
      <button class="play-btn" :class="{ playing: loopPlaying }" @click="playLoop">
        {{ loopPlaying ? 'Stop' : 'Play' }}
      </button>
      <span class="midi-divider"></span>
      <span class="midi-lbl">Oct</span>
      <button class="mini-btn" @click="chordOctave = Math.max(2, chordOctave - 1)">−</button>
      <span class="midi-val">{{ chordOctave }}</span>
      <button class="mini-btn" @click="chordOctave = Math.min(6, chordOctave + 1)">+</button>
      <span class="midi-divider"></span>
      <input type="number" v-model.number="bpm" min="40" max="200" class="bpm-input" />
      <span class="midi-lbl">BPM</span>
      <span class="midi-divider"></span>
      <button
        v-for="b in [1, 2, 4, 8]"
        :key="b"
        class="mini-btn"
        :class="{ active: beatsPerChord === b }"
        @click="beatsPerChord = b"
      >{{ b }}</button>
      <span class="midi-divider"></span>
      <span class="midi-lbl">Lane</span>
      <button
        v-for="(lane, i) in ['A','B','C','D']"
        :key="lane"
        class="mini-btn"
        :class="{ active: midiChannel === i }"
        @click="midiChannel = i"
      >{{ lane }}</button>
    </div>

    <!-- Chord cards -->
    <div class="chord-row" :class="{ 'piano-mode': displayMode === 'piano' }">
      <div
        v-for="card in chordCards"
        :key="card.idx"
        class="chord-card"
        :class="{ 'piano-mode': displayMode === 'piano', active: loopActiveIdx === card.idx }"
        @pointerdown.prevent="previewChord(card)"
        @pointerup="stopPreview(card)"
        @pointerleave="stopPreview(card)"
        @pointercancel="stopPreview(card)"
      >
        <div class="chord-info">
          <div class="chord-numeral">{{ card.numeral }}</div>
          <div class="chord-name">{{ card.name }}</div>
        </div>
        <div class="chord-body-wrap">
          <ChordCardBody
            :rows="card.rows"
            :pressLabels="card.pressLabels"
            :noteNames="card.noteNames"
            :chordRootIdx="card.chordRootIdx"
            :chordType="card.type"
          />
        </div>
        <button
          class="info-btn card-info-btn"
          :class="{ active: showInfoIdx === card.idx }"
          @click.stop="showInfoIdx = showInfoIdx === card.idx ? null : card.idx"
          aria-label="Solo tip"
        >i</button>
        <div v-if="showInfoIdx === card.idx" class="solo-info">
          <span class="solo-scale">{{ SOLO_ADVICE[card.type].scale }}</span>
          - {{ SOLO_ADVICE[card.type].why }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.chord-prog {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 2rem;
}

.chord-prog-header h2 {
  font-size: 1.4rem;
  color: var(--accent);
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.subtitle {
  margin-top: 0.3rem;
  font-size: 0.85rem;
  color: var(--text3);
}

.controls {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  margin: 1.5rem 0 1.25rem;
}

.control-group {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.control-group label {
  font-weight: 600;
  color: var(--accent);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-size: 0.8rem;
  min-width: 5rem;
}

/* Genre filter */
.genre-filter {
  display: flex;
  gap: 0.35rem;
  flex-wrap: wrap;
  margin-bottom: 0.75rem;
}

.genre-btn {
  padding: 0.28rem 0.75rem;
  border-radius: 5px;
  border: 1px solid var(--border2);
  background: var(--input);
  color: var(--text3);
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.12s, border-color 0.12s, color 0.12s;
}

.genre-btn:hover  { border-color: var(--accent); color: var(--text); }
.genre-btn.active { background: var(--accent); border-color: var(--accent); color: var(--on-accent); }

/* Progression list */
.prog-list {
  border: 1px solid var(--border);
  border-radius: 8px;
  overflow: hidden;
  max-height: 280px;
  overflow-y: auto;
  margin-bottom: 0.6rem;
}

.prog-item {
  width: 100%;
  display: grid;
  grid-template-columns: 1fr auto auto;
  align-items: center;
  gap: 0.75rem;
  padding: 0.55rem 0.85rem;
  background: transparent;
  border: none;
  border-bottom: 1px solid var(--border3);
  cursor: pointer;
  text-align: left;
  transition: background 0.1s;
  color: inherit;
}

.prog-item:last-child { border-bottom: none; }
.prog-item:hover      { background: var(--hover); }
.prog-item.active     { background: var(--selected); }

.prog-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.prog-item.active .prog-label { color: var(--accent); }

.prog-key-badge {
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  padding: 0.1rem 0.4rem;
  border-radius: 3px;
  white-space: nowrap;
  flex-shrink: 0;
}

.prog-key-badge.major { background: color-mix(in srgb, var(--accent) 14%, transparent); color: var(--accent-dim); border: 1px solid color-mix(in srgb, var(--accent) 25%, transparent); }
.prog-key-badge.minor { background: color-mix(in srgb, var(--rust) 14%, transparent); color: var(--rust); border: 1px solid color-mix(in srgb, var(--rust) 25%, transparent); }

.prog-numeral {
  font-size: 0.78rem;
  color: var(--text3);
  white-space: nowrap;
  flex-shrink: 0;
  font-variant-numeric: tabular-nums;
}

.prog-item.active .prog-numeral { color: var(--text2); }

/* Description */
.prog-examples {
  font-size: 0.82rem;
  color: var(--text3);
  margin-bottom: 1rem;
  font-style: italic;
  padding: 0 0.1rem;
}

/* MIDI toolbar */
.midi-toolbar {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
  padding: 0.4rem 0.75rem;
  background: var(--raised);
  border: 1px solid var(--border2);
  border-radius: 6px;
  font-size: 0.82rem;
}

.midi-lbl {
  font-weight: 600;
  color: var(--accent);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-size: 0.72rem;
}

.midi-val {
  min-width: 1.2rem;
  text-align: center;
  font-weight: 700;
  color: var(--text);
}

.midi-divider {
  width: 1px;
  height: 1.2rem;
  background: var(--border2);
  margin: 0 0.2rem;
  flex-shrink: 0;
}

.mini-btn {
  height: 1.7rem;
  min-width: 1.7rem;
  padding: 0 0.35rem;
  border: 1px solid var(--border2);
  border-radius: 4px;
  background: var(--input);
  color: var(--text2);
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  line-height: 1;
  transition: background 0.12s, border-color 0.12s, color 0.12s;
}

.mini-btn:hover  { border-color: var(--accent); color: var(--text); }
.mini-btn.active { background: var(--accent); border-color: var(--accent); color: var(--on-accent); }

.bpm-input {
  width: 3.5rem;
  background: var(--input);
  border: 1px solid var(--border2);
  border-radius: 4px;
  color: var(--text);
  padding: 0.2rem 0.3rem;
  font-size: 0.82rem;
  text-align: center;
  outline: none;
}

.bpm-input:focus { border-color: var(--accent); }

.play-btn {
  padding: 0.3rem 0.9rem;
  border: 1px solid var(--border2);
  border-radius: 5px;
  background: var(--input);
  color: var(--text2);
  font-size: 0.82rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  cursor: pointer;
  transition: background 0.12s, border-color 0.12s, color 0.12s;
}

.play-btn:hover   { border-color: var(--accent); color: var(--accent); }
.play-btn.playing { background: var(--accent); border-color: var(--accent); color: var(--on-accent); }

/* Chord row */
.chord-row {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.chord-row.piano-mode {
  flex-direction: column;
  gap: 0.5rem;
}

.chord-card {
  flex: 1 1 120px;
  max-width: 160px;
  background: var(--input);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 0.75rem 0.6rem;
  cursor: default;
  user-select: none;
  touch-action: none;
  transition: border-color 0.15s, box-shadow 0.15s, background 0.15s;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;
  position: relative;
}

.chord-card.piano-mode {
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
  max-width: 100%;
  flex: 1 1 100%;
  padding: 0.6rem 2.2rem 0.6rem 1rem;
  gap: 1rem;
}

.chord-card:hover  { background: var(--hover); border-color: var(--accent-mid); }
.chord-card.active { border-color: var(--accent); box-shadow: 0 0 0 2px var(--accent-bg); }

.card-info-btn {
  position: absolute;
  top: 0.45rem;
  right: 0.45rem;
  width: 1.4rem;
  height: 1.4rem;
  border-radius: 50%;
  border: 1px solid var(--border2);
  background: var(--input);
  color: var(--text3);
  font-size: 0.72rem;
  font-style: italic;
  font-weight: 700;
  cursor: pointer;
  line-height: 1;
  flex-shrink: 0;
  transition: background 0.12s, border-color 0.12s, color 0.12s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-info-btn:hover  { border-color: var(--accent); color: var(--text); }
.card-info-btn.active { background: var(--accent-bg); border-color: var(--accent); color: var(--accent); }

.solo-info {
  font-size: 0.78rem;
  color: var(--text2);
  line-height: 1.5;
  padding: 0.5rem 0.65rem;
  background: var(--input);
  border: 1px solid var(--border2);
  border-left: 3px solid var(--accent);
  border-radius: 5px;
  flex-basis: 100%;
}

.solo-scale {
  font-weight: 700;
  color: var(--accent);
}

.chord-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
  gap: 0.15rem;
}

.chord-card.piano-mode .chord-info { width: 4.5rem; }
.chord-body-wrap { flex: 1; min-width: 0; }

.chord-numeral {
  font-size: 0.7rem;
  color: var(--accent-mid);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.chord-name {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--rust);
  line-height: 1;
}

@media (max-width: 600px) {
  .chord-prog { padding: 1.25rem 1rem; }

  .control-group {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .control-group label { min-width: unset; }

  .prog-numeral { display: none; }

  .chord-card {
    flex: 1 1 calc(50% - 0.375rem);
    max-width: calc(50% - 0.375rem);
  }
}

@media (orientation: landscape) and (max-height: 500px) {
  .chord-prog { padding: 0.75rem 1rem; }
  .subtitle   { display: none; }
  .controls   { margin: 0.5rem 0; }
  .control-group {
    flex-direction: row;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: nowrap;
  }
  .control-group label { min-width: unset; white-space: nowrap; }
  .prog-list { max-height: 160px; }
}
</style>
