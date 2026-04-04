# Architecture Guide

> **Purpose:** This document defines patterns, APIs, and conventions for the tonarium codebase. Following these patterns reduces context needed for AI-assisted development and ensures consistency.

---

## Table of Contents
1. [CSS Architecture](#1-css-architecture)
2. [Component API Contracts](#2-component-api-contracts)
3. [Directory Map](#3-directory-map)
4. [State Modules](#4-state-modules)
5. [Quick Reference](#5-quick-reference)

---

## 1. CSS Architecture

### 1.1 Design Tokens

All magic values are replaced with CSS custom properties:

```css
/* src/styles/base/tokens.css */

:root {
  /* ══════════════════════════════════════════════════════════════════════════
     SPACING SCALE (based on 0.25rem = 4px)
     ══════════════════════════════════════════════════════════════════════════ */
  --space-0: 0;
  --space-1: 0.25rem;   /*  4px */
  --space-2: 0.5rem;    /*  8px */
  --space-3: 0.75rem;   /* 12px */
  --space-4: 1rem;      /* 16px */
  --space-5: 1.25rem;   /* 20px */
  --space-6: 1.5rem;    /* 24px */
  --space-8: 2rem;      /* 32px */

  /* ══════════════════════════════════════════════════════════════════════════
     TYPOGRAPHY SCALE (based on analysis of actual usage)
     ══════════════════════════════════════════════════════════════════════════ */
  --text-2xs: 0.65rem;  /* 10.4px - tiny labels */
  --text-xs: 0.72rem;   /* 11.5px - badges, hints */
  --text-sm: 0.78rem;   /* 12.5px - secondary text (16 uses) */
  --text-base: 0.82rem; /* 13.1px - body text (21 uses) */
  --text-md: 0.85rem;   /* 13.6px - emphasized (17 uses) */
  --text-lg: 0.9rem;    /* 14.4px - subheadings */
  --text-xl: 1rem;      /* 16px - headings */
  --text-2xl: 1.1rem;   /* 17.6px - page titles */

  /* ══════════════════════════════════════════════════════════════════════════
     BORDER RADIUS SCALE
     ══════════════════════════════════════════════════════════════════════════ */
  --radius-sm: 4px;     /* small buttons, inputs */
  --radius-md: 6px;     /* standard buttons */
  --radius-lg: 8px;     /* cards, panels */
  --radius-xl: 10px;    /* large cards */
  --radius-full: 9999px; /* pills, circles */

  /* ══════════════════════════════════════════════════════════════════════════
     FONT WEIGHTS
     ══════════════════════════════════════════════════════════════════════════ */
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;

  /* ══════════════════════════════════════════════════════════════════════════
     TRANSITIONS
     ══════════════════════════════════════════════════════════════════════════ */
  --transition-fast: 0.1s;
  --transition-base: 0.15s;
  --transition-slow: 0.25s;
}
```

### 1.2 Button System

One base class, modifiers for variants:

```css
/* src/styles/components/buttons.css */

/* ─────────────────────────────────────────────────────────────────────────────
   BASE BUTTON
   All buttons extend this. Never style raw <button> elements.
   ───────────────────────────────────────────────────────────────────────────── */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-md);
  border: 1px solid var(--border2);
  background: transparent;
  color: var(--text3);
  font-size: var(--text-base);
  font-weight: var(--font-semibold);
  font-family: inherit;
  cursor: pointer;
  transition: color var(--transition-base), 
              border-color var(--transition-base), 
              background var(--transition-base);
}

.btn:hover:not(:disabled) {
  color: var(--accent);
  border-color: var(--accent-mid);
  background: var(--accent-bg);
}

.btn:disabled {
  opacity: 0.25;
  cursor: default;
}

/* ─────────────────────────────────────────────────────────────────────────────
   SIZE VARIANTS
   ───────────────────────────────────────────────────────────────────────────── */
.btn-xs {
  padding: var(--space-1) var(--space-2);
  font-size: var(--text-xs);
  border-radius: var(--radius-sm);
}

.btn-sm {
  padding: var(--space-1) var(--space-3);
  font-size: var(--text-sm);
}

.btn-lg {
  padding: var(--space-3) var(--space-5);
  font-size: var(--text-md);
}

/* ─────────────────────────────────────────────────────────────────────────────
   STYLE VARIANTS
   ───────────────────────────────────────────────────────────────────────────── */
.btn-primary {
  background: var(--accent-bg);
  border-color: var(--accent-mid);
  color: var(--accent);
}

.btn-primary:hover:not(:disabled) {
  background: var(--accent);
  border-color: var(--accent);
  color: var(--on-accent);
}

.btn-ghost {
  border-color: transparent;
  background: transparent;
}

.btn-ghost:hover:not(:disabled) {
  background: var(--hover);
  border-color: transparent;
}

/* ─────────────────────────────────────────────────────────────────────────────
   STATE VARIANTS
   ───────────────────────────────────────────────────────────────────────────── */
.btn.active,
.btn[aria-pressed="true"] {
  background: var(--accent-bg);
  border-color: var(--accent-mid);
  color: var(--accent);
}

/* ─────────────────────────────────────────────────────────────────────────────
   LAYOUT VARIANTS
   ───────────────────────────────────────────────────────────────────────────── */
.btn-block {
  width: 100%;
}

.btn-icon {
  padding: var(--space-2);
  min-width: 2rem;
  min-height: 2rem;
}
```

**Usage:**
```html
<button class="btn">Default</button>
<button class="btn btn-primary">Primary</button>
<button class="btn btn-sm btn-ghost">Small Ghost</button>
<button class="btn btn-icon" aria-label="Close">✕</button>
<button class="btn" :class="{ active: isActive }">Toggle</button>
```

### 1.3 Card System

```css
/* src/styles/components/cards.css */

.card {
  background: var(--raised);
  border: 1px solid var(--border2);
  border-radius: var(--radius-xl);
  padding: var(--space-4);
}

.card-sm {
  padding: var(--space-3);
  border-radius: var(--radius-lg);
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  margin-bottom: var(--space-3);
}

.card-title {
  font-size: var(--text-md);
  font-weight: var(--font-bold);
  color: var(--accent);
}

.card-subtitle {
  font-size: var(--text-sm);
  color: var(--text3);
}

.card-body {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.card-footer {
  margin-top: var(--space-3);
  padding-top: var(--space-3);
  border-top: 1px solid var(--border);
}
```

### 1.4 Form Controls

```css
/* src/styles/components/forms.css */

.form-select {
  padding: var(--space-2) var(--space-3);
  padding-right: var(--space-6);
  border: 1px solid var(--border2);
  border-radius: var(--radius-md);
  background: var(--input);
  color: var(--text);
  font-size: var(--text-base);
  font-family: inherit;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,..."); /* chevron */
  background-repeat: no-repeat;
  background-position: right var(--space-2) center;
}

.form-input {
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--border2);
  border-radius: var(--radius-md);
  background: var(--input);
  color: var(--text);
  font-size: var(--text-base);
  font-family: inherit;
}

.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: var(--accent-mid);
}

.form-label {
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  color: var(--text3);
}
```

### 1.5 Layout Utilities

```css
/* src/styles/utilities/layout.css */

/* Flex */
.flex { display: flex; }
.flex-col { flex-direction: column; }
.flex-wrap { flex-wrap: wrap; }
.items-center { align-items: center; }
.items-start { align-items: flex-start; }
.justify-center { justify-content: center; }
.justify-between { justify-content: space-between; }

/* Gap */
.gap-1 { gap: var(--space-1); }
.gap-2 { gap: var(--space-2); }
.gap-3 { gap: var(--space-3); }
.gap-4 { gap: var(--space-4); }
.gap-5 { gap: var(--space-5); }
.gap-6 { gap: var(--space-6); }

/* Width */
.w-full { width: 100%; }
```

### 1.6 File Structure

```
src/styles/
├── index.css              ← imports all, used in main.js
├── base/
│   ├── reset.css          ← box-sizing, margin reset
│   ├── tokens.css         ← spacing, typography, radius scales
│   └── colors.css         ← color scheme variables (from style.css)
├── components/
│   ├── buttons.css        ← .btn and variants
│   ├── cards.css          ← .card and variants
│   ├── forms.css          ← inputs, selects, toggles
│   ├── pills.css          ← .note-pill, .scale-tab
│   └── page-header.css    ← .page-header styles
├── layouts/
│   └── picker-row.css     ← .picker-row, .picker-label
└── utilities/
    └── layout.css         ← flex, gap, width utilities
```

**index.css:**
```css
/* Base (order matters) */
@import './base/reset.css';
@import './base/tokens.css';
@import './base/colors.css';

/* Components */
@import './components/buttons.css';
@import './components/cards.css';
@import './components/forms.css';
@import './components/pills.css';
@import './components/page-header.css';

/* Layouts */
@import './layouts/picker-row.css';

/* Utilities (last, highest specificity) */
@import './utilities/layout.css';
```

---

## 2. Component API Contracts

### 2.1 PageHeader

**File:** `src/components/ui/PageHeader.vue`

**Purpose:** Consistent page header with title, optional subtitle, optional action slot.

```typescript
// Props
interface PageHeaderProps {
  title: string       // Required. Page title text.
  subtitle?: string   // Optional. Subtitle/description text.
}

// Slots
// #actions - Right-aligned action buttons (e.g., close button in Settings)

// Events
// None
```

**Template:**
```vue
<script setup>
defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
})
</script>

<template>
  <div class="page-header">
    <div class="page-header-content">
      <h2 class="page-header-title">{{ title }}</h2>
      <p v-if="subtitle" class="page-header-subtitle">{{ subtitle }}</p>
    </div>
    <div v-if="$slots.actions" class="page-header-actions">
      <slot name="actions" />
    </div>
  </div>
</template>
```

**Usage:**
```vue
<!-- Simple -->
<PageHeader title="About" />

<!-- With subtitle -->
<PageHeader title="Jam Mode" :subtitle="subtitle" />

<!-- With actions -->
<PageHeader title="Settings">
  <template #actions>
    <button class="btn btn-icon" @click="close">✕</button>
  </template>
</PageHeader>
```

**CSS Contract:** Uses `.page-header`, `.page-header-title`, `.page-header-subtitle`, `.page-header-actions`

---

### 2.2 NoteStripPicker

**File:** `src/components/ui/NoteStripPicker.vue`

**Purpose:** Horizontal strip of 12 chromatic notes for selection.

```typescript
// Props
interface NoteStripPickerProps {
  modelValue: number | null        // Selected note index (0-11), or null
  highlightSet?: Set<number>       // Additional notes to highlight (e.g., scale notes)
  fromIndex?: number | null        // "From" note for interval display
  toIndex?: number | null          // "To" note for interval display
  small?: boolean                  // Compact size variant
  disabled?: boolean               // Disable interaction
}

// Events
// @update:modelValue - Emitted when note is selected
// @note-down - Emitted on pointerdown (for audio playback)
```

**Template:**
```vue
<script setup>
import { CHROMATIC, IS_SHARP } from '@/constants/musicConstants'

const props = defineProps({
  modelValue: { type: Number, default: null },
  highlightSet: { type: Set, default: () => new Set() },
  fromIndex: { type: Number, default: null },
  toIndex: { type: Number, default: null },
  small: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue', 'note-down'])

function onNoteDown(index) {
  if (props.disabled) return
  emit('note-down', index)
  emit('update:modelValue', index)
}
</script>

<template>
  <div class="note-strip" :class="{ small, disabled }">
    <button
      v-for="(note, i) in CHROMATIC"
      :key="i"
      type="button"
      class="note-pill"
      :class="{
        sharp: IS_SHARP.has(i),
        selected: modelValue === i,
        highlight: highlightSet.has(i),
        from: fromIndex === i,
        to: toIndex === i,
      }"
      :disabled="disabled"
      @pointerdown.prevent="onNoteDown(i)"
    >
      {{ note }}
    </button>
  </div>
</template>
```

**Usage:**
```vue
<!-- Simple selection -->
<NoteStripPicker v-model="rootNote" @note-down="playNote" />

<!-- With scale highlighting -->
<NoteStripPicker 
  v-model="selectedNote" 
  :highlight-set="scaleNotes"
  @note-down="playNote"
/>

<!-- Interval picker (from/to) -->
<NoteStripPicker
  :from-index="fromIdx"
  :to-index="toIdx"
  @note-down="pickIntervalNote"
/>
```

---

### 2.3 Card

**File:** `src/components/ui/Card.vue`

**Purpose:** Generic card container with optional header.

```typescript
// Props
interface CardProps {
  title?: string      // Optional card title
  subtitle?: string   // Optional subtitle
  small?: boolean     // Compact padding variant
}

// Slots
// default - Card body content
// #header - Custom header content (overrides title/subtitle)
// #footer - Footer content
```

**Template:**
```vue
<script setup>
defineProps({
  title: { type: String, default: '' },
  subtitle: { type: String, default: '' },
  small: { type: Boolean, default: false },
})
</script>

<template>
  <div class="card" :class="{ 'card-sm': small }">
    <div v-if="$slots.header || title" class="card-header">
      <slot name="header">
        <div>
          <div v-if="title" class="card-title">{{ title }}</div>
          <div v-if="subtitle" class="card-subtitle">{{ subtitle }}</div>
        </div>
      </slot>
    </div>
    <div class="card-body">
      <slot />
    </div>
    <div v-if="$slots.footer" class="card-footer">
      <slot name="footer" />
    </div>
  </div>
</template>
```

---

### 2.4 PickerRow

**File:** `src/components/ui/PickerRow.vue`

**Purpose:** Label + control layout for form rows.

```typescript
// Props
interface PickerRowProps {
  label: string       // Row label text
}

// Slots
// default - Control content
```

**Template:**
```vue
<script setup>
defineProps({
  label: { type: String, required: true },
})
</script>

<template>
  <div class="picker-row">
    <span class="picker-label">{{ label }}</span>
    <div class="picker-control">
      <slot />
    </div>
  </div>
</template>
```

**Usage:**
```vue
<PickerRow label="Root">
  <NoteStripPicker v-model="root" />
</PickerRow>

<PickerRow label="Scale">
  <select class="form-select" v-model="scale">...</select>
</PickerRow>
```

---

### 2.5 GuitarNeck

**File:** `src/components/music/GuitarNeck.vue`

**Purpose:** Shared 6-string guitar neck grid. Used by `ScaleVisualizer`, `JamMode`, and `ChordDetector` to avoid duplicating ~35 lines of template and ~52 lines of CSS.

```typescript
// Props
interface GuitarNeckProps {
  strings: Array<{        // Required. Output of buildGuitarNeck() from musicUtils.js
    stringIdx: number
    name: string
    cells: Array<{
      noteIdx: number
      note: string
      fret: number
      isOpen: boolean
      // ...any extra fields added via buildGuitarNeck's cellExtras callback
    }>
  }>
  cellClass?: (cell) => object  // Optional. Returns :class binding for each neck cell.
}

// Emits
// @cell-down(stringIdx, fret, noteIdx) — pointerdown on a cell
// @cell-up(stringIdx, fret)            — pointerup/leave/cancel on a cell

// Slots
// #cell({ cell }) — content inside each neck cell (e.g. a dot or note label)
```

**Usage:**
```vue
<GuitarNeck
  :strings="guitarNeck"
  :cell-class="cell => ({ active: cell.isActive, root: cell.isRoot })"
  @cell-down="onCellDown"
  @cell-up="onCellUp"
>
  <template #cell="{ cell }">
    <span v-if="cell.isActive" class="neck-dot" :class="{ root: cell.isRoot }"></span>
  </template>
</GuitarNeck>
```

**Building `strings`:** Always use `buildGuitarNeck` from `@/utils/musicUtils.js`. Pass a `cellExtras` callback to attach page-specific flags (`isActive`, `isRoot`, `isSelected`, etc.) to each cell.

```js
const guitarNeck = computed(() =>
  buildGuitarNeck(noteIdx => ({
    isActive: activeIndices.value.has(noteIdx),
    isRoot:   noteIdx === rootIndex.value,
  }))
)
```

**Page-specific styles:** Each page is responsible for styling its own cell content (dots, labels) and any cell modifier classes it adds via `cellClass`. Use `:deep()` when overriding GuitarNeck's scoped styles.

---

## 3. Directory Map

```
src/
├── pages/                        ← route-level page components (10)
│   ├── AboutPage.vue
│   ├── ChordDetector.vue
│   ├── ChordProgressions.vue
│   ├── DrumComputer.vue
│   ├── JamMode.vue
│   ├── LearnMode.vue             ← thin orchestrator, 64 lines
│   ├── ProgressionBuilder.vue
│   ├── ScaleVisualizer.vue
│   ├── SettingsPage.vue
│   └── StartPage.vue
│
├── components/
│   ├── ui/                       ← generic, reusable
│   │   ├── Card.vue
│   │   ├── NoteStripPicker.vue
│   │   ├── PageHeader.vue
│   │   └── PickerRow.vue
│   ├── music/                    ← music-domain display
│   │   ├── ChordCardBody.vue
│   │   ├── GuitarChordDiagram.vue
│   │   ├── GuitarNeck.vue        ← shared neck grid (ScaleVisualizer, JamMode, ChordDetector)
│   │   ├── MidiControl.vue
│   │   ├── PianoOctave.vue
│   │   ├── RootNotePicker.vue
│   │   └── ScaleLegend.vue
│   ├── learn/                    ← LearnMode sub-components
│   │   ├── LearnBeats.vue
│   │   ├── LearnChords.vue
│   │   ├── LearnImprovising.vue
│   │   ├── LearnIntervals.vue
│   │   ├── LearnProgressions.vue
│   │   ├── LearnRootNotes.vue
│   │   ├── LearnScales.vue
│   │   ├── LearnStepFooter.vue
│   │   └── LearnStepNav.vue
│   ├── progressions/             ← ChordProgressions sub-components
│   │   ├── GenreTabs.vue
│   │   ├── ProgressionCard.vue
│   │   └── ProgressionSection.vue
│   ├── jam/                      ← JamMode sub-components
│   │   ├── OctaveControl.vue
│   │   └── ScaleSelector.vue
│   └── layout/
│       └── ModeLayout.vue        ← display-mode conditional wrapper (pad/notes/guitar/piano)
│
├── state/                        ← shared reactive state (exported refs)
│   ├── colorMode.js
│   ├── colorScheme.js
│   ├── displayMode.js
│   ├── octave.js
│   ├── padSize.js                ← exports padSize ref + padCols computed
│   ├── soundEnabled.js
│   └── soundStyle.js
│
├── constants/
│   ├── beatPatterns.js
│   ├── chordTypes.js
│   ├── intervals.js
│   ├── musicConstants.js         ← NOTES, LABELS, SHARPS, SEMI_TO_NAME, CHORD_TYPES, etc.
│   ├── progressions.js           ← GENRES, ALL_PROGRESSIONS, LEARN_PROGS
│   └── scales.js                 ← JAM_SCALES, VISUALIZER_SCALES, LEARN_SCALES
│
├── utils/
│   ├── chordDetect.js
│   └── musicUtils.js             ← buildRows(), sliceRows(), buildGuitarNeck()
│
├── audio/
│   ├── audioEngine.js
│   ├── drumEngine.js
│   └── midiManager.js
│
├── composables/
│   └── useNotePlayback.js        ← pressDown/pressUp/pressToggle/releaseAll + onUnmounted cleanup
│
└── styles/                       ← design system (see Section 1)
    ├── index.css
    ├── base/
    ├── components/
    ├── layouts/
    └── utilities/
```

---

## 4. State Modules

All state lives in `src/state/` as plain JS files exporting Vue `ref`s (and `computed`s where useful). No Vuex/Pinia.

| Module | Exports | Persisted |
|--------|---------|-----------|
| `displayMode.js` | `displayMode` ref (`'pad' \| 'notes' \| 'guitar' \| 'piano'`) | No |
| `padSize.js` | `padSize` ref (`'4x3' \| '4x4'`), `padCols` computed (`3 \| 4`) | No |
| `octave.js` | `octave` ref (number) | No |
| `colorMode.js` | `colorMode` ref (`'dark' \| 'light'`) | `localStorage` |
| `colorScheme.js` | `colorScheme` ref (`'none' \| 'medieval' \| 'ko2' \| 'riddim'`) | `localStorage` |
| `soundEnabled.js` | `soundEnabled` ref (boolean) | `localStorage` |
| `soundStyle.js` | `soundStyle` ref (string) | `localStorage` |

**`padCols` is the canonical way to get the current column count.** Never inline the ternary:

```js
// Correct
import { padCols } from '@/state/padSize.js'
buildRows(set, root, padCols.value)

// Wrong — don't do this
import { padSize } from '@/state/padSize.js'
buildRows(set, root, padSize.value === '4x4' ? 4 : 3)
```

---

## 5. Quick Reference

### CSS Class Naming

| Type | Pattern | Example |
|------|---------|---------|
| Component | `.component-name` | `.page-header` |
| Element | `.component-element` | `.page-header-title` |
| Modifier | `.component--modifier` | `.card--small` or `.card-sm` |
| State | `.is-state` or `.state` | `.is-active`, `.active` |
| Utility | `.property-value` | `.flex`, `.gap-2` |

### Import Patterns (with @/ alias)

```js
// Pages
import StartPage from '@/pages/StartPage.vue'

// UI Components
import PageHeader from '@/components/ui/PageHeader.vue'
import NoteStripPicker from '@/components/ui/NoteStripPicker.vue'

// Music Components
import PianoOctave from '@/components/music/PianoOctave.vue'
import GuitarNeck from '@/components/music/GuitarNeck.vue'

// Constants
import { NOTES, SEMI_TO_NAME, CHORD_TYPES } from '@/constants/musicConstants.js'
import { JAM_SCALES } from '@/constants/scales.js'

// Utils
import { buildRows, buildGuitarNeck } from '@/utils/musicUtils.js'

// State
import { displayMode } from '@/state/displayMode.js'
import { padCols } from '@/state/padSize.js'  // use padCols, not padSize, for column count

// Audio
import { playNote } from '@/audio/audioEngine.js'

// Composables
import { useNotePlayback } from '@/composables/useNotePlayback.js'
```

### Music Constants Cheat Sheet

| Constant | Type | Description |
|----------|------|-------------|
| `NOTES` | `string[12]` | A-based note names: `['A','A#','B','C',...]` |
| `SEMI_TO_NAME` | `string[12]` | C-based chromatic names: `['C','C#','D',...]` |
| `NOTE_TO_SEMI` | `number[12]` | A-based index → C-based semitone offset |
| `SHARPS` | `Set<string>` | Set of sharp note names |
| `CHORD_TYPES` | `object` | Interval arrays keyed by type: `maj`, `min`, `dim`, etc. |
| `OPEN_STRINGS` | `number[6]` | Guitar open string note indices (low→high) |
| `FRET_COUNT` | `number` | Number of frets on the neck (currently 7) |

**Do not define local `CHROMATIC` arrays** — use `SEMI_TO_NAME` from `musicConstants.js` instead.

### File Naming

| Type | Convention | Example |
|------|------------|---------|
| Page | `PascalCase.vue` | `StartPage.vue` |
| Component | `PascalCase.vue` | `PageHeader.vue` |
| Test | `*.test.js` colocated | `PageHeader.test.js` |
| Constant | `camelCase.js` | `musicConstants.js` |
| Util | `camelCase.js` | `musicUtils.js` |
| State | `camelCase.js` | `displayMode.js` |
| CSS | `kebab-case.css` | `page-header.css` |
