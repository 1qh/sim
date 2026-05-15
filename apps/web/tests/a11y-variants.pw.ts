import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
test('a11y.axe.reduced-motion: home passes AA with reduced-motion emulation', async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: 'reduce' })
  const page = await ctx.newPage()
  await page.goto('/')
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze()
  expect(results.violations).toEqual([])
  await ctx.close()
})
test('a11y.axe.high-contrast: home — forced-colors emulation passes structural a11y (color-contrast managed by design-tokens high-contrast theme separately)', async ({
  browser
}) => {
  const ctx = await browser.newContext({ forcedColors: 'active' })
  const page = await ctx.newPage()
  await page.goto('/')
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).disableRules(['color-contrast']).analyze()
  expect(results.violations).toEqual([])
  await ctx.close()
})
test('a11y.axe.color-blind: home passes AA with default rendering (color-blind tested in design-tokens contrast lint)', async ({
  page
}) => {
  await page.goto('/')
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze()
  expect(results.violations).toEqual([])
})
