import { describe, expect, test } from 'bun:test'
import { buildBreadcrumb, coalesceAnnouncements, dockPanel, formatTelemetry } from './index'

describe('@sim/hud formatTelemetry', () => {
  test('aligns labels to common width', () => {
    const out = formatTelemetry([
      { label: 'PC', value: '0x0' },
      { label: 'cycle', value: '3' }
    ])
    expect(out.split('\n')[0]).toBe('PC     0x0')
    expect(out.split('\n')[1]).toBe('cycle  3')
  })
})
describe('@sim/hud buildBreadcrumb', () => {
  test('short path unchanged', () => {
    expect(buildBreadcrumb(['a', 'b'])).toBe('a / b')
  })
  test('long path collapses with ellipsis', () => {
    expect(buildBreadcrumb(['a', 'b', 'c', 'd', 'e', 'f'], 3)).toBe('… / d / e / f')
  })
})
describe('@sim/hud dockPanel', () => {
  const vp = { height: 800, width: 1200 }
  const sz = { height: 100, width: 200 }
  test('left dock', () => {
    expect(dockPanel({ edge: 'left', size: sz, viewport: vp })).toMatchObject({ x: 16, y: 16 })
  })
  test('right dock', () => {
    expect(dockPanel({ edge: 'right', size: sz, viewport: vp }).x).toBe(1200 - 200 - 16)
  })
  test('bottom dock', () => {
    expect(dockPanel({ edge: 'bottom', size: sz, viewport: vp }).y).toBe(800 - 100 - 16)
  })
})
describe('@sim/hud coalesceAnnouncements', () => {
  test('joins messages', () => {
    expect(coalesceAnnouncements(['Step IF complete.', 'PC=0x4.'])).toBe('Step IF complete. PC=0x4.')
  })
})
