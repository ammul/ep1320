<script setup>
import { ref, computed, watch } from 'vue'
import { displayMode } from './displayMode.js'
import { colorMode } from './colorMode.js'
import StartPage from './components/StartPage.vue'
import ClavesMode from './components/ClavesMode.vue'
import ScaleVisualizer from './components/ScaleVisualizer.vue'
import ChordProgressions from './components/ChordProgressions.vue'
import ChordDetector from './components/ChordDetector.vue'
import ProgressionBuilder from './components/ProgressionBuilder.vue'

const allTabs = [
  { id: 'home',           label: 'Home',                component: StartPage },
  { id: 'claves',         label: 'Claves Mode',         component: ClavesMode,        ep1320Only: true },
  { id: 'scales',         label: 'Scale Visualizer',    component: ScaleVisualizer },
  { id: 'chords',         label: 'Chord Progressions',  component: ChordProgressions },
  { id: 'chord-detector', label: 'Chord Detector',      component: ChordDetector },
  { id: 'prog-builder',   label: 'Progression Builder', component: ProgressionBuilder },
]

const activeTab = ref('home')
const menuOpen  = ref(false)

const tabs = computed(() =>
  allTabs.filter(t => !t.ep1320Only || displayMode.value === 'ep1320')
)


watch(displayMode, (mode) => {
  if (mode !== 'ep1320' && activeTab.value === 'claves') {
    activeTab.value = 'home'
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
          <button class="theme-btn" @click="colorMode = colorMode === 'dark' ? 'light' : 'dark'" :aria-label="colorMode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'">
            <svg v-if="colorMode === 'dark'" width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="7.5" cy="7.5" r="3" fill="currentColor"/>
              <path d="M7.5 1V2.5M7.5 12.5V14M1 7.5H2.5M12.5 7.5H14M2.9 2.9L3.96 3.96M11.04 11.04L12.1 12.1M12.1 2.9L11.04 3.96M3.96 11.04L2.9 12.1" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
            </svg>
            <svg v-else width="15" height="15" viewBox="0 0 15 15" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M12.5 9A6 6 0 1 1 6 2.5a4.5 4.5 0 0 0 6.5 6.5z"/>
            </svg>
          </button>
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
      <component :is="activeComponent" @navigate="selectTab" />
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
  color: var(--accent);
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
  color: var(--text3);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.display-mode-control select {
  background: var(--input);
  border: 1px solid var(--border2);
  border-radius: 6px;
  color: var(--text);
  padding: 0.35rem 0.7rem;
  font-size: 0.85rem;
  cursor: pointer;
  outline: none;
}

.display-mode-control select:focus {
  border-color: var(--accent);
}

/* Theme toggle */
.theme-btn {
  width: 36px;
  height: 36px;
  background: transparent;
  border: 1px solid var(--border2);
  border-radius: 6px;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text3);
  flex-shrink: 0;
  transition: border-color 0.15s, color 0.15s;
}

.theme-btn:hover {
  border-color: var(--accent);
  color: var(--accent);
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
  border: 1px solid var(--border2);
  border-radius: 6px;
  cursor: pointer;
  padding: 8px 7px;
  flex-shrink: 0;
}

.burger-btn span {
  display: block;
  height: 2px;
  background: var(--accent);
  border-radius: 1px;
}

.burger-btn:hover {
  border-color: var(--accent);
}

/* Overlay */
.menu-overlay {
  display: none;
  position: fixed;
  inset: 0;
  background: var(--overlay);
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
  background: var(--bg);
  border-left: 1px solid var(--border);
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
  color: var(--text3);
  font-size: 1.1rem;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  margin-bottom: 1.25rem;
}

.close-btn:hover {
  color: var(--text);
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
  color: var(--text3);
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  padding: 0.65rem 0.9rem;
  letter-spacing: 0.03em;
  transition: color 0.15s, background 0.15s, border-color 0.15s;
}

.side-menu ul li button:hover {
  color: var(--text);
  background: var(--hover);
}

.side-menu ul li button.active {
  background: var(--raised);
  border-color: var(--border2);
  color: var(--accent);
}
</style>
