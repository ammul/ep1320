# Expanded Refactor Plan v2

## Overview

**Current state:**
- 6,818 lines across 17 Vue components
- 3,677 lines of CSS embedded in components (54% of total)
- LearnMode.vue alone: 2,077 lines (1,266 CSS)
- Limited shared components (only RootNotePicker, ScaleLegend, PianoOctave, GuitarChordDiagram)
- Repeated patterns: page headers (7 pages), subtitles (6 pages), buttons (20+ variants)
- 220 tests across 11 test files

**Goals:**
1. Extract CSS into a style system (`src/styles/`)
2. Break large pages into smaller, composable components
3. Create reusable UI primitives (buttons, cards, inputs)
4. Consolidate repeated patterns across ALL pages, not just LearnMode
5. Move pages to `src/pages/`, keep only reusable components in `src/components/`
6. Update tests to match new structure while maintaining coverage
7. **Reduce token consumption** by establishing clear, predictable patterns

---

## Architecture Guide (READ THIS FIRST)

This section defines conventions so anyone (human or AI) working on the codebase knows exactly where things go. **Following these conventions = less exploration = fewer tokens.**

### File Naming Conventions

| Type | Pattern | Example |
|------|---------|---------|
| Page component | `XxxPage.vue` or `XxxMode.vue` | `SettingsPage.vue`, `LearnMode.vue` |
| UI component | `PascalCase.vue` | `PageHeader.vue`, `Card.vue` |
| Composable | `useXxx.js` | `useNotePlayback.js` |
| State module | `camelCase.js` | `displayMode.js`, `colorScheme.js` |
| Constants | `camelCase.js` | `musicConstants.js`, `scales.js` |
| Utils | `camelCase.js` | `musicUtils.js`, `chordDetect.js` |
| Test file | `[filename].test.js` colocated | `PageHeader.test.js` |
| CSS module | `kebab-case.css` | `buttons.css`, `page-header.css` |

### Import Order Convention

```js
// 1. Vue core
import { ref, computed, watch } from 'vue'

// 2. Components (alphabetical)
import Card from '@/components/ui/Card.vue'
import PageHeader from '@/components/ui/PageHeader.vue'

// 3. Composables
import { useNotePlayback } from '@/composables/useNotePlayback.js'

// 4. State
import { displayMode } from '@/state/displayMode.js'

// 5. Constants
import { NOTES, SCALES } from '@/constants/musicConstants.js'

// 6. Utils
import { buildRows } from '@/utils/musicUtils.js'

// 7. Audio
import { playNote } from '@/audio/audioEngine.js'
```

### Directory Quick Reference

| Directory | What goes here |
|-----------|----------------|
| `pages/` | Route-level views (10 files) |
| `components/ui/` | Generic UI (PageHeader, Card, NoteStripPicker) |
| `components/music/` | Music-domain reusable (PianoOctave, GuitarChordDiagram) |
| `components/learn/` | LearnMode sub-components only |
| `components/layout/` | Structural wrappers (ModeLayout) |
| `composables/` | `useXxx()` functions |
| `state/` | Global reactive refs (7 files) |
| `constants/` | Static data arrays/objects |
| `utils/` | Pure functions, no Vue |
| `audio/` | Web Audio, MIDI (3 files) |
| `styles/` | CSS system |

---

## 1. CSS Architecture (Design System)

### 1a. Design Tokens

Based on analysis of repeated values across components:

```css
/* src/styles/base/tokens.css */

:root {
  /* ═══ Spacing Scale ═══ */
  --space-1: 0.15rem;   /* 2.4px - tight */
  --space-2: 0.25rem;   /* 4px */
  --space-3: 0.35rem;   /* 5.6px */
  --space-4: 0.5rem;    /* 8px - common gap */
  --space-5: 0.6rem;    /* 9.6px */
  --space-6: 0.75rem;   /* 12px - common gap */
  --space-7: 1rem;      /* 16px - section gap */
  --space-8: 1.25rem;   /* 20px */
  --space-9: 1.5rem;    /* 24px */
  --space-10: 2rem;     /* 32px - page padding */

  /* ═══ Typography Scale ═══ */
  --text-2xs: 0.65rem;  /* 10.4px - tiny labels */
  --text-xs: 0.72rem;   /* 11.5px - labels */
  --text-sm: 0.78rem;   /* 12.5px - secondary */
  --text-base: 0.85rem; /* 13.6px - body */
  --text-md: 0.9rem;    /* 14.4px - emphasized */
  --text-lg: 1rem;      /* 16px - headings */
  --text-xl: 1.1rem;    /* 17.6px - large */

  /* ═══ Font Weights ═══ */
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;

  /* ═══ Border Radius ═══ */
  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 8px;
  --radius-xl: 10px;
  --radius-full: 9999px;

  /* ═══ Transitions ═══ */
  --transition-fast: 0.1s ease;
  --transition-base: 0.15s ease;
}
```

### 1b. Button System

**Before:** 20+ button classes duplicated across components
**After:** One base + modifiers

```css
/* src/styles/components/buttons.css */

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-4);
  padding: 0.4rem 0.9rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--border2);
  background: transparent;
  color: var(--text3);
  font-size: var(--text-base);
  font-weight: var(--font-semibold);
  font-family: inherit;
  cursor: pointer;
  transition: all var(--transition-base);
}

.btn:hover:not(:disabled) {
  color: var(--accent);
  border-color: var(--accent-mid);
  background: var(--accent-bg);
}

.btn:disabled { opacity: 0.25; cursor: default; }

/* Variants */
.btn--primary { background: var(--accent-bg); border-color: var(--accent-mid); color: var(--accent); }
.btn--ghost { border-color: transparent; }
.btn--accent { background: var(--accent); color: var(--on-accent); }

/* Sizes */
.btn--sm { padding: 0.3rem 0.6rem; font-size: var(--text-sm); }
.btn--lg { padding: 0.5rem 1.1rem; font-size: var(--text-md); }
.btn--block { width: 100%; }
.btn--icon { padding: 0.4rem; aspect-ratio: 1; }
```

**Usage:** `<button class="btn btn--primary btn--sm">Save</button>`

### 1c. Card System

```css
/* src/styles/components/cards.css */

.card {
  background: var(--raised);
  border: 1px solid var(--border2);
  border-radius: var(--radius-xl);
  padding: var(--space-7);
}

.card--surface { background: var(--surface); }
.card--flush { padding: 0; }

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-6);
}

.card-title { font-size: var(--text-base); font-weight: var(--font-bold); color: var(--accent); }
.card-subtitle { font-size: var(--text-sm); color: var(--text3); }
.card-body { display: flex; flex-direction: column; gap: var(--space-6); }
```

### 1d. Page Header System

```css
/* src/styles/components/page-header.css */

.page-header { display: flex; flex-direction: column; gap: var(--space-3); }
.page-header h2 { font-size: var(--text-lg); font-weight: var(--font-bold); color: var(--text); }
.page-header-subtitle { font-size: var(--text-base); color: var(--text3); }
.page-header-actions { display: flex; gap: var(--space-4); margin-left: auto; }
.page-header--row { flex-direction: row; align-items: center; justify-content: space-between; }

@media (max-width: 600px) {
  .page-header-subtitle { display: none; }
}
```

### 1e. Styles Directory Structure

```
src/styles/
├── index.css              ← imports all
├── base/
│   ├── reset.css          ← box-sizing, margins
│   ├── tokens.css         ← spacing, typography, radius
│   └── theme.css          ← colors (from style.css)
├── components/
│   ├── buttons.css
│   ├── cards.css
│   ├── page-header.css
│   ├── pills.css          ← note-pill, scale-tab
│   └── forms.css          ← inputs, toggles
└── utilities/
    ├── flex.css           ← .flex, .items-center
    └── text.css           ← .text-sm, .text-muted
```

---

## 2. Component API Specifications

### 2a. PageHeader

**File:** `src/components/ui/PageHeader.vue`
**Replaces:** 8 different header implementations

```vue
<script setup>
defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
})
</script>

<template>
  <div class="page-header" :class="{ 'page-header--row': $slots.actions }">
    <div>
      <h2>{{ title }}</h2>
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
<PageHeader title="Drum Computer" subtitle="loop continues while switching tabs" />

<!-- With actions (SettingsPage) -->
<PageHeader title="Settings">
  <template #actions>
    <button class="btn btn--icon" @click="close">✕</button>
  </template>
</PageHeader>
```

### 2b. NoteStripPicker

**File:** `src/components/ui/NoteStripPicker.vue`
**Replaces:** 5+ note strip implementations

```vue
<script setup>
import { CHROMATIC } from '@/constants/musicConstants.js'
const IS_SHARP = new Set([1, 3, 6, 8, 10])

const props = defineProps({
  modelValue: { type: Number, default: null },      // v-model for single selection
  from: { type: Number, default: null },            // interval "from" highlight
  to: { type: Number, default: null },              // interval "to" highlight
  activeNotes: { type: Set, default: () => new Set() }, // scale highlights
  playingNote: { type: Number, default: null },     // animation highlight
  small: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue', 'noteDown', 'noteUp'])

function onPointerDown(i) {
  emit('update:modelValue', i)
  emit('noteDown', i)
}
</script>

<template>
  <div class="note-strip" :class="{ 'note-strip--small': small }">
    <button
      v-for="(note, i) in CHROMATIC"
      :key="i"
      class="note-pill"
      :class="{
        'note-pill--sharp': IS_SHARP.has(i),
        'note-pill--selected': modelValue === i,
        'note-pill--from': from === i,
        'note-pill--to': to === i,
        'note-pill--active': activeNotes.has(i),
        'note-pill--playing': playingNote === i,
      }"
      @pointerdown.prevent="onPointerDown(i)"
      @pointerup="emit('noteUp', i)"
    >{{ note }}</button>
  </div>
</template>
```

**Usage:**
```vue
<!-- Single selection -->
<NoteStripPicker v-model="rootIdx" @noteDown="playNote(60 + $event)" />

<!-- Interval picker -->
<NoteStripPicker :from="fromIdx" :to="toIdx" @noteDown="pickNote" />

<!-- Scale display -->
<NoteStripPicker :activeNotes="scaleNotes" :playingNote="playing" />
```

### 2c. Card

**File:** `src/components/ui/Card.vue`

```vue
<script setup>
defineProps({
  title: { type: String, default: '' },
  subtitle: { type: String, default: '' },
  variant: { type: String, default: 'default' }, // 'default' | 'surface' | 'flush'
})
</script>

<template>
  <div class="card" :class="`card--${variant}`">
    <div v-if="title || $slots.header" class="card-header">
      <slot name="header">
        <div>
          <div v-if="title" class="card-title">{{ title }}</div>
          <div v-if="subtitle" class="card-subtitle">{{ subtitle }}</div>
        </div>
      </slot>
      <slot name="actions" />
    </div>
    <div class="card-body">
      <slot />
    </div>
  </div>
</template>
```

### 2d. PickerRow

**File:** `src/components/ui/PickerRow.vue`

```vue
<script setup>
defineProps({
  label: { type: String, required: true },
})
</script>

<template>
  <div class="picker-row">
    <span class="picker-row-label">{{ label }}</span>
    <div class="picker-row-control"><slot /></div>
  </div>
</template>
```

**Usage:**
```vue
<PickerRow label="Root">
  <NoteStripPicker v-model="root" small />
</PickerRow>

<PickerRow label="Scale">
  <select v-model="scaleId">...</select>
</PickerRow>
```

---

## Scope Clarification: Reusable Components

### What gets extracted and reused EVERYWHERE (not just LearnMode):

| Pattern | Used In | New Component |
|---------|---------|---------------|
| Page header + subtitle | ChordDetector, ChordProgressions, DrumComputer, JamMode, ProgressionBuilder, ScaleVisualizer, SettingsPage, AboutPage | `PageHeader.vue` |
| Button styles | ALL pages (20+ variants) | CSS classes in `buttons.css` |
| Card containers | StartPage, LearnMode, ChordProgressions | `Card.vue` + `cards.css` |
| Note pill strip | LearnMode (4x), ChordDetector | `NoteStripPicker.vue` |

### What stays page-specific:

| Component | Reason |
|-----------|--------|
| Drum grid (DrumComputer) | Unique to one page |
| Progression genre sections (ChordProgressions) | Complex, tightly coupled |
| Guitar diagram (GuitarChordDiagram) | Already extracted, reused by 4 pages |

### Existing reusable components (keep as-is):
- `RootNotePicker.vue` — used by ChordProgressions, JamMode, ScaleVisualizer
- `ScaleLegend.vue` — used by JamMode
- `PianoOctave.vue` — used by ChordDetector, JamMode, ScaleVisualizer, ChordCardBody
- `GuitarChordDiagram.vue` — used by ChordDetector, JamMode, ScaleVisualizer, ChordCardBody
- `ModeLayout.vue` — used by ChordDetector, JamMode, ScaleVisualizer
- `ChordCardBody.vue` — used by ChordProgressions, ProgressionBuilder

---

## Test Strategy

### Current test inventory (220 tests total):

| File | Tests | What it tests |
|------|-------|---------------|
| LearnMode.test.js | 36 | Step navigation, note picking, intervals, scales, beats |
| App.test.js | 16 | Tab navigation, page switching, settings |
| musicConstants.test.js | 41 | Data integrity of constants |
| audioEngine.test.js | 19 | Audio playback functions |
| midiManager.test.js | 16 | MIDI connection handling |
| chordDetect.test.js | 19 | Chord detection algorithms |
| musicUtils.test.js | 20 | Utility functions |
| SettingsPage.test.js | 15 | Settings toggles and persistence |
| ScaleVisualizer.test.js | 14 | Scale display and interaction |
| ChordCardBody.test.js | 12 | Chord card rendering |
| DrumComputer.test.js | 12 | Drum pattern editing |

### Test migration strategy:

#### 1. Tests that need PATH UPDATES only (no logic changes):
When files move directories, update import paths:

```js
// Before (in LearnMode.test.js)
import LearnMode from './LearnMode.vue'
import { playNote } from '../audioEngine.js'

// After
import LearnMode from '@/pages/LearnMode.vue'
import { playNote } from '@/audio/audioEngine.js'
```

**Affected:** All test files after directory restructure (Phase 5)

#### 2. Tests that need SELECTOR UPDATES:
When CSS classes change (e.g., `.jam-header` → `.page-header`), update selectors:

```js
// Before
expect(wrapper.find('.jam-header h2').text()).toBe('Jam Mode')

// After  
expect(wrapper.find('.page-header h2').text()).toBe('Jam Mode')
```

**Affected:** Any test checking for page-specific header classes

#### 3. Tests that need STRUCTURAL CHANGES:
When LearnMode is split into sub-components, tests may need to:
- Mount child components directly for unit tests
- Use `shallowMount` for LearnMode orchestration tests
- Add new test files for extracted components

```js
// NEW: src/components/learn/LearnRootNotes.test.js
import LearnRootNotes from './LearnRootNotes.vue'

describe('LearnRootNotes', () => {
  it('renders 12 note buttons', () => {
    const wrapper = mount(LearnRootNotes)
    expect(wrapper.findAll('.note-pill')).toHaveLength(12)
  })
})

// UPDATED: LearnMode.test.js (integration tests only)
describe('LearnMode integration', () => {
  it('step 1 content renders when step=0', () => {
    const wrapper = mount(LearnMode)
    expect(wrapper.findComponent(LearnRootNotes).exists()).toBe(true)
  })
})
```

#### 4. Tests for NEW components:
Each new reusable component gets its own test file:

```
src/components/ui/PageHeader.test.js
src/components/ui/NoteStripPicker.test.js
src/components/ui/Card.test.js
```

### Test execution checkpoints:

| After Phase | Expected Result |
|-------------|-----------------|
| Phase 1 (CSS extraction) | 220 tests pass (no component changes) |
| Phase 2 (LearnMode split) | 220+ tests pass (new component tests added) |
| Phase 3 (UI components) | 220+ tests pass (may need selector updates) |
| Phase 4 (Other pages) | 220+ tests pass |
| Phase 5 (Directory restructure) | 220+ tests pass (import path updates) |

### LearnMode.test.js migration plan:

Current tests check DOM selectors like `.note-pill`, `.step-btn`, `.rr-name`. These tests are **integration tests** that verify the full page works.

**Strategy:** Keep LearnMode.test.js as integration tests, but:
1. Move step-specific assertions to child component tests
2. LearnMode.test.js verifies orchestration (step switching, navigation)
3. Child tests verify component internals

```
BEFORE (1 file, 36 tests):
  LearnMode.test.js
    - step navigation (7 tests) ← KEEP HERE
    - Step 1: Root Notes (7 tests) ← MOVE to LearnRootNotes.test.js
    - Step 2: Intervals (9 tests) ← MOVE to LearnIntervals.test.js  
    - Step 3: Scales (4 tests) ← MOVE to LearnScales.test.js
    - Step 7: Beats (9 tests) ← MOVE to LearnBeats.test.js

AFTER (5 files, 40+ tests):
  LearnMode.test.js (7 tests) — orchestration only
  LearnRootNotes.test.js (7 tests)
  LearnIntervals.test.js (9 tests)
  LearnScales.test.js (4 tests)
  LearnBeats.test.js (9 tests)
  + new tests for extracted shared components
```

---

## Phase 1 — Style System Extraction

### 1a. Create `src/styles/` directory structure

```
src/styles/
├── index.css           ← imports all, replaces style.css
├── base/
│   ├── reset.css       ← box-sizing, margin reset
│   ├── typography.css  ← font sizes, weights, line heights
│   └── variables.css   ← all CSS custom properties (from style.css)
├── components/
│   ├── buttons.css     ← .btn, .btn-primary, .btn-ghost, .btn-icon
│   ├── cards.css       ← .card, .card-header, .card-body
│   ├── forms.css       ← inputs, selects, toggles
│   ├── pills.css       ← .note-pill, .scale-tab, .step-btn
│   └── grids.css       ← drum grid, beat pattern grid
├── layouts/
│   ├── page-header.css ← consolidated header styles
│   ├── picker-row.css  ← label + control row
│   └── step-nav.css    ← stepper navigation
└── utilities/
    ├── spacing.css     ← .gap-1, .p-1, .m-1 etc
    ├── flex.css        ← .flex, .flex-col, .items-center
    └── text.css        ← .text-sm, .text-muted, .font-bold
```

### 1b. Design tokens (extract from style.css)

Current `style.css` has good CSS variables. Keep them but organize:

```css
/* src/styles/base/variables.css */

/* Spacing scale */
:root {
  --space-1: 0.25rem;   /* 4px */
  --space-2: 0.5rem;    /* 8px */
  --space-3: 0.75rem;   /* 12px */
  --space-4: 1rem;      /* 16px */
  --space-5: 1.25rem;   /* 20px */
  --space-6: 1.5rem;    /* 24px */
}

/* Typography scale (found 11+ repeated sizes) */
:root {
  --text-xs: 0.72rem;   /* 11.5px - labels, badges */
  --text-sm: 0.78rem;   /* 12.5px - secondary text */
  --text-base: 0.85rem; /* 13.6px - body text */
  --text-md: 0.9rem;    /* 14.4px - emphasized */
  --text-lg: 1rem;      /* 16px - headings */
}

/* Border radius scale */
:root {
  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 8px;
  --radius-xl: 10px;
  --radius-full: 9999px;
}
```

### 1c. Button system (consolidate 20+ button variants)

Found patterns:
- `.nav-btn`, `.play-scale-btn`, `.rr-octave-btn`, `.bp-play-btn`, `.bp-edit-btn`
- `.beat-cta`, `.close-btn`, `.step-btn`
- All share: padding, border-radius, font-weight, cursor, transitions

```css
/* src/styles/components/buttons.css */

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: 0.4rem 0.9rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--border2);
  background: transparent;
  color: var(--text3);
  font-size: var(--text-base);
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: color 0.15s, border-color 0.15s, background 0.15s;
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

.btn-primary {
  background: var(--accent-bg);
  border-color: var(--accent-mid);
  color: var(--accent);
}

.btn-ghost {
  border-color: transparent;
}

.btn-sm { padding: 0.3rem 0.6rem; font-size: var(--text-sm); }
.btn-lg { padding: 0.5rem 1.1rem; font-size: var(--text-md); }
.btn-block { width: 100%; }
```

### 1d. Card system

```css
/* src/styles/components/cards.css */

.card {
  background: var(--raised);
  border: 1px solid var(--border2);
  border-radius: var(--radius-xl);
  padding: var(--space-4);
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-3);
}

.card-title {
  font-size: var(--text-base);
  font-weight: 700;
  color: var(--accent);
}

.card-body {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}
```

---

## Phase 2 — Component Extraction from LearnMode

LearnMode has 7 distinct "steps" that are essentially mini-pages. Each should be its own component.

### 2a. Extract step components

```
src/components/learn/
├── LearnStepNav.vue        ← step navigation bar
├── LearnRootNotes.vue      ← Step 1
├── LearnIntervals.vue      ← Step 2  
├── LearnScales.vue         ← Step 3
├── LearnProgressions.vue   ← Step 4
├── LearnChords.vue         ← Step 5
├── LearnImprovising.vue    ← Step 6
├── LearnBeats.vue          ← Step 7
└── LearnStepFooter.vue     ← prev/next navigation
```

**LearnMode.vue after extraction:** ~100 lines (orchestration only)

```vue
<script setup>
import { ref } from 'vue'
import LearnStepNav from '@/components/learn/LearnStepNav.vue'
import LearnRootNotes from '@/components/learn/LearnRootNotes.vue'
// ... other step imports
import LearnStepFooter from '@/components/learn/LearnStepFooter.vue'

const emit = defineEmits(['navigate'])
const step = ref(0)
const STEPS = ['Root Notes', 'Intervals', 'Scales', 'Progressions', 'Chords', 'Improvising', 'Beats']
</script>

<template>
  <div class="learn-mode">
    <LearnStepNav :steps="STEPS" v-model="step" />
    
    <LearnRootNotes v-if="step === 0" />
    <LearnIntervals v-else-if="step === 1" />
    <!-- ... -->
    
    <LearnStepFooter 
      :step="step" 
      :total="STEPS.length"
      @prev="step--"
      @next="step++"
    />
  </div>
</template>
```

### 2b. Shared learn components

```
src/components/learn/shared/
├── NoteStripPicker.vue     ← reused 4x in LearnMode (root, intervals, scales, progressions)
├── IntervalReference.vue   ← the reference grid
├── ScaleDisplay.vue        ← 12-note scale visualization
├── DiatonicChordRow.vue    ← roman numeral chord buttons
├── ProgressionCard.vue     ← I-V-vi-IV style cards
├── ChordTypeCard.vue       ← major/minor/dom7 explainers
├── BeatPatternCard.vue     ← drum pattern display
└── BeatTip.vue             ← numbered tip item
```

---

## Phase 3 — Reusable UI Components

### 3a. NoteStripPicker (used in LearnMode, ChordDetector, ScaleVisualizer, JamMode)

```vue
<!-- src/components/ui/NoteStripPicker.vue -->
<script setup>
import { CHROMATIC, IS_SHARP } from '@/constants/musicConstants'

defineProps({
  selected: { type: [Number, Set, Array], default: null },
  multi: { type: Boolean, default: false },
  small: { type: Boolean, default: false },
  highlightFrom: { type: Number, default: null },
  highlightTo: { type: Number, default: null },
})

defineEmits(['select'])
</script>

<template>
  <div class="note-strip" :class="{ small }">
    <button
      v-for="(note, i) in CHROMATIC"
      :key="i"
      class="note-pill"
      :class="{
        sharp: IS_SHARP.has(i),
        selected: /* computed based on multi */,
        from: highlightFrom === i,
        to: highlightTo === i,
      }"
      @pointerdown.prevent="$emit('select', i)"
    >{{ note }}</button>
  </div>
</template>
```

### 3b. PickerRow (label + control pattern)

```vue
<!-- src/components/ui/PickerRow.vue -->
<script setup>
defineProps({
  label: { type: String, required: true },
})
</script>

<template>
  <div class="picker-row">
    <span class="picker-label">{{ label }}</span>
    <slot />
  </div>
</template>
```

### 3c. PageHeader (corrected from original plan)

```vue
<!-- src/components/ui/PageHeader.vue -->
<script setup>
defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
})
</script>

<template>
  <div class="page-header">
    <div class="page-header-text">
      <h2>{{ title }}</h2>
      <p v-if="subtitle" class="subtitle">{{ subtitle }}</p>
    </div>
    <slot name="actions" />
  </div>
</template>
```

### 3d. New UI components to create

```
src/components/ui/
├── PageHeader.vue          ← title + subtitle + optional actions slot
├── NoteStripPicker.vue     ← chromatic note selection
├── PickerRow.vue           ← label + slot layout
├── ScaleTabs.vue           ← scale selection tabs
├── Card.vue                ← generic card wrapper
├── InfoCard.vue            ← card with title + body text
├── StepNav.vue             ← numbered step navigation
├── StepFooter.vue          ← prev/next with counter
├── Toggle.vue              ← on/off toggle switch
├── Select.vue              ← styled select dropdown
└── IconButton.vue          ← icon-only button
```

---

## Phase 4 — Extract Other Large Pages

### 4a. ChordProgressions.vue (925 lines → ~200)

Extract:
- `ProgressionGenreSection.vue` — collapsible genre section
- `ProgressionCard.vue` — individual progression display
- `ChordInProgression.vue` — single chord chip

### 4b. JamMode.vue (657 lines → ~150)

Extract:
- `JamScaleSelector.vue` — scale dropdown + description
- `JamNoteDisplay.vue` — the main play area (reuses NoteStripPicker, PianoOctave, etc.)

### 4c. ScaleVisualizer.vue (532 lines → ~100)

Already uses `ScaleLegend.vue`. Add:
- Reuse `NoteStripPicker.vue`
- Reuse `PickerRow.vue`

---

## Phase 5 — Directory Restructure

### Current structure (messy)

```
src/
├── components/          ← 17 files: pages mixed with reusable components
├── composables/         ← 1 file (good)
├── App.vue
├── App.test.js
├── main.js
├── style.css
│
│   ── Everything else dumped at root ──
├── audioEngine.js       ← audio
├── audioEngine.test.js
├── drumEngine.js        ← audio
├── midiManager.js       ← audio
├── midiManager.test.js
├── musicConstants.js    ← constants
├── musicConstants.test.js
├── musicUtils.js        ← utils
├── musicUtils.test.js
├── chordDetect.js       ← utils
├── chordDetect.test.js
├── displayMode.js       ← state
├── padSize.js           ← state
├── octave.js            ← state
├── colorMode.js         ← state
├── colorScheme.js       ← state
├── soundEnabled.js      ← state
└── soundStyle.js        ← state
```

**Problems:**
- 21 files dumped in `src/` root
- Pages and reusable components mixed in `components/`
- No logical grouping

### Target structure (clean)

```
src/
├── pages/               ← NEW: route-level views (10 files)
│   ├── StartPage.vue
│   ├── LearnMode.vue
│   ├── JamMode.vue
│   ├── ScaleVisualizer.vue
│   ├── ChordProgressions.vue
│   ├── ChordDetector.vue
│   ├── ProgressionBuilder.vue
│   ├── DrumComputer.vue
│   ├── SettingsPage.vue
│   └── AboutPage.vue
│
├── components/          ← CLEANED: only reusable components
│   ├── ui/              ← generic UI primitives
│   │   ├── PageHeader.vue
│   │   ├── NoteStripPicker.vue
│   │   └── Card.vue
│   ├── music/           ← domain-specific, reusable
│   │   ├── PianoOctave.vue
│   │   ├── GuitarChordDiagram.vue
│   │   ├── RootNotePicker.vue
│   │   ├── ScaleLegend.vue
│   │   ├── ChordCardBody.vue
│   │   └── MidiControl.vue
│   ├── learn/           ← LearnMode sub-components
│   │   ├── LearnStepNav.vue
│   │   ├── LearnRootNotes.vue
│   │   └── ... (7 step components)
│   └── layout/
│       └── ModeLayout.vue
│
├── composables/         ← stays (useXxx functions)
│   └── useNotePlayback.js
│
├── constants/           ← NEW: static data
│   ├── musicConstants.js
│   ├── scales.js
│   ├── intervals.js
│   └── progressions.js
│
├── utils/               ← NEW: pure functions
│   ├── musicUtils.js
│   └── chordDetect.js
│
├── state/               ← NEW: global reactive refs
│   ├── displayMode.js
│   ├── padSize.js
│   ├── octave.js
│   ├── colorMode.js
│   ├── colorScheme.js
│   ├── soundEnabled.js
│   └── soundStyle.js
│
├── audio/               ← NEW: audio/MIDI engines
│   ├── audioEngine.js
│   ├── drumEngine.js
│   └── midiManager.js
│
├── styles/              ← NEW: CSS system (from Phase 1)
│   ├── index.css
│   ├── base/
│   ├── components/
│   └── utilities/
│
├── App.vue
└── main.js
```

### File moves (complete list)

#### Create `src/pages/` — move 10 page components
```
src/components/StartPage.vue        → src/pages/StartPage.vue
src/components/LearnMode.vue        → src/pages/LearnMode.vue
src/components/JamMode.vue          → src/pages/JamMode.vue
src/components/ScaleVisualizer.vue  → src/pages/ScaleVisualizer.vue
src/components/ChordProgressions.vue→ src/pages/ChordProgressions.vue
src/components/ChordDetector.vue    → src/pages/ChordDetector.vue
src/components/ProgressionBuilder.vue→src/pages/ProgressionBuilder.vue
src/components/DrumComputer.vue     → src/pages/DrumComputer.vue
src/components/SettingsPage.vue     → src/pages/SettingsPage.vue
src/components/AboutPage.vue        → src/pages/AboutPage.vue
```

#### Create `src/constants/` — move 1, keep tests colocated
```
src/musicConstants.js      → src/constants/musicConstants.js
src/musicConstants.test.js → src/constants/musicConstants.test.js
```

#### Create `src/utils/` — move 2 files + tests
```
src/musicUtils.js      → src/utils/musicUtils.js
src/musicUtils.test.js → src/utils/musicUtils.test.js
src/chordDetect.js     → src/utils/chordDetect.js
src/chordDetect.test.js→ src/utils/chordDetect.test.js
```

#### Create `src/state/` — move 7 files (no tests)
```
src/displayMode.js  → src/state/displayMode.js
src/padSize.js      → src/state/padSize.js
src/octave.js       → src/state/octave.js
src/colorMode.js    → src/state/colorMode.js
src/colorScheme.js  → src/state/colorScheme.js
src/soundEnabled.js → src/state/soundEnabled.js
src/soundStyle.js   → src/state/soundStyle.js
```

#### Create `src/audio/` — move 3 files + tests
```
src/audioEngine.js      → src/audio/audioEngine.js
src/audioEngine.test.js → src/audio/audioEngine.test.js
src/drumEngine.js       → src/audio/drumEngine.js
src/midiManager.js      → src/audio/midiManager.js
src/midiManager.test.js → src/audio/midiManager.test.js
```

#### Reorganize `src/components/` — create subdirectories
```
src/components/
├── ui/                  ← NEW (created in Phase 3)
├── music/               ← NEW
│   ├── PianoOctave.vue      (move from components/)
│   ├── GuitarChordDiagram.vue
│   ├── RootNotePicker.vue
│   ├── ScaleLegend.vue
│   ├── ChordCardBody.vue
│   └── MidiControl.vue
├── learn/               ← NEW (created in Phase 4)
└── layout/              ← NEW
    └── ModeLayout.vue       (move from components/)
```

### Import path updates

After restructure, imports change from flat to organized:

```js
// App.vue — BEFORE
import StartPage from './components/StartPage.vue'
import { displayMode } from './displayMode.js'
import { drumPlay } from './drumEngine.js'

// App.vue — AFTER
import StartPage from './pages/StartPage.vue'
import { displayMode } from './state/displayMode.js'
import { drumPlay } from './audio/drumEngine.js'
```

```js
// JamMode.vue — BEFORE
import PianoOctave from './PianoOctave.vue'
import { playNote } from '../audioEngine.js'
import { displayMode } from '../displayMode.js'

// JamMode.vue — AFTER
import PianoOctave from '../components/music/PianoOctave.vue'
import { playNote } from '../audio/audioEngine.js'
import { displayMode } from '../state/displayMode.js'
```

### Path alias (recommended)

Add `@/` alias to avoid counting `../` levels:

**vite.config.js:**
```js
import { fileURLToPath } from 'url'
import { defineConfig } from 'vite'

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
```

**vitest.config.js** (or merge into vite.config.js):
```js
resolve: {
  alias: {
    '@': fileURLToPath(new URL('./src', import.meta.url))
  }
}
```

Then all imports become:
```js
import StartPage from '@/pages/StartPage.vue'
import { playNote } from '@/audio/audioEngine.js'
import { displayMode } from '@/state/displayMode.js'
import { NOTES } from '@/constants/musicConstants.js'
```

---

## Phase 6 — Constants Extraction

### 6a. From LearnMode.vue (move to constants/)

| Constant | Target file |
|----------|-------------|
| `INTERVALS` | `src/constants/intervals.js` |
| `SCALES` (LearnMode version) | `src/constants/scales.js` as `LEARN_SCALES` |
| `PROGS` | `src/constants/progressions.js` |
| `CHORD_TYPES` | `src/constants/chordTypes.js` |
| `BEAT_PATTERNS` | `src/constants/beatPatterns.js` |
| `BEAT_TIPS` | `src/constants/beatPatterns.js` |
| `IMPROV_EXAMPLES` | `src/constants/chordTypes.js` |

### 6b. From other pages

| Source | Constant | Target |
|--------|----------|--------|
| JamMode.vue | `SCALES` | `scales.js` as `JAM_SCALES` |
| ScaleVisualizer.vue | `SCALES` | `scales.js` as `VISUALIZER_SCALES` |
| ChordProgressions.vue | genre data | `progressions.js` |

---

## Test File Changes (Detailed)

### Files that need import path updates only:

After directory restructure, these files need updated imports but no logic changes:

| Test File | Import Changes |
|-----------|----------------|
| `App.test.js` | `./drumEngine.js` → `@/audio/drumEngine.js` |
| `audioEngine.test.js` | Move to `src/audio/`, update paths to `@/state/*` |
| `midiManager.test.js` | Move to `src/audio/` |
| `musicConstants.test.js` | Move to `src/constants/` |
| `musicUtils.test.js` | Move to `src/utils/`, update `@/constants/musicConstants` |
| `chordDetect.test.js` | Move to `src/utils/`, update `@/constants/musicConstants` |

### Files that need selector/structure changes:

| Test File | Changes Needed |
|-----------|----------------|
| `SettingsPage.test.js` | `.settings-header` → `.page-header` (if using PageHeader) |
| `ScaleVisualizer.test.js` | `.scale-viz-header` → `.page-header` |
| `DrumComputer.test.js` | `.drum-header` → `.page-header` |

### New test files to create:

```
src/components/ui/PageHeader.test.js
src/components/ui/NoteStripPicker.test.js
src/components/ui/Card.test.js
src/components/learn/LearnRootNotes.test.js
src/components/learn/LearnIntervals.test.js
src/components/learn/LearnScales.test.js
src/components/learn/LearnProgressions.test.js
src/components/learn/LearnChords.test.js
src/components/learn/LearnImprovising.test.js
src/components/learn/LearnBeats.test.js
src/components/learn/LearnStepNav.test.js
```

### Test colocaton rules:

1. **Component tests stay with components:**
   ```
   src/components/ui/PageHeader.vue
   src/components/ui/PageHeader.test.js
   ```

2. **Page tests stay with pages:**
   ```
   src/pages/LearnMode.vue
   src/pages/LearnMode.test.js
   ```

3. **Utility tests stay with utilities:**
   ```
   src/utils/musicUtils.js
   src/utils/musicUtils.test.js
   ```

---

## Execution Order (with test checkpoints)

### ✅ Phase 1 DONE — Style System Foundation (220 tests pass)
1. ✅ Create `src/styles/` structure
2. ✅ Extract CSS variables to `base/tokens.css` + `base/colors.css`
3. ✅ Create button system in `components/buttons.css`
4. ✅ Create card system in `components/cards.css`
5. ✅ **TEST:** `npm test` — 220 tests pass (no component changes)

### ✅ Phase 2 DONE — Directory Restructure + @/ alias (220 tests pass)
6. ✅ Add `@/` path alias to vite.config.js
7. ✅ Create `src/pages/`, move 10 page components + tests
8. ✅ Create `src/audio/`, move 3 audio files + tests
9. ✅ Create `src/state/`, move 7 state files
10. ✅ Create `src/utils/`, move 2 util files + tests
11. ✅ Create `src/constants/`, move musicConstants + test
12. ✅ Update ALL import paths (code + tests) to use `@/` alias
13. ✅ Update App.vue imports
14. ✅ **TEST:** `npm test` — 220 tests pass

### ✅ Phase 3 DONE — PageHeader Component (225 tests pass)
15. ✅ Create `src/components/ui/` directory
16. ✅ Create `PageHeader.vue` + `PageHeader.test.js` (5 new tests)
17. ✅ Update 8 pages to use PageHeader
18. ✅ Update affected page tests: change `.xxx-header` → `.page-header` selectors
19. ✅ Remove duplicate header CSS from pages
20. ✅ **TEST:** `npm test` — 225 tests pass

### ✅ Phase 4 DONE — NoteStripPicker Component (231 tests pass)
21. ✅ Create `NoteStripPicker.vue` + `NoteStripPicker.test.js` (6 new tests)
22. ✅ Refactor LearnMode (5 instances) + ChordDetector to use NoteStripPicker
23. ✅ Populate `pills.css` with note-strip styles
24. ✅ Fix A-based MIDI calculation in LearnMode (NOTE_TO_SEMI)
25. ✅ **TEST:** `npm test` — 231 tests pass

### ✅ Phase 5 DONE — Card + PickerRow + Component Reorganization (239 tests pass)
26. ✅ Create `Card.vue` + `Card.test.js` (6 new tests)
27. ✅ Create `PickerRow.vue` + `PickerRow.test.js` (2 new tests)
28. ✅ Move PianoOctave, GuitarChordDiagram, RootNotePicker, ScaleLegend, ChordCardBody, MidiControl → `src/components/music/`
29. ✅ Move ModeLayout → `src/components/layout/`
30. ✅ Update all imports to new subdirectory paths
31. ✅ **TEST:** `npm test` — 239 tests pass

### ✅ Phase 6 DONE — LearnMode Steps 1-4 Extraction (244 tests pass)
32. ✅ Create `LearnStepNav.vue` + `LearnStepNav.test.js` (5 new tests)
33. ✅ Create `LearnRootNotes.vue` + `LearnRootNotes.test.js` (7 tests)
34. ✅ Create `LearnIntervals.vue` + `LearnIntervals.test.js` (9 tests)
35. ✅ Create `LearnScales.vue` + `LearnScales.test.js` (4 tests)
36. ✅ Create `LearnProgressions.vue` (self-contained)
37. ✅ LearnMode.vue delegates steps 1-4 via v-if; migrated tests to child files
38. ✅ **TEST:** `npm test` — 244 tests pass

### ✅ Phase 7 DONE — LearnMode Steps 5-7 + Finalization (268 tests pass)
39. ✅ Create `LearnChords.vue` + `LearnChords.test.js` (4 tests)
40. ✅ Create `LearnImprovising.vue` + `LearnImprovising.test.js` (6 tests)
41. ✅ Create `LearnBeats.vue` + `LearnBeats.test.js` (8 tests — migrated from LearnMode.test.js)
42. ✅ Create `LearnStepFooter.vue` + `LearnStepFooter.test.js` (7 tests)
43. ✅ Finalize `LearnMode.vue` as 64-line orchestrator (was 2,077 lines)
44. ✅ **TEST:** `npm test` — 268 tests pass

### ✅ Phase 8 DONE — Constants Extraction (268 tests pass)
45. ✅ Create `src/constants/scales.js` — JAM_SCALES, VISUALIZER_SCALES, LEARN_SCALES
46. ✅ Create `src/constants/intervals.js` — INTERVALS
47. ✅ Create `src/constants/progressions.js` — ALL_PROGRESSIONS, GENRES, LEARN_PROGS
48. ✅ Create `src/constants/chordTypes.js` — CHORD_TYPES, IMPROV_CHORD_TYPES, IMPROV_EXAMPLES
49. ✅ Create `src/constants/beatPatterns.js` — BEAT_PATTERNS, BEAT_TIPS
50. ✅ Update 9 components to import from constants/ instead of inline arrays
51. ✅ **TEST:** `npm test` — 268 tests pass

---

## Metrics

### Before
| Metric | Value |
|--------|-------|
| Total component lines | 6,818 |
| CSS lines in components | 3,677 (54%) |
| Largest component | LearnMode: 2,077 lines |
| Reusable components | ~5 |
| Test files | 11 |
| Total tests | 220 |
| Directories in src/ | 2 (components, composables) |
| Files in src/ root | 21 |

### Target After
| Metric | Value |
|--------|-------|
| Total component lines | ~3,500 |
| CSS in components | ~500 (14%) |
| Largest component | <300 lines |
| Reusable components | ~25 |
| Test files | ~20 (new component tests) |
| Total tests | ~280 (better coverage) |
| Directories in src/ | 9 (pages, components, audio, state, utils, constants, composables, styles) |
| Files in src/ root | 2 (App.vue, main.js) |

---

## File-by-File CSS Extraction Priority

| Component | CSS Lines | Priority | Notes |
|-----------|-----------|----------|-------|
| LearnMode.vue | 1,266 | P0 | Biggest win, most duplication |
| ChordProgressions.vue | 371 | P1 | Many card patterns |
| JamMode.vue | 357 | P1 | Shares patterns with ScaleViz |
| ScaleVisualizer.vue | 309 | P1 | Similar to JamMode |
| ChordDetector.vue | 283 | P2 | |
| SettingsPage.vue | 249 | P2 | Toggle/form patterns |
| StartPage.vue | 215 | P2 | Card grid |
| DrumComputer.vue | 167 | P3 | Grid-specific |
| PianoOctave.vue | 155 | P3 | Keep colocated? |
| ProgressionBuilder.vue | 141 | P3 | |
| GuitarChordDiagram.vue | 113 | P3 | SVG-specific, keep |
| Others | <100 each | P4 | |

---

## Verification Checklist

After each phase:
- [ ] `npm test` — all tests pass
- [ ] `npm run build` — no import errors
- [ ] Manual check: each page renders correctly
- [ ] CSS: no visual regressions

### Specific test expectations by phase:

| Phase | Test Count | Notes |
|-------|------------|-------|
| After CSS extraction | 220 | No changes to tests |
| After PageHeader | 220 | Selector updates only |
| After NoteStripPicker | 220+ | May add component tests |
| After LearnMode split | ~250 | New tests for 7 step components |
| After directory restructure | ~250 | Import path updates |
| Final | ~280 | Full coverage of new components |

### Risk areas for tests:

1. **LearnMode.test.js** — Most complex, touches audio/drum mocks
2. **App.test.js** — Tests page switching, may need shallowMount updates
3. **SettingsPage.test.js** — Tests DOM structure extensively

### Mock updates needed:

When files move to new directories, mock paths need updating:

```js
// Before
vi.mock('../audioEngine.js', () => ({ ... }))

// After  
vi.mock('@/audio/audioEngine.js', () => ({ ... }))
```

---

## 6. Phased PR Strategy

Instead of week-sized chunks, break into small, reviewable PRs that can be merged independently.

### PR Sequence

```
PR #1: chore: add @/ path alias
  - vite.config.js + vitest.config.js only
  - 0 test changes
  - Safe to merge immediately

PR #2: refactor: create src/styles/ foundation
  - Add styles/index.css, base/tokens.css, base/theme.css
  - Update main.js to import styles/index.css
  - Move color vars from style.css to theme.css
  - 0 test changes, 0 visual changes

PR #3: refactor: add button CSS system
  - Add styles/components/buttons.css
  - 0 component changes yet (just CSS)

PR #4: refactor: directory restructure (audio, state, utils, constants)
  - Move 13 files to new directories
  - Update all imports to use @/
  - Update all test mocks
  - Big PR but mechanical - no logic changes

PR #5: refactor: move pages to src/pages/
  - Move 10 page components
  - Update App.vue imports
  - Update test imports

PR #6: feat: add PageHeader component
  - New component + test
  - Update 1 page as proof (e.g., AboutPage)
  - Small, reviewable

PR #7-14: refactor: adopt PageHeader in [PageName]
  - One PR per page (7 more pages)
  - Each is small and independent

PR #15: feat: add NoteStripPicker component
  - New component + test

PR #16: refactor: use NoteStripPicker in LearnMode
  - Replace 4 inline implementations

PR #17: refactor: use NoteStripPicker in ChordDetector

PR #18-24: refactor: extract LearnMode steps
  - One PR per step component
  - LearnRootNotes, LearnIntervals, etc.

PR #25: refactor: LearnMode orchestration cleanup
  - Final LearnMode.vue is just orchestration
```

### PR Size Guidelines

| Size | Lines Changed | Review Time |
|------|---------------|-------------|
| XS | <50 | 5 min |
| S | 50-150 | 15 min |
| M | 150-400 | 30 min |
| L | 400-800 | 1 hour |
| XL | >800 | Split it! |

**Target:** Most PRs should be S or M.

### Dependency Graph

```
PR #1 (alias) ─────────────────────────────────────┐
                                                   │
PR #2 (styles foundation) ─┬─ PR #3 (buttons.css)  │
                           │                       │
                           └─ PR #6 (PageHeader) ──┼─ PR #7-14 (adopt PageHeader)
                                                   │
PR #4 (dir restructure) ───┬─ PR #5 (pages/) ──────┤
                           │                       │
                           └─ PR #15 (NoteStrip) ──┼─ PR #16-17 (adopt NoteStrip)
                                                   │
                                                   └─ PR #18-24 (LearnMode steps)
                                                           │
                                                           └─ PR #25 (cleanup)
```

---

## 7. ChordProgressions Extraction Plan

**Current:** 925 lines (371 CSS)
**Target:** ~300 lines

### Data to Extract → `src/constants/progressions.js`

```js
// src/constants/progressions.js

export const GENRES = [
  { id: 'all', label: 'All' },
  { id: 'pop', label: 'Pop' },
  { id: 'rock', label: 'Rock' },
  // ... 10 total
]

export const ALL_PROGRESSIONS = [
  { 
    id: 'pop-1', 
    genre: 'pop', 
    key: 'major', 
    label: 'Pop anthem',
    numeral: 'I – V – vi – IV',
    examples: 'Let It Be · No Woman No Cry',
    chords: [
      { degree: 0, type: 'maj', numeral: 'I' },
      // ...
    ]
  },
  // ... 40+ progressions
]
```

### Components to Extract

```
src/components/progressions/
├── GenreTabs.vue           ← genre filter tabs
├── ProgressionCard.vue     ← single progression display
└── ProgressionChord.vue    ← chord chip within progression
```

**GenreTabs.vue** (~50 lines)
```vue
<script setup>
defineProps({
  genres: Array,
  modelValue: String,
})
defineEmits(['update:modelValue'])
</script>

<template>
  <div class="genre-tabs">
    <button
      v-for="g in genres"
      :key="g.id"
      class="btn btn--sm"
      :class="{ 'btn--primary': modelValue === g.id }"
      @click="$emit('update:modelValue', g.id)"
    >{{ g.label }}</button>
  </div>
</template>
```

**ProgressionCard.vue** (~80 lines)
```vue
<script setup>
import ProgressionChord from './ProgressionChord.vue'

defineProps({
  progression: Object,
  selectedRoot: String,
  activeChordIndex: Number,
})

defineEmits(['play', 'chordClick'])
</script>

<template>
  <div class="card">
    <div class="card-header">
      <div>
        <div class="card-title">{{ progression.label }}</div>
        <div class="card-subtitle">{{ progression.numeral }}</div>
      </div>
      <button class="btn btn--sm" @click="$emit('play')">Play</button>
    </div>
    <div class="progression-chords">
      <ProgressionChord
        v-for="(chord, i) in progression.chords"
        :key="i"
        :chord="chord"
        :root="selectedRoot"
        :active="activeChordIndex === i"
        @click="$emit('chordClick', i)"
      />
    </div>
    <div class="progression-examples">{{ progression.examples }}</div>
  </div>
</template>
```

### ChordProgressions.vue After Refactor (~300 lines)

```vue
<script setup>
import { ref, computed } from 'vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import GenreTabs from '@/components/progressions/GenreTabs.vue'
import ProgressionCard from '@/components/progressions/ProgressionCard.vue'
import RootNotePicker from '@/components/music/RootNotePicker.vue'
import { GENRES, ALL_PROGRESSIONS } from '@/constants/progressions.js'
import { playChord } from '@/audio/audioEngine.js'

const selectedGenre = ref('all')
const selectedRoot = ref('C')
const activeProgression = ref(null)
const activeChordIndex = ref(null)

const filteredProgressions = computed(() => 
  selectedGenre.value === 'all' 
    ? ALL_PROGRESSIONS 
    : ALL_PROGRESSIONS.filter(p => p.genre === selectedGenre.value)
)

function playProgression(prog) { /* ... */ }
function playChordAtIndex(prog, index) { /* ... */ }
</script>

<template>
  <div class="chord-progressions">
    <PageHeader 
      title="Chord Progressions" 
      subtitle="explore chord sequences by genre - transposed to any key" 
    />
    
    <div class="controls">
      <RootNotePicker v-model="selectedRoot" />
      <GenreTabs :genres="GENRES" v-model="selectedGenre" />
    </div>
    
    <div class="progression-list">
      <ProgressionCard
        v-for="prog in filteredProgressions"
        :key="prog.id"
        :progression="prog"
        :selected-root="selectedRoot"
        :active-chord-index="activeProgression === prog.id ? activeChordIndex : null"
        @play="playProgression(prog)"
        @chord-click="playChordAtIndex(prog, $event)"
      />
    </div>
  </div>
</template>
```

---

## 8. JamMode Extraction Plan

**Current:** 657 lines (357 CSS)
**Target:** ~200 lines

### Data to Extract → `src/constants/scales.js`

```js
// src/constants/scales.js

export const JAM_SCALES = [
  {
    id: 'mi.p',
    label: 'mi.p - Minor Pentatonic',
    intervals: [0, 3, 5, 7, 10],
    description: 'The most forgiving scale for improv...',
  },
  // ... 7 scales
]

export const VISUALIZER_SCALES = [ /* different set */ ]
export const LEARN_SCALES = [ /* different schema */ ]
```

### Components to Extract

JamMode already uses several reusable components (PianoOctave, GuitarChordDiagram, RootNotePicker, ScaleLegend, ModeLayout). 

Additional extractions:

```
src/components/jam/
├── ScaleSelector.vue       ← dropdown + description
└── ScaleDescription.vue    ← expandable info panel
```

**ScaleSelector.vue** (~60 lines)
```vue
<script setup>
defineProps({
  scales: Array,
  modelValue: String,
})
defineEmits(['update:modelValue'])

const selectedScale = computed(() => 
  props.scales.find(s => s.id === props.modelValue)
)
</script>

<template>
  <div class="scale-selector">
    <select 
      :value="modelValue" 
      @change="$emit('update:modelValue', $event.target.value)"
    >
      <option v-for="s in scales" :key="s.id" :value="s.id">
        {{ s.label }}
      </option>
    </select>
    <p class="scale-description">{{ selectedScale?.description }}</p>
  </div>
</template>
```

### JamMode.vue After Refactor (~200 lines)

```vue
<script setup>
import { ref, computed } from 'vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import PickerRow from '@/components/ui/PickerRow.vue'
import RootNotePicker from '@/components/music/RootNotePicker.vue'
import ScaleSelector from '@/components/jam/ScaleSelector.vue'
import ModeLayout from '@/components/layout/ModeLayout.vue'
import ScaleLegend from '@/components/music/ScaleLegend.vue'
import { JAM_SCALES } from '@/constants/scales.js'
import { displayMode } from '@/state/displayMode.js'
import { useNotePlayback } from '@/composables/useNotePlayback.js'

const selectedRoot = ref('A')
const selectedScaleId = ref('mi.p')

const selectedScale = computed(() => JAM_SCALES.find(s => s.id === selectedScaleId.value))
const activeIndices = computed(() => /* ... */)

const subtitle = computed(() => 
  `pick a key and scale - highlighted ${displayMode.value} are safe to play`
)
</script>

<template>
  <div class="jam-mode">
    <PageHeader title="Jam Mode" :subtitle="subtitle" />
    
    <div class="jam-controls">
      <PickerRow label="Key">
        <RootNotePicker v-model="selectedRoot" />
      </PickerRow>
      <PickerRow label="Scale">
        <ScaleSelector :scales="JAM_SCALES" v-model="selectedScaleId" />
      </PickerRow>
    </div>
    
    <ModeLayout 
      :active-indices="activeIndices" 
      :root-index="rootIndex"
      :anchor-indices="anchorIndices"
    />
    
    <ScaleLegend />
  </div>
</template>
```

---

### ✅ Phase 9 DONE — ChordProgressions Sub-components (284 tests pass)
52. ✅ Create `GenreTabs.vue` + `GenreTabs.test.js` (3 tests)
53. ✅ Create `ProgressionSection.vue` + `ProgressionSection.test.js` (6 tests)
54. ✅ Create `ProgressionCard.vue` + `ProgressionCard.test.js` (7 tests)
55. ✅ ChordProgressions.vue refactored to use new sub-components
56. ✅ **TEST:** `npm test` — 284 tests pass

### ✅ Phase 10 DONE — JamMode Sub-components (300 tests pass)
57. ✅ Create `ScaleSelector.vue` + `ScaleSelector.test.js` (9 tests)
58. ✅ Create `OctaveControl.vue` + `OctaveControl.test.js` (7 tests)
59. ✅ JamMode.vue refactored to use ScaleSelector + OctaveControl
60. ✅ **TEST:** `npm test` — 300 tests pass

---

## Summary: Token Reduction Benefits

After implementing this architecture:

| Task | Before | After |
|------|--------|-------|
| "Add a new page" | Read App.vue, figure out patterns | Follow template in `pages/`, use PageHeader |
| "Change button style" | Search 20+ components | Edit `buttons.css` |
| "Find where state lives" | Search entire src/ | Look in `state/` |
| "Understand LearnMode" | Read 2,077 lines | Read 100-line orchestrator + specific step |
| "Add a note picker" | Copy/paste from LearnMode | Import NoteStripPicker |

**Estimated token savings per task: 40-70%**

---

## ✅ REFACTOR COMPLETE

All 10 phases completed on 2026-04-04.

| Metric | Before | After |
|--------|--------|-------|
| Total tests | 220 | 300 |
| Test files | 11 | 28 |
| LearnMode.vue | 2,077 lines | 64 lines |
| src/ root files | 21 | 2 (App.vue, main.js) |
| Reusable components | ~5 | ~25 |
| CSS in components | 54% | ~15% |
| Organized directories | 2 | 9 |
