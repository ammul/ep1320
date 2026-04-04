import { ref, watchEffect } from 'vue'

const stored = typeof localStorage !== 'undefined' ? localStorage.getItem('soundStyle') : null
const VALID = ['synth', 'piano', 'bell', 'pluck']
export const soundStyle = ref(VALID.includes(stored) ? stored : 'synth')

watchEffect(() => {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('soundStyle', soundStyle.value)
  }
})
