import { describe, expect, test } from 'bun:test'
import * as mod from './index'
describe('@sim/hud', () => {
  test('module exports load', () => {
    expect(typeof mod).toBe('object')
  })
})
