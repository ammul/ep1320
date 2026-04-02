import { NOTE_TO_SEMI, SEMI_TO_NAME, CHORD_DETECT_TYPES } from '../constants/musicConstants.js'

export function detectChord(noteIndices) {
  if (noteIndices.length < 2) return null
  const semis = [...new Set(noteIndices.map(i => NOTE_TO_SEMI[i]))].sort((a, b) => a - b)
  const results = []
  for (const rootSemi of semis) {
    const intervals = semis.map(s => (s - rootSemi + 12) % 12).sort((a, b) => a - b)
    for (const type of CHORD_DETECT_TYPES) {
      if (
        type.intervals.length === intervals.length &&
        type.intervals.every((v, i) => v === intervals[i])
      ) {
        const rootName = SEMI_TO_NAME[rootSemi]
        const lowestSemi = semis[0]
        const isInversion = lowestSemi !== rootSemi
        const bassName = SEMI_TO_NAME[lowestSemi]
        results.push({
          root: rootName,
          suffix: type.suffix,
          name: type.name,
          inversion: isInversion ? `/${bassName}` : '',
          display: `${rootName}${type.suffix}${isInversion ? `/${bassName}` : ''}`,
        })
      }
    }
  }
  if (results.length === 0) return null
  const rootPos = results.find(r => !r.inversion)
  return rootPos ?? results[0]
}
