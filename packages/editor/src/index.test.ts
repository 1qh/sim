import { describe, expect, test } from 'bun:test'
import { placeholder } from './index'
describe('@sim/editor', () => {
  test('placeholder export defined', () => {
    expect(typeof placeholder).toBe('string')
  })
})
