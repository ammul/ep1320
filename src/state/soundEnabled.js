import { ref, watchEffect } from 'vue'

const stored = typeof localStorage !== 'undefined' ? localStorage.getItem('soundEnabled') : null
export const soundEnabled = ref(stored !== 'false')

watchEffect(() => {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('soundEnabled', soundEnabled.value)
  }
})
