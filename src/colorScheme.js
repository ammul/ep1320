import { ref, watchEffect } from 'vue'

const stored = typeof localStorage !== 'undefined' ? localStorage.getItem('colorScheme') : null
const VALID = ['none', 'medieval', 'ko2', 'riddim']
export const colorScheme = ref(VALID.includes(stored) ? stored : 'medieval')

watchEffect(() => {
  if (typeof document !== 'undefined') {
    const el = document.documentElement
    el.classList.remove('medieval', 'ko2', 'riddim')
    if (colorScheme.value !== 'none') {
      el.classList.add(colorScheme.value)
    }
  }
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('colorScheme', colorScheme.value)
  }
})
