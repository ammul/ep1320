# Tonarium - Claude Code Instructions

## Commands
- `npm run dev` - start dev server
- `npm run build` - Vite build (base path `/tonarium/`)
- `npm test` - run unit and component tests (Vitest)
- `npm run test:watch` - Vitest in watch mode
- `npm run test:coverage` - coverage report
- `npm run test:e2e` - Playwright e2e tests

## Architecture

Vue 3 Composition API (`<script setup>`). No Vuex/Pinia - shared state via exported `ref` in plain JS modules.

### Shared modules (import from these, don't duplicate)
- `src/musicConstants.js` - all music constants (NOTES, LABELS, SHARPS, CHORD_TYPES, CHORD_SUFFIX, FLAT_MAP, OPEN_STRINGS, STRING_NAMES, FRET_COUNT, NOTE_TO_SEMI, SEMI_TO_NAME, CHORD_DETECT_TYPES)
- `src/musicUtils.js` - `buildRows(activeSet, rootPad, cols)` and `buildGuitarNeck(cellExtras)`
- `src/displayMode.js` - global display mode ref (`'pad' | 'notes' | 'guitar' | 'piano'`)
- `src/padSize.js` - pad grid size ref (`'4x3' | '4x4'`)

### Shared components
- `ChordCardBody.vue` - three-mode chord display used by ChordProgressions and ProgressionBuilder

## Display modes
Every tab adapts to three modes. Components import `displayMode` directly from `src/displayMode.js`.
- **Pad**: 4×3 or 4×4 chromatic pad grid (size set by `padSize` ref; rows top→bottom = high→low pitch)
- **Notes**: chromatic note name buttons/tiles
- **Guitar**: 12-fret neck or chord diagram (standard tuning)

Claves Mode (deleted) was `padOnly: true` - this pattern still exists in App.vue for future use.

## Music conventions
- Notes array is **A-based** (index 0 = A): `['A','A#','B','C','C#','D','D#','E','F','F#','G','G#']`
- Guitar open strings (A-based indices, low→high): `[7, 0, 5, 10, 2, 7]` = E2 A2 D3 G3 B3 E4
- Chord detection uses C-based semitones internally (NOTE_TO_SEMI / SEMI_TO_NAME for conversion)

## Style
- Dark warm palette: background `#242019`, accent `#c8a96e`, muted `#7a6f60`
- Scoped CSS in every SFC; no global stylesheet beyond `src/style.css`
- No emojis, no unnecessary comments

@ROADMAP.md
