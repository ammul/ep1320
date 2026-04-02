import { ref, watchEffect } from 'vue'

const stored = typeof localStorage !== 'undefined' ? localStorage.getItem('colorMode') : null
export const colorMode = ref(stored === 'light' ? 'light' : 'dark')

watchEffect(() => {
  if (typeof document !== 'undefined') {
    document.documentElement.classList.toggle('light', colorMode.value === 'light')
  }
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('colorMode', colorMode.value)
  }
})
