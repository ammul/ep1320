import { test, expect } from '@playwright/test'

// Helper: open the side menu and navigate to a tab
async function navigateTo(page, tabLabel) {
  await page.locator('.burger-btn').click()
  await page.locator('nav.side-menu').getByRole('button', { name: tabLabel }).click()
}

test.describe('App loads and navigates', () => {
  test('renders without console errors', async ({ page }) => {
    const errors = []
    page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()) })
    page.on('pageerror', err => errors.push(err.message))

    await page.goto('/')
    await page.waitForLoadState('networkidle')

    expect(errors).toHaveLength(0)
  })

  test('shows the header with app title', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('h1')).toBeVisible()
  })

  test('hamburger menu opens the side nav', async ({ page }) => {
    await page.goto('/')
    await page.locator('.burger-btn').click()
    await expect(page.locator('nav.side-menu')).toHaveClass(/open/)
  })

  test('side nav contains all expected tabs', async ({ page }) => {
    await page.goto('/')
    await page.locator('.burger-btn').click()
    const nav = page.locator('nav.side-menu')
    await expect(nav.getByRole('button', { name: 'Scale Visualizer' })).toBeVisible()
    await expect(nav.getByRole('button', { name: 'Chord Detector' })).toBeVisible()
    await expect(nav.getByRole('button', { name: 'Drum Computer' })).toBeVisible()
    await expect(nav.getByRole('button', { name: 'Chord Progressions' })).toBeVisible()
    await expect(nav.getByRole('button', { name: 'Jam Mode' })).toBeVisible()
  })

  test('Claves Mode is not in the side nav', async ({ page }) => {
    await page.goto('/')
    await page.locator('.burger-btn').click()
    const nav = page.locator('nav.side-menu')
    await expect(nav.getByRole('button', { name: 'Claves Mode' })).not.toBeVisible()
  })

  test('navigating to Scale Visualizer shows its content', async ({ page }) => {
    await page.goto('/')
    await navigateTo(page, 'Scale Visualizer')
    await expect(page.getByText('Scale Visualizer').first()).toBeVisible()
  })

  test('navigating to Chord Detector shows its content', async ({ page }) => {
    await page.goto('/')
    await navigateTo(page, 'Chord Detector')
    await expect(page.getByText('Chord Detector').first()).toBeVisible()
  })
})

test.describe('Scale Visualizer flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await navigateTo(page, 'Scale Visualizer')
  })

  test('shows root note picker with 12 note buttons', async ({ page }) => {
    const buttons = page.locator('.note-picker button')
    await expect(buttons.first()).toBeVisible()
    await expect(buttons).toHaveCount(12)
  })

  test('default A major shows 7 active pads', async ({ page }) => {
    const activePads = page.locator('.pad.active')
    await expect(activePads).toHaveCount(7)
  })

  test('changing root note to C still highlights 7 pads', async ({ page }) => {
    await page.locator('.note-picker').getByRole('button', { name: /^C$/ }).click()
    const activePads = page.locator('.pad.active')
    await expect(activePads).toHaveCount(7)
  })

  test('switching to minor scale still highlights 7 pads', async ({ page }) => {
    const scaleSelect = page.locator('select').first()
    await scaleSelect.selectOption('min')
    const activePads = page.locator('.pad.active')
    await expect(activePads).toHaveCount(7)
  })
})

test.describe('Jam Mode flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await navigateTo(page, 'Jam Mode')
  })

  test('shows key and scale controls', async ({ page }) => {
    await expect(page.locator('select').first()).toBeVisible()
  })

  test('Chromatic is available as a scale option', async ({ page }) => {
    const scaleSelect = page.locator('select').first()
    await scaleSelect.selectOption('chr')
    await expect(scaleSelect).toHaveValue('chr')
  })
})

test.describe('Chord Progressions flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await navigateTo(page, 'Chord Progressions')
  })

  test('shows a list of progressions', async ({ page }) => {
    const progressionItems = page.locator('.progression-item, .prog-item, .progression-btn, [data-progression]')
    await expect(progressionItems.first()).toBeVisible()
  })

  test('selecting a progression shows chord cards', async ({ page }) => {
    const firstProg = page.locator('.progression-item, .prog-item, .progression-btn').first()
    await firstProg.click()
    await expect(page.locator('.chord-card, .card').first()).toBeVisible()
  })
})

test.describe('Display mode switching', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('settings gear icon is visible in header', async ({ page }) => {
    await expect(page.locator('.icon-btn[aria-label="Settings"]')).toBeVisible()
  })

  test('clicking gear icon opens Settings page', async ({ page }) => {
    await page.locator('.icon-btn[aria-label="Settings"]').click()
    await expect(page.getByText('EP-1320').first()).toBeVisible()
    await expect(page.getByText('Notes').first()).toBeVisible()
    await expect(page.getByText('Guitar').first()).toBeVisible()
  })

  test('switching to Notes mode and back to Scale Visualizer shows note tiles', async ({ page }) => {
    // Open settings and switch to Notes mode
    await page.locator('.icon-btn[aria-label="Settings"]').click()
    const settingsSection = page.locator('.settings-section').first()
    await settingsSection.getByRole('button', { name: 'Notes' }).click()
    // Close settings by clicking the gear again
    await page.locator('.icon-btn[aria-label="Settings"]').click()
    // Navigate to Scale Visualizer
    await navigateTo(page, 'Scale Visualizer')
    // In Notes mode, pads are replaced by chroma tiles
    const pads = page.locator('.pad')
    await expect(pads.first()).not.toBeVisible()
  })
})

test.describe('Drum Computer flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await navigateTo(page, 'Drum Computer')
  })

  test('shows 8 instrument rows × 16 steps = 128 step buttons', async ({ page }) => {
    await expect(page.locator('.step-btn').first()).toBeVisible()
    await expect(page.locator('.step-btn')).toHaveCount(128)
  })

  test('toggling a step turns it on', async ({ page }) => {
    const firstStep = page.locator('.step-btn').first()
    await firstStep.click()
    await expect(firstStep).toHaveClass(/on/)
  })

  test('toggling twice turns a step off', async ({ page }) => {
    const firstStep = page.locator('.step-btn').first()
    await firstStep.click()
    await firstStep.click()
    await expect(firstStep).not.toHaveClass(/on/)
  })

  test('BPM input is visible and editable', async ({ page }) => {
    const bpmInput = page.locator('.bpm-input')
    await expect(bpmInput).toBeVisible()
    await bpmInput.fill('140')
    await expect(bpmInput).toHaveValue('140')
  })

  test('Play button is visible', async ({ page }) => {
    const playBtn = page.locator('.transport-btn').first()
    await expect(playBtn).toBeVisible()
    await expect(playBtn).toHaveText('Play')
  })
})
