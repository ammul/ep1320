# Architecture Guide

> **Purpose:** This document defines patterns, APIs, and conventions for the tonarium codebase. Following these patterns reduces context needed for AI-assisted development and ensures consistency.

---

## Table of Contents
1. [CSS Architecture](#1-css-architecture)
2. [Component API Contracts](#2-component-api-contracts)
3. [Phased PR Strategy](#3-phased-pr-strategy)
4. [ChordProgressions Extraction](#4-chordprogressions-extraction)
5. [JamMode Extraction](#5-jammode-extraction)

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

## 3. Phased PR Strategy

### PR Naming Convention
```
refactor/<phase>-<description>
```

### PR 1: Style System Foundation
**Branch:** `refactor/01-style-system`
**Files:**
- Create `src/styles/` directory structure
- Create `base/tokens.css`, `base/reset.css`
- Create `components/buttons.css`
- Update `main.js` to import `styles/index.css`
- Keep `style.css` temporarily (colors only)

**Tests:** No changes (220 pass)
**Risk:** Low

---

### PR 2: Directory Restructure
**Branch:** `refactor/02-directory-structure`
**Files:**
- Add `@/` alias to vite.config.js, vitest.config.js
- Create `src/pages/`, move 10 page components
- Create `src/audio/`, move 3 files + 2 tests
- Create `src/state/`, move 7 files
- Create `src/utils/`, move 2 files + 2 tests
- Create `src/constants/`, move 1 file + 1 test
- Update ALL imports to use `@/` alias

**Tests:** Path updates only (220 pass)
**Risk:** Medium (many file moves, but mechanical)

---

### PR 3: PageHeader Component
**Branch:** `refactor/03-page-header`
**Files:**
- Create `src/components/ui/PageHeader.vue`
- Create `src/components/ui/PageHeader.test.js`
- Create `src/styles/components/page-header.css`
- Update 8 pages to use PageHeader
- Remove header CSS from each page

**Tests:** Update selectors in page tests (220 pass)
**Risk:** Low

---

### PR 4: NoteStripPicker Component
**Branch:** `refactor/04-note-strip-picker`
**Files:**
- Create `src/components/ui/NoteStripPicker.vue`
- Create `src/components/ui/NoteStripPicker.test.js`
- Create `src/styles/components/pills.css`
- Update LearnMode.vue (4 instances)
- Update ChordDetector.vue (1 instance)

**Tests:** May need selector updates (220 pass)
**Risk:** Medium (LearnMode is complex)

---

### PR 5: Card + PickerRow Components
**Branch:** `refactor/05-card-picker-row`
**Files:**
- Create `src/components/ui/Card.vue` + test
- Create `src/components/ui/PickerRow.vue` + test
- Create `src/styles/components/cards.css`
- Create `src/styles/layouts/picker-row.css`
- Reorganize `src/components/` into subdirs (music/, layout/)

**Tests:** 220+ pass
**Risk:** Low

---

### PR 6: LearnMode Step 1-3 Extraction
**Branch:** `refactor/06-learn-steps-1-3`
**Files:**
- Create `src/components/learn/LearnStepNav.vue` + test
- Create `src/components/learn/LearnRootNotes.vue` + test
- Create `src/components/learn/LearnIntervals.vue` + test
- Create `src/components/learn/LearnScales.vue` + test
- Update LearnMode.vue to use new components
- Split LearnMode.test.js

**Tests:** ~235 pass (new tests added)
**Risk:** High (most complex refactor)

---

### PR 7: LearnMode Step 4-7 Extraction
**Branch:** `refactor/07-learn-steps-4-7`
**Files:**
- Create LearnProgressions, LearnChords, LearnImprovising, LearnBeats
- Create LearnStepFooter.vue
- Finalize LearnMode.vue as orchestration-only
- Complete test migration

**Tests:** ~260 pass
**Risk:** High

---

### PR 8: Constants Extraction
**Branch:** `refactor/08-constants`
**Files:**
- Create `src/constants/scales.js` (JAM_SCALES, VISUALIZER_SCALES, LEARN_SCALES)
- Create `src/constants/intervals.js`
- Create `src/constants/progressions.js`
- Update imports in affected components

**Tests:** 260 pass
**Risk:** Low

---

### PR 9: ChordProgressions Cleanup (Optional)
**Branch:** `refactor/09-chord-progressions`
**See Section 4 below**

---

### PR 10: JamMode Cleanup (Optional)
**Branch:** `refactor/10-jam-mode`
**See Section 5 below**

---

## 4. ChordProgressions Extraction

**Current:** 925 lines (371 CSS)

### Structure Analysis

```
ChordProgressions.vue
├── Script (220 lines)
│   ├── Constants: GENRES, ALL_PROGRESSIONS (150+ lines of data)
│   ├── State: selectedRoot, selectedGenre, expandedId, loopPlaying, bpm
│   ├── Computed: filteredProgressions, filteredGroupedByKey
│   └── Methods: play/stop chord, loop controls
├── Template (330 lines)
│   ├── Header (title + subtitle)
│   ├── Controls row (root picker, genre tabs, BPM)
│   ├── Progression sections (major/minor)
│   │   └── Progression cards (repeated pattern)
│   └── Chord card body (delegated to ChordCardBody)
└── Styles (371 lines)
```

### Extraction Plan

**Move to constants:**
```
src/constants/progressions.js
├── export const GENRES = [...]
└── export const ALL_PROGRESSIONS = [...]
```

**Extract components:**
```
src/components/progressions/
├── GenreTabs.vue           ← tab row for genre filtering
├── ProgressionSection.vue  ← "Major Key" / "Minor Key" collapsible section
└── ProgressionCard.vue     ← single progression with play/loop controls
```

**After extraction:** ~200 lines

### ProgressionCard API

```typescript
interface ProgressionCardProps {
  progression: {
    id: string
    label: string
    numeral: string
    examples: string
    chords: Array<{ degree: number, type: string, numeral: string }>
  }
  rootNote: string
  isExpanded: boolean
  isPlaying: boolean
}

// Events
// @toggle-expand
// @play
// @stop
// @loop-start
// @loop-stop
```

---

## 5. JamMode Extraction

**Current:** 657 lines (357 CSS)

### Structure Analysis

```
JamMode.vue
├── Script (130 lines)
│   ├── Constants: SCALES (60 lines)
│   ├── State: selectedRoot, selectedScaleId, showInfo, pianoOctave
│   ├── Computed: activeIndices, anchorIndices, subtitle
│   └── Methods: note playback via useNotePlayback
├── Template (170 lines)
│   ├── Header (title + computed subtitle)
│   ├── Picker rows (root, scale, octave)
│   ├── Scale info panel (collapsible)
│   ├── ModeLayout (delegates to display mode)
│   └── ScaleLegend
└── Styles (357 lines)
```

### Extraction Plan

**Move to constants:**
```
src/constants/scales.js
└── export const JAM_SCALES = [...]  // with descriptions
```

**Extract components:**
```
src/components/jam/
├── ScaleSelector.vue    ← dropdown + description panel
└── OctaveControl.vue    ← octave up/down buttons (also used elsewhere?)
```

**After extraction:** ~150 lines

### ScaleSelector API

```typescript
interface ScaleSelectorProps {
  modelValue: string           // scale ID
  scales: Array<{
    id: string
    label: string
    description: string
    intervals: number[]
  }>
  showInfo: boolean
}

// Events
// @update:modelValue
// @update:showInfo
```

---

## Quick Reference

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

// Constants
import { NOTES, CHROMATIC } from '@/constants/musicConstants'
import { JAM_SCALES } from '@/constants/scales'

// Utils
import { buildRows } from '@/utils/musicUtils'

// State
import { displayMode } from '@/state/displayMode'

// Audio
import { playNote } from '@/audio/audioEngine'

// Composables
import { useNotePlayback } from '@/composables/useNotePlayback'
```

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
