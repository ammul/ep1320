<script setup>
import { ref } from 'vue'
import { playNote } from '@/audio/audioEngine.js'
import { NOTE_TO_SEMI, SEMI_TO_NAME as CHROMATIC } from '@/constants/musicConstants.js'
import NoteStripPicker from '@/components/ui/NoteStripPicker.vue'

const rootNoteIdx = ref(null)

function pickRootNote(i) {
  rootNoteIdx.value = i
  playNote(60 + NOTE_TO_SEMI[i])
}

function playRootOctave() {
  if (rootNoteIdx.value === null) return
  playNote(60 + NOTE_TO_SEMI[rootNoteIdx.value])
  setTimeout(() => playNote(72 + NOTE_TO_SEMI[rootNoteIdx.value], 0.8), 550)
}
</script>

<template>
  <div class="step-content">
    <p class="step-intro">Every piece of music orbits a home note — the <strong>root</strong>. When a melody lands on it, it sounds resolved. When it moves away, it creates tension. Everything else — scales, chords, keys — is named and measured relative to this anchor.</p>

    <div class="root-note-picker">
      <NoteStripPicker
        :from-index="rootNoteIdx"
        @note-down="pickRootNote"
      />
    </div>

    <div class="root-result">
      <template v-if="rootNoteIdx !== null">
        <div class="rr-name">{{ CHROMATIC[rootNoteIdx] }}</div>
        <div class="rr-label">your root note</div>
        <button class="rr-octave-btn" @click="playRootOctave">Hear it one octave up</button>
      </template>
      <template v-else>
        <div class="rr-hint">Tap any note to set your root</div>
      </template>
    </div>

    <div class="root-facts">
      <div class="rf-item">
        <span class="rf-heading">12 notes</span>
        <span class="rf-body">Western music uses 12 notes before the pattern repeats. The 7 natural notes (A B C D E F G) plus 5 sharps in between — the black keys on a piano.</span>
      </div>
      <div class="rf-item">
        <span class="rf-heading">Octaves</span>
        <span class="rf-body">Every note repeats at double the frequency — same name, higher pitch. C and the C above it sound related because the higher one vibrates exactly twice as fast.</span>
      </div>
      <div class="rf-item">
        <span class="rf-heading">Keys</span>
        <span class="rf-body">When someone says a song is in <em>C major</em>, C is the root. The root gives the key its name and is the note the music wants to return to.</span>
      </div>
    </div>

    <div class="step-bridge">
      Once you have a root, you can describe the <strong>distance</strong> to any other note. That distance is called an <strong>interval</strong>.
    </div>
  </div>
</template>
