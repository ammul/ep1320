import { ref, computed } from 'vue'
export const padSize = ref('4x3')
export const padCols = computed(() => padSize.value === '4x4' ? 4 : 3)
