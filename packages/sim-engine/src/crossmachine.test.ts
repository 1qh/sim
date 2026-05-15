import { describe, expect, test } from 'bun:test'
import { hashValue } from './index'
const FIXTURES = [
  { expected: '6e46dd10defc9b56c29a6ec56b508c21f54c08192194e4df25bf36f0c9c3c279', name: 'empty-object', payload: {} },
  { expected: 'c54802ad35d2baa25b25f84a8971d34029e46e10f1beb13fa40b898a43fb3730', name: 'simple-counter', payload: { value: 0 } },
  { expected: '2e298c5a47b44a735a952758e38756b9030b6aa31bb2bf4272e100d27d70185b', name: 'nested', payload: { a: { b: [1, 2, 3] } } }
]
describe('cross-machine hash stability', () => {
  test('golden hashes match canonical+blake3 (Bun & Node cross-verified)', () => {
    for (const f of FIXTURES) {
      expect(hashValue(f.payload)).toBe(f.expected)
    }
  })
})
