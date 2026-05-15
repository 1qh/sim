import { describe, expect, test } from 'bun:test'
import { placeholder } from './index'
describe('@sim/three-kit', () => {
  test('placeholder export defined', () => {
    expect(typeof placeholder).toBe('string')
  })
})
