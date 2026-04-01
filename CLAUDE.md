# Tonarium — Claude Code Instructions

## Commands
- `npm run dev` — start dev server
- `npm run build` — Vite build (base path `/tonarium/`)
- `npm test` — run unit and component tests (Vitest)
- `npm run test:watch` — Vitest in watch mode
- `npm run test:coverage` — coverage report
- `npm run test:e2e` — Playwright e2e tests

## Architecture

Vue 3 Composition API (`<script setup>`). No Vuex/Pinia — shared state via exported `ref` in plain JS modules.

### Shared modules (import from these, don't duplicate)
- `src/musicConstants.js` — all music constants (NOTES, LABELS, SHARPS, CHORD_TYPES, CHORD_SUFFIX, FLAT_MAP, OPEN_STRINGS, STRING_NAMES, FRET_COUNT, NOTE_TO_SEMI, SEMI_TO_NAME, CHORD_DETECT_TYPES)
- `src/musicUtils.js` — `buildRows(activeSet, rootPad)` and `buildGuitarNeck(cellExtras)`
- `src/displayMode.js` — global display mode ref (`'ep1320' | 'notes' | 'guitar'`)

### Shared components
- `ChordCardBody.vue` — three-mode chord display used by ChordProgressions and ProgressionBuilder

## Display modes
Every tab adapts to three modes. Components import `displayMode` directly from `src/displayMode.js`.
- **EP-1320**: 4×3 pad grid (rows = `[9-11], [6-8], [3-5], [0-2]` top→bottom)
- **Notes**: chromatic note name buttons/tiles
- **Guitar**: 12-fret neck or chord diagram (standard tuning)

Claves Mode is `ep1320Only: true` — hidden in Notes/Guitar modes.

## Music conventions
- Notes array is **A-based** (index 0 = A): `['A','A#','B','C','C#','D','D#','E','F','F#','G','G#']`
- Guitar open strings (A-based indices, low→high): `[7, 0, 5, 10, 2, 7]` = E2 A2 D3 G3 B3 E4
- Chord detection uses C-based semitones internally (NOTE_TO_SEMI / SEMI_TO_NAME for conversion)

## Style
- Dark warm palette: background `#242019`, accent `#c8a96e`, muted `#7a6f60`
- Scoped CSS in every SFC; no global stylesheet beyond `src/style.css`
- No emojis, no unnecessary comments

@ROADMAP.md
