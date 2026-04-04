import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { nextTick } from 'vue'

function makeLocalStorage(initialData = {}) {
  const store = { ...initialData }
  return {
    getItem:    vi.fn(key => store[key] ?? null),
    setItem:    vi.fn((key, val) => { store[key] = val }),
    removeItem: vi.fn(key => { delete store[key] }),
  }
}

function makeDomElement() {
  const classes = new Set()
  return {
    classList: {
      add:    vi.fn(cls => classes.add(cls)),
      remove: vi.fn((...cls) => cls.forEach(c => classes.delete(c))),
      has:    vi.fn(cls => classes.has(cls)),
      _classes: classes,
    },
  }
}

describe('colorScheme', () => {
  let originalLS
  let originalDoc

  beforeEach(() => {
    originalLS  = globalThis.localStorage
    originalDoc = globalThis.document
    vi.resetModules()
  })

  afterEach(() => {
    Object.defineProperty(globalThis, 'localStorage', { value: originalLS, writable: true, configurable: true })
    Object.defineProperty(globalThis, 'document', { value: originalDoc, writable: true, configurable: true })
  })

  async function loadModule(lsData = {}) {
    const ls  = makeLocalStorage(lsData)
    const el  = makeDomElement()
    const doc = { documentElement: el }
    Object.defineProperty(globalThis, 'localStorage', { value: ls, writable: true, configurable: true })
    Object.defineProperty(globalThis, 'document', { value: doc, writable: true, configurable: true })
    const mod = await import('./colorScheme.js')
    await nextTick()
    return { mod, ls, el }
  }

  it('defaults to "none" when localStorage is empty', async () => {
    const { mod } = await loadModule({})
    expect(mod.colorScheme.value).toBe('none')
  })

  it('defaults to "none" for unrecognised stored value', async () => {
    const { mod } = await loadModule({ colorScheme: 'matrix' })
    expect(mod.colorScheme.value).toBe('none')
  })

  it('reads "medieval" from localStorage on init', async () => {
    const { mod } = await loadModule({ colorScheme: 'medieval' })
    expect(mod.colorScheme.value).toBe('medieval')
  })

  it('reads "ko2" from localStorage on init', async () => {
    const { mod } = await loadModule({ colorScheme: 'ko2' })
    expect(mod.colorScheme.value).toBe('ko2')
  })

  it('reads "riddim" from localStorage on init', async () => {
    const { mod } = await loadModule({ colorScheme: 'riddim' })
    expect(mod.colorScheme.value).toBe('riddim')
  })

  it('adds the scheme class to documentElement when set', async () => {
    const { mod, el } = await loadModule({})
    mod.colorScheme.value = 'medieval'
    await nextTick()
    expect(el.classList.add).toHaveBeenCalledWith('medieval')
  })

  it('removes previous scheme class when switching', async () => {
    const { mod, el } = await loadModule({ colorScheme: 'medieval' })
    mod.colorScheme.value = 'ko2'
    await nextTick()
    expect(el.classList.remove).toHaveBeenCalledWith('medieval', 'ko2', 'riddim')
    expect(el.classList.add).toHaveBeenCalledWith('ko2')
  })

  it('removes scheme class and does not add when set to "none"', async () => {
    const { mod, el } = await loadModule({ colorScheme: 'riddim' })
    mod.colorScheme.value = 'none'
    await nextTick()
    expect(el.classList.remove).toHaveBeenCalledWith('medieval', 'ko2', 'riddim')
    // Should not call add at all after the remove
    const addCallsAfterSwitch = el.classList.add.mock.calls.filter(c => c[0] !== undefined)
    expect(addCallsAfterSwitch.some(c => c[0] === 'none')).toBe(false)
  })

  it('persists new value to localStorage', async () => {
    const { mod, ls } = await loadModule({})
    mod.colorScheme.value = 'riddim'
    await nextTick()
    expect(ls.setItem).toHaveBeenCalledWith('colorScheme', 'riddim')
  })
})
