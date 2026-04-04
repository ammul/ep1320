<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { displayMode } from '@/state/displayMode.js'
import { colorScheme as _colorScheme } from '@/state/colorScheme.js'
import { isPlaying as drumIsPlaying, play as drumPlay, pause as drumPause } from '@/audio/drumEngine.js'
import StartPage from '@/pages/StartPage.vue'
import ScaleVisualizer from '@/pages/ScaleVisualizer.vue'
import ChordProgressions from '@/pages/ChordProgressions.vue'
import ChordDetector from '@/pages/ChordDetector.vue'
import ProgressionBuilder from '@/pages/ProgressionBuilder.vue'
import JamMode from '@/pages/JamMode.vue'
import LearnMode from '@/pages/LearnMode.vue'
import SettingsPage from '@/pages/SettingsPage.vue'
import DrumComputer from '@/pages/DrumComputer.vue'
import AboutPage from '@/pages/AboutPage.vue'

const allTabs = [
  { id: 'home',           label: 'Home',                shortLabel: 'Home',         component: StartPage },
  { id: 'learn',          label: 'Learn',               shortLabel: 'Learn',        component: LearnMode },
  { id: 'jam',            label: 'Jam Mode',            shortLabel: 'Jam',          component: JamMode },
  { id: 'drums',          label: 'Drum Computer',       shortLabel: 'Drums',        component: DrumComputer },
  { id: 'scales',         label: 'Scale Visualizer',    shortLabel: 'Scales',       component: ScaleVisualizer },
  { id: 'chords',         label: 'Chord Progressions',  shortLabel: 'Progressions', component: ChordProgressions },
  { id: 'chord-detector', label: 'Chord Detector',      shortLabel: 'Detector',     component: ChordDetector },
  { id: 'prog-builder',   label: 'Progression Builder', shortLabel: 'Builder',      component: ProgressionBuilder },
  { id: 'about',          label: 'About',               shortLabel: 'About',        component: AboutPage },
  { id: 'settings',       label: 'Settings',            shortLabel: 'Settings',     component: SettingsPage },
]

const activeTab      = ref('home')
const previousTab    = ref('home')
const menuOpen       = ref(false)
const drumEverPlayed = ref(false)

watch(drumIsPlaying, (playing) => {
  if (playing) drumEverPlayed.value = true
})

const tabs = computed(() =>
  allTabs.filter(t => !t.padOnly || displayMode.value === 'pad')
)

watch(displayMode, (mode) => {
  if (mode !== 'pad' && activeTab.value === 'claves') {
    activeTab.value = 'home'
  }
})

const activeComponent = computed(() => allTabs.find(t => t.id === activeTab.value)?.component)

function selectTab(id) {
  if (id === 'settings' && activeTab.value !== 'settings') {
    previousTab.value = activeTab.value
  }
  activeTab.value = id
  menuOpen.value = false
  history.pushState({ tab: id }, '')
}

function closeSettings() {
  selectTab(previousTab.value)
}

function handlePopState(e) {
  const tab = e.state?.tab
  if (tab && allTabs.some(t => t.id === tab)) {
    activeTab.value = tab
    menuOpen.value = false
  }
}

onMounted(() => {
  history.replaceState({ tab: activeTab.value }, '')
  window.addEventListener('popstate', handlePopState)
})

onUnmounted(() => {
  window.removeEventListener('popstate', handlePopState)
})
</script>

<template>
  <div id="app">
    <header>
      <div class="header-row">
        <div class="title-block">
          <h1 @click="selectTab('home')" class="home-link">Tonarium</h1>
        </div>
        <div class="header-controls">
          <div v-if="drumEverPlayed" class="drum-widget" :class="{ playing: drumIsPlaying }" @click="selectTab('drums')">
            <span class="dw-dot"></span>
            <span class="dw-label">Drums</span>
            <button
              class="dw-btn"
              :aria-label="drumIsPlaying ? 'Pause drums' : 'Play drums'"
              @click.stop="drumIsPlaying ? drumPause() : drumPlay()"
            >
              <svg v-if="drumIsPlaying" width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
                <rect x="1.5" y="1" width="3" height="8" rx="1"/>
                <rect x="5.5" y="1" width="3" height="8" rx="1"/>
              </svg>
              <svg v-else width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
                <polygon points="2,1 9,5 2,9"/>
              </svg>
            </button>
          </div>
          <button class="icon-btn" @click="activeTab === 'settings' ? closeSettings() : selectTab('settings')" :class="{ active: activeTab === 'settings' }" aria-label="Settings">
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

    <nav class="desktop-tabs" aria-label="Main navigation">
      <div class="dt-inner">
        <button
          v-for="tab in tabs.filter(t => t.id !== 'settings')"
          :key="tab.id"
          class="dt-tab"
          :class="{ active: activeTab === tab.id }"
          @click="selectTab(tab.id)"
        >{{ tab.shortLabel }}</button>
      </div>
    </nav>

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
      <component :is="activeComponent" @navigate="selectTab" @close="closeSettings" />
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
  border-bottom: 1px solid var(--border);
}

.header-row {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0.75rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

@media (orientation: landscape) and (max-height: 500px) {
  .header-row {
    padding: 0.35rem 1rem;
  }
  h1 {
    font-size: 1.1rem;
  }
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

/* Drum widget */
.drum-widget {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0 0.5rem 0 0.55rem;
  height: 36px;
  border: 1px solid var(--border2);
  border-radius: 6px;
  background: transparent;
  cursor: pointer;
  transition: border-color 0.15s;
}

.drum-widget.playing {
  border-color: var(--accent-mid);
  background: var(--accent-bg);
}

.dw-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--text4);
  flex-shrink: 0;
  transition: background 0.2s;
}

.drum-widget.playing .dw-dot {
  background: var(--accent);
  animation: dw-pulse 1s ease-in-out infinite;
}

@keyframes dw-pulse {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.35; }
}

.dw-label {
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--text4);
  transition: color 0.15s;
}

.drum-widget.playing .dw-label {
  color: var(--accent);
}

.dw-btn {
  width: 24px;
  height: 24px;
  background: transparent;
  border: 1px solid var(--border2);
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text3);
  flex-shrink: 0;
  padding: 0;
  transition: border-color 0.15s, color 0.15s, background 0.15s;
}

.dw-btn:hover {
  border-color: var(--accent);
  color: var(--accent);
  background: var(--accent-bg);
}

.drum-widget.playing .dw-btn {
  color: var(--accent);
  border-color: var(--accent-mid);
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

@media (min-width: 768px) {
  main {
    padding-top: 7rem;
  }
}

@media (orientation: landscape) and (max-height: 500px) {
  main {
    padding-top: 2.5rem;
  }
}

/* ── Desktop tab bar ──────────────────────────────────────────────────────── */
.desktop-tabs {
  display: none;
  position: fixed;
  top: 3.75rem;
  left: 0;
  right: 0;
  z-index: 49;
  background: var(--bg);
  border-bottom: 1px solid var(--border);
}

.dt-inner {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 1.5rem;
  display: flex;
  overflow-x: auto;
  scrollbar-width: none;
}

.dt-inner::-webkit-scrollbar { display: none; }

.dt-tab {
  padding: 0.6rem 0.9rem;
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  color: var(--text3);
  font-size: 0.82rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  white-space: nowrap;
  letter-spacing: 0.03em;
  flex-shrink: 0;
  transition: color 0.15s, border-color 0.15s;
}

.dt-tab:hover { color: var(--text2); }

.dt-tab.active {
  color: var(--accent);
  border-bottom-color: var(--accent);
}

@media (min-width: 768px) {
  .desktop-tabs { display: block; }
  .burger-btn    { display: none; }
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
  padding: 2rem 1rem 1.25rem;
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
