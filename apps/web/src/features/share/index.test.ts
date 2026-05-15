import { describe, expect, test } from 'bun:test'
import {
  base64UrlDecode,
  base64UrlEncode,
  decodeFragment,
  encodeShare,
  isLargePayload,
  permalinkPath,
  URL_FRAGMENT_LIMIT_BYTES
} from './index'
describe('base64url codec', () => {
  test('round-trip byte preservation', () => {
    const bytes = new Uint8Array([0, 1, 2, 254, 255, 100, 200])
    const decoded = base64UrlDecode(base64UrlEncode(bytes))
    expect([...decoded]).toEqual([...bytes])
  })
  test('produces url-safe characters only', () => {
    const enc = base64UrlEncode(new Uint8Array([255, 254, 253, 252]))
    expect(enc).not.toContain('+')
    expect(enc).not.toContain('/')
    expect(enc).not.toContain('=')
  })
})
describe('encodeShare tier selection', () => {
  test('small payload → fragment tier', () => {
    const enc = encodeShare({ pc: 0, registers: { 1: 5, 2: 7 } })
    expect(enc.tier).toBe('fragment')
    expect(enc.fragment).toBeDefined()
    expect(enc.fragment!.length).toBeLessThanOrEqual(URL_FRAGMENT_LIMIT_BYTES)
  })
  test('large payload → convex tier', () => {
    const huge = { data: Array.from({ length: 5000 }, (_, i) => `item-${i}-pad-${Math.sin(i)}`) }
    const enc = encodeShare(huge)
    expect(enc.tier).toBe('convex')
    expect(enc.fragment).toBeUndefined()
    expect(isLargePayload(enc)).toBe(true)
  })
  test('hash deterministic across encode calls', () => {
    const a = encodeShare({ x: 1, y: 2 })
    const b = encodeShare({ x: 1, y: 2 })
    expect(a.hash).toBe(b.hash)
  })
})
describe('fragment round-trip', () => {
  test('encode→decode preserves payload', () => {
    const value = { pc: 0x1_00, registers: { 1: 5, 2: 7 }, vars: ['A', 'B', 'C'] }
    const enc = encodeShare(value)
    expect(enc.fragment).toBeDefined()
    const decoded = decodeFragment<typeof value>(enc.fragment!)
    expect(decoded).toEqual(value)
  })
})
describe('permalink path shape', () => {
  test('uses /s/<hash> form', () => {
    expect(permalinkPath('abc123')).toBe('/s/abc123')
  })
})
