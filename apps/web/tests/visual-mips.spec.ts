import { expect, test } from '@playwright/test'
const NAMES = [
  'add',
  'addi',
  'and',
  'beq',
  'bne',
  'lw',
  'or',
  'slt',
  'sub',
  'sw',
  'andi',
  'j',
  'lui',
  'nor',
  'ori',
  'sll',
  'srl'
]
for (const name of NAMES)
  test(`visual.datapath.${name}`, async ({ page }) => {
    await page.goto(`/mips/${name}`)
    await expect(page.locator('h1')).toContainText(name)
    await expect(page).toHaveScreenshot(`mips-${name}.png`, { maxDiffPixelRatio: 0.05 })
  })
