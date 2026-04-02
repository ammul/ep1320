<script setup>
import { pattern, bpm, isPlaying, currentStep, play, pause, clearPattern, toggleCell, INSTRUMENTS } from '../audio/drumEngine.js'
import PageHeader from '../components/PageHeader.vue'
</script>

<template>
  <div class="drum-computer">
    <PageHeader title="Drum Computer" subtitle="loop continues while switching tabs" />

    <div class="transport">
      <button
        class="transport-btn"
        :class="{ active: isPlaying }"
        @click="isPlaying ? pause() : play()"
      >{{ isPlaying ? 'Pause' : 'Play' }}</button>
      <button class="transport-btn" @click="clearPattern">Clear</button>
      <div class="bpm-control">
        <label>BPM</label>
        <input type="number" v-model.number="bpm" min="60" max="200" class="bpm-input" />
      </div>
    </div>

    <div class="grid-wrap">
      <div class="step-header">
        <div class="inst-spacer"></div>
        <div
          v-for="s in 16"
          :key="s"
          class="step-num"
          :class="{
            active:     isPlaying && currentStep === s - 1,
            'beat-start': (s - 1) % 4 === 0,
          }"
        >{{ s }}</div>
      </div>

      <div v-for="(inst, i) in INSTRUMENTS" :key="inst" class="inst-row">
        <div class="inst-name">{{ inst }}</div>
        <button
          v-for="s in 16"
          :key="s"
          class="step-btn"
          :class="{
            on:           pattern[i][s - 1],
            playing:      isPlaying && currentStep === s - 1,
            'beat-start': (s - 1) % 4 === 0,
          }"
          @click="toggleCell(i, s - 1)"
        ></button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.drum-computer {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 2rem;
}

.transport {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 1.5rem 0;
  flex-wrap: wrap;
}

.transport-btn {
  padding: 0.4rem 1.1rem;
  border-radius: 6px;
  border: 1px solid var(--border2);
  background: var(--input);
  color: var(--text2);
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.12s, border-color 0.12s, color 0.12s;
}

.transport-btn:hover  { border-color: var(--accent); color: var(--text); }
.transport-btn.active { background: var(--accent); border-color: var(--accent); color: var(--on-accent); }

.bpm-control {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.bpm-control label {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--accent);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.bpm-input {
  width: 4.5rem;
  padding: 0.35rem 0.6rem;
  border-radius: 6px;
  border: 1px solid var(--border2);
  background: var(--input);
  color: var(--text);
  font-size: 0.9rem;
  text-align: center;
}

.bpm-input:focus { outline: none; border-color: var(--accent); }

.grid-wrap {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  padding-bottom: 0.5rem;
}

.step-header,
.inst-row {
  display: grid;
  grid-template-columns: 7rem repeat(16, minmax(1.6rem, 1fr));
  gap: 0.2rem;
  margin-bottom: 0.2rem;
  min-width: 560px;
}

.step-num {
  text-align: center;
  font-size: 0.65rem;
  color: var(--text5);
  padding: 0.15rem 0;
  border-radius: 3px;
  transition: color 0.1s, background 0.1s;
}

.step-num.beat-start {
  color: var(--text4);
  border-left: 1px solid var(--border2);
}

.step-num.active {
  color: var(--accent);
  background: var(--accent-bg);
}

.inst-name {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text3);
  display: flex;
  align-items: center;
  padding-right: 0.4rem;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.step-btn {
  height: 2rem;
  border-radius: 4px;
  border: 1px solid var(--border2);
  background: var(--raised);
  cursor: pointer;
  transition: background 0.1s, border-color 0.1s;
  padding: 0;
}

.step-btn.beat-start {
  border-left: 2px solid var(--border2);
}

.step-btn:hover { background: var(--border); }

.step-btn.on {
  background: var(--accent-bg);
  border-color: var(--accent-mid);
}

.step-btn.on.beat-start {
  border-left-color: var(--accent-mid);
}

.step-btn.on.playing {
  background: var(--accent);
  border-color: var(--accent);
}

.step-btn.playing:not(.on) {
  background: var(--border3);
}

@media (max-width: 600px) {
  .drum-computer { padding: 1.25rem 0.75rem; }
  .step-header, .inst-row { grid-template-columns: 4.5rem repeat(16, minmax(1.4rem, 1fr)); min-width: 460px; }
  .inst-name { font-size: 0.68rem; padding-right: 0.25rem; }
  .step-btn { height: 1.75rem; }
  .step-num { font-size: 0.6rem; }
}

@media (orientation: landscape) and (max-height: 500px) {
  .drum-computer { padding: 0.75rem 1rem; }
  .transport { margin: 0.5rem 0; }
  .step-btn { height: 1.6rem; }
}
</style>
