<script setup>
import { ref } from 'vue'
import ClavesMode from './components/ClavesMode.vue'
import ScaleVisualizer from './components/ScaleVisualizer.vue'
import ChordProgressions from './components/ChordProgressions.vue'
import ChordDetector from './components/ChordDetector.vue'
import ProgressionBuilder from './components/ProgressionBuilder.vue'

const tabs = [
  { id: 'claves',         label: 'Claves Mode',        component: ClavesMode },
  { id: 'scales',         label: 'Scale Visualizer',   component: ScaleVisualizer },
  { id: 'chords',         label: 'Chord Progressions', component: ChordProgressions },
  { id: 'chord-detector', label: 'Chord Detector',     component: ChordDetector },
  { id: 'prog-builder',   label: 'Progression Builder', component: ProgressionBuilder },
]

const activeTab = ref('claves')
const activeComponent = () => tabs.find(t => t.id === activeTab.value)?.component
</script>

<template>
  <div id="app">
    <header>
      <h1>EP–1320 <span class="dim">medieval</span></h1>
      <p class="tagline">tools & reference</p>
    </header>

    <nav>
      <button
        v-for="tab in tabs"
        :key="tab.id"
        :class="{ active: activeTab === tab.id }"
        @click="activeTab = tab.id"
      >{{ tab.label }}</button>
    </nav>

    <main>
      <component :is="activeComponent()" />
    </main>
  </div>
</template>

<style scoped>
header {
  margin-bottom: 1.5rem;
}

h1 {
  font-size: 1.8rem;
  font-weight: 700;
  color: #c8a96e;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

h1 .dim {
  color: #6a5f50;
  font-weight: 400;
}

.tagline {
  font-size: 0.8rem;
  color: #5a5040;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  margin-top: 0.2rem;
}

nav {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid #3a3228;
  padding-bottom: 0.75rem;
}

nav button {
  padding: 0.4rem 1rem;
  border-radius: 6px;
  border: 1px solid transparent;
  background: transparent;
  color: #7a6f60;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  letter-spacing: 0.04em;
  transition: color 0.15s, border-color 0.15s, background 0.15s;
}

@media (max-width: 600px) {
  nav button {
    flex: 1;
    text-align: center;
    padding: 0.5rem 0.5rem;
  }
}

nav button:hover {
  color: #e8dcc8;
}

nav button.active {
  background: #2e2820;
  border-color: #4a4030;
  color: #c8a96e;
}
</style>
