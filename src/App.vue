<script setup>
import { ref, computed, watch } from 'vue'
import { displayMode } from './displayMode.js'
import ClavesMode from './components/ClavesMode.vue'
import ScaleVisualizer from './components/ScaleVisualizer.vue'
import ChordProgressions from './components/ChordProgressions.vue'
import ChordDetector from './components/ChordDetector.vue'
import ProgressionBuilder from './components/ProgressionBuilder.vue'

const allTabs = [
  { id: 'claves',         label: 'Claves Mode',         component: ClavesMode,        ep1320Only: true },
  { id: 'scales',         label: 'Scale Visualizer',    component: ScaleVisualizer },
  { id: 'chords',         label: 'Chord Progressions',  component: ChordProgressions },
  { id: 'chord-detector', label: 'Chord Detector',      component: ChordDetector },
  { id: 'prog-builder',   label: 'Progression Builder', component: ProgressionBuilder },
]

const activeTab = ref('claves')
const menuOpen  = ref(false)

const tabs = computed(() =>
  allTabs.filter(t => !t.ep1320Only || displayMode.value === 'ep1320')
)


watch(displayMode, (mode) => {
  if (mode !== 'ep1320' && activeTab.value === 'claves') {
    activeTab.value = 'scales'
  }
})

const activeComponent = computed(() => allTabs.find(t => t.id === activeTab.value)?.component)

function selectTab(id) {
  activeTab.value = id
  menuOpen.value = false
}
</script>

<template>
  <div id="app">
    <header>
      <div class="header-row">
        <div class="title-block">
          <h1>Tonarium</h1>
        </div>
        <div class="header-controls">
          <div class="display-mode-control">
            <label class="mode-label">Display</label>
            <select v-model="displayMode">
              <option value="ep1320">EP-1320</option>
              <option value="notes">Notes</option>
              <option value="guitar">Guitar</option>
              <option value="piano">Piano</option>
            </select>
          </div>
          <button class="burger-btn" @click="menuOpen = true" aria-label="Open menu">
            <span></span><span></span><span></span>
          </button>
        </div>
      </div>
    </header>

    <div class="menu-overlay" :class="{ open: menuOpen }" @click="menuOpen = false"></div>

    <nav class="side-menu" :class="{ open: menuOpen }">
      <button class="close-btn" @click="menuOpen = false" aria-label="Close menu">&#x2715;</button>
      <ul>
        <li v-for="tab in tabs" :key="tab.id">
          <button
            :class="{ active: activeTab === tab.id }"
            @click="selectTab(tab.id)"
          >{{ tab.label }}</button>
        </li>
      </ul>
    </nav>

    <main>
      <component :is="activeComponent" />
    </main>
  </div>
</template>

<style scoped>
header {
  margin-bottom: 1.5rem;
}

@media (orientation: landscape) and (max-height: 500px) {
  header {
    margin-bottom: 0.5rem;
  }
  h1 {
    font-size: 1.1rem;
  }
}

.header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

h1 {
  font-size: clamp(1.2rem, 5vw, 1.8rem);
  font-weight: 700;
  color: #c8a96e;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.title-block {
  min-width: 0;
}

.header-controls {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-shrink: 0;
}

.display-mode-control {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.mode-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #7a6f60;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.display-mode-control select {
  background: #1e1c18;
  border: 1px solid #4a4030;
  border-radius: 6px;
  color: #e8dcc8;
  padding: 0.35rem 0.7rem;
  font-size: 0.85rem;
  cursor: pointer;
  outline: none;
}

.display-mode-control select:focus {
  border-color: #c8a96e;
}

/* Burger button */
.burger-btn {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 5px;
  width: 36px;
  height: 36px;
  background: transparent;
  border: 1px solid #4a4030;
  border-radius: 6px;
  cursor: pointer;
  padding: 8px 7px;
  flex-shrink: 0;
}

.burger-btn span {
  display: block;
  height: 2px;
  background: #c8a96e;
  border-radius: 1px;
}

.burger-btn:hover {
  border-color: #c8a96e;
}

/* Overlay */
.menu-overlay {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  z-index: 100;
}

.menu-overlay.open {
  display: block;
}

/* Side menu */
.side-menu {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: 260px;
  background: #1a1814;
  border-left: 1px solid #3a3228;
  z-index: 101;
  display: flex;
  flex-direction: column;
  padding: 1.25rem 1rem;
  transform: translateX(100%);
  transition: transform 0.22s ease;
}

.side-menu.open {
  transform: translateX(0);
}

.close-btn {
  align-self: flex-end;
  background: transparent;
  border: none;
  color: #7a6f60;
  font-size: 1.1rem;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  margin-bottom: 1.25rem;
}

.close-btn:hover {
  color: #e8dcc8;
}

.side-menu ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.side-menu ul li button {
  width: 100%;
  text-align: left;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 8px;
  color: #7a6f60;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  padding: 0.65rem 0.9rem;
  letter-spacing: 0.03em;
  transition: color 0.15s, background 0.15s, border-color 0.15s;
}

.side-menu ul li button:hover {
  color: #e8dcc8;
  background: #252219;
}

.side-menu ul li button.active {
  background: #2e2820;
  border-color: #4a4030;
  color: #c8a96e;
}
</style>
