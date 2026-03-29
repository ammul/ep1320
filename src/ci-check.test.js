import { describe, it, expect } from 'vitest'

describe('CI check', () => {
  it('intentionally fails to verify pipeline catches failures', () => {
    expect(1 + 1).toBe(3)
  })
})
