<script setup>
import { ref, computed } from 'vue'
import { NOTES, LABELS, SHARPS } from '../musicConstants.js'

const octave = ref(4)

const pads = computed(() => {
  const aMidi = 12 * (octave.value + 1) + 9 // A in selected octave (A4 = 69)
  return NOTES.map((note, i) => ({
    number: i + 1,
    label: LABELS[i],
    note,
    isSharp: SHARPS.has(note),
    midi: aMidi + i,
  }))
})

// Numpad layout (top→bottom): 7 8 9 / 4 5 6 / 1 2 3 / . 0 i
// Notes ascend bottom→top: A on ., G# on 9
const rows = computed(() => [
  pads.value.slice(9, 12),
  pads.value.slice(6, 9),
  pads.value.slice(3, 6),
  pads.value.slice(0, 3),
])
</script>

<template>
  <div class="claves">
    <div class="claves-header">
      <h2>Claves Mode</h2>
      <p class="subtitle">12-pad chromatic layout · one sound pitched across all pads</p>
    </div>

    <div class="octave-control">
      <label>Octave</label>
      <button @click="octave = Math.max(0, octave - 1)">−</button>
      <span class="octave-value">{{ octave }}</span>
      <button @click="octave = Math.min(9, octave + 1)">+</button>
    </div>

    <div class="grid">
      <div class="row" v-for="(row, ri) in rows" :key="ri">
        <div
          v-for="pad in row"
          :key="pad.number"
          class="pad"
          :class="{ sharp: pad.isSharp }"
        >
          <span class="pad-label">{{ pad.label }}</span>
          <span class="pad-note">{{ pad.note }}</span>
          <span class="pad-midi">MIDI {{ pad.midi }}</span>
        </div>
      </div>
    </div>

    <div class="legend">
      <span class="legend-item natural">Natural</span>
      <span class="legend-item sharp">Sharp / Black key</span>
    </div>
  </div>
</template>

<style scoped>
.claves {
  background: #242019;
  border: 1px solid #3a3228;
  border-radius: 12px;
  padding: 2rem;
}

.claves-header h2 {
  font-size: 1.4rem;
  color: #c8a96e;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.subtitle {
  margin-top: 0.3rem;
  font-size: 0.85rem;
  color: #7a6f60;
}

.octave-control {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 1.5rem 0;
  font-size: 0.9rem;
  color: #a09080;
}

.octave-control label {
  font-weight: 600;
  color: #c8a96e;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-size: 0.8rem;
}

.octave-control button {
  width: 2rem;
  height: 2rem;
  border: 1px solid #4a4030;
  border-radius: 6px;
  background: #1a1714;
  color: #c8a96e;
  font-size: 1.1rem;
  cursor: pointer;
  line-height: 1;
  transition: background 0.15s, border-color 0.15s;
}

.octave-control button:hover {
  background: #2a2218;
  border-color: #c8a96e;
}

.octave-value {
  min-width: 1.5rem;
  text-align: center;
  font-size: 1.1rem;
  font-weight: 700;
  color: #e8dcc8;
}

.grid {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  max-width: 360px;
}

.row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.6rem;
}

.pad {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.2rem;
  padding: 0.75rem 0.5rem;
  border-radius: 8px;
  border: 1px solid #4a4030;
  background: #2e2820;
  cursor: default;
  transition: background 0.15s;
  aspect-ratio: 1;
}

.pad:hover {
  background: #3a3228;
}

.pad.sharp {
  background: #1e1c18;
  border-color: #3a3228;
}

.pad.sharp:hover {
  background: #2a2820;
}

.pad-label {
  font-size: 0.7rem;
  color: #5a5040;
  font-weight: 600;
  letter-spacing: 0.1em;
}

.pad-note {
  font-size: 1.5rem;
  font-weight: 700;
  color: #c8a96e;
  line-height: 1;
}

.pad.sharp .pad-note {
  color: #a08858;
}

.pad-midi {
  font-size: 0.7rem;
  color: #6a6050;
}

.legend {
  display: flex;
  gap: 1.5rem;
  margin-top: 1.5rem;
  font-size: 0.8rem;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  color: #7a6f60;
}

.legend-item::before {
  content: '';
  display: inline-block;
  width: 14px;
  height: 14px;
  border-radius: 3px;
  border: 1px solid #4a4030;
}

.legend-item.natural::before {
  background: #2e2820;
}

.legend-item.sharp::before {
  background: #1e1c18;
}

@media (max-width: 600px) {
  .claves {
    padding: 1.25rem 1rem;
  }

  .pad-note {
    font-size: 1.2rem;
  }

  .pad-midi {
    font-size: 0.62rem;
  }
}

@media (orientation: landscape) and (max-height: 500px) {
  .claves {
    padding: 0.75rem 1rem;
  }

  .claves-header h2 {
    font-size: 1.1rem;
  }

  .subtitle {
    display: none;
  }

  .octave-control {
    margin: 0.5rem 0;
  }

  .legend {
    display: none;
  }
}
</style>
