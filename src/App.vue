<script setup>
import { ref, computed, watch } from 'vue'
import { displayMode } from './displayMode.js'
import StartPage from './components/StartPage.vue'
import ClavesMode from './components/ClavesMode.vue'
import ScaleVisualizer from './components/ScaleVisualizer.vue'
import ChordProgressions from './components/ChordProgressions.vue'
import ChordDetector from './components/ChordDetector.vue'
import ProgressionBuilder from './components/ProgressionBuilder.vue'
import JamMode from './components/JamMode.vue'
import LearnMode from './components/LearnMode.vue'
import SettingsPage from './components/SettingsPage.vue'

const allTabs = [
  { id: 'home',           label: 'Home',                component: StartPage },
  { id: 'learn',          label: 'Learn',               component: LearnMode },
  { id: 'claves',         label: 'Claves Mode',         component: ClavesMode,        ep1320Only: true },
  { id: 'jam',            label: 'Jam Mode',            component: JamMode },
  { id: 'scales',         label: 'Scale Visualizer',    component: ScaleVisualizer },
  { id: 'chords',         label: 'Chord Progressions',  component: ChordProgressions },
  { id: 'chord-detector', label: 'Chord Detector',      component: ChordDetector },
  { id: 'prog-builder',   label: 'Progression Builder', component: ProgressionBuilder },
  { id: 'settings',       label: 'Settings',            component: SettingsPage },
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
          <h1 @click="selectTab('home')" class="home-link">Tonarium</h1>
        </div>
        <div class="header-controls">
          <button class="icon-btn" @click="selectTab('settings')" :class="{ active: activeTab === 'settings' }" aria-label="Settings">
            <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492zM5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0z"/>
              <path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52l-.094-.319zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.291A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.474l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115l.094-.319z"/>
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
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 50;
  background: var(--bg);
  padding: 0.75rem 1.5rem;
  border-bottom: 1px solid var(--border);
  margin-bottom: 0;
}

@media (orientation: landscape) and (max-height: 500px) {
  header {
    padding: 0.35rem 1rem;
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

.home-link {
  cursor: pointer;
}

.header-controls {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-shrink: 0;
}

/* Settings / icon button */
.icon-btn {
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
  transition: border-color 0.15s, color 0.15s, background 0.15s;
}

.icon-btn:hover  { border-color: var(--accent); color: var(--accent); }
.icon-btn.active { background: var(--accent-bg); border-color: var(--accent); color: var(--accent); }

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

main {
  padding-top: 4rem;
}

@media (orientation: landscape) and (max-height: 500px) {
  main {
    padding-top: 2.5rem;
  }
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
