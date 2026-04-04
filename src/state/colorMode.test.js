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
      toggle: vi.fn((cls, force) => { if (force) classes.add(cls); else classes.delete(cls) }),
      add:    vi.fn(cls => classes.add(cls)),
      remove: vi.fn((...cls) => cls.forEach(c => classes.delete(c))),
      has:    vi.fn(cls => classes.has(cls)),
      _classes: classes,
    },
  }
}

describe('colorMode', () => {
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
    const doc = { documentElement: makeDomElement() }
    Object.defineProperty(globalThis, 'localStorage', { value: ls, writable: true, configurable: true })
    Object.defineProperty(globalThis, 'document', { value: doc, writable: true, configurable: true })
    const mod = await import('./colorMode.js')
    await nextTick()
    return { mod, ls, doc }
  }

  it('defaults to "dark" when localStorage has no colorMode', async () => {
    const { mod } = await loadModule({})
    expect(mod.colorMode.value).toBe('dark')
  })

  it('reads "light" from localStorage on init', async () => {
    const { mod } = await loadModule({ colorMode: 'light' })
    expect(mod.colorMode.value).toBe('light')
  })

  it('defaults to "dark" for unrecognised stored value', async () => {
    const { mod } = await loadModule({ colorMode: 'purple' })
    expect(mod.colorMode.value).toBe('dark')
  })

  it('adds "light" class to documentElement when set to light', async () => {
    const { mod, doc } = await loadModule({})
    mod.colorMode.value = 'light'
    await nextTick()
    expect(doc.documentElement.classList.toggle).toHaveBeenCalledWith('light', true)
  })

  it('removes "light" class when set back to dark', async () => {
    const { mod, doc } = await loadModule({ colorMode: 'light' })
    mod.colorMode.value = 'dark'
    await nextTick()
    expect(doc.documentElement.classList.toggle).toHaveBeenCalledWith('light', false)
  })

  it('persists new value to localStorage', async () => {
    const { mod, ls } = await loadModule({})
    mod.colorMode.value = 'light'
    await nextTick()
    expect(ls.setItem).toHaveBeenCalledWith('colorMode', 'light')
  })
})
