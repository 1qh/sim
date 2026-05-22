/** biome-ignore-all lint/suspicious/noBitwiseOperators: noise */
/* oxlint-disable unicorn/number-literal-case */
/* eslint-disable no-bitwise */
interface RngState {
  a: number
  b: number
  c: number
  d: number
}
const TWO_POW_32 = 4_294_967_296
const u32 = (n: number): number => ((n % TWO_POW_32) + TWO_POW_32) % TWO_POW_32
const fromSeed = (seed: number): RngState => {
  let s = u32(seed) || 1
  const step = (): number => {
    s = u32(s + 0x6d_2b_79_f5)
    let t = s
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return u32(t ^ (t >>> 14))
  }
  return { a: step(), b: step(), c: step(), d: step() }
}
const next = (state: RngState): number => {
  const t = u32(state.a + state.b)
  state.a = u32(state.b ^ (state.b >>> 9))
  state.b = u32(state.c + (state.c << 3))
  state.c = u32((state.c << 21) | (state.c >>> 11))
  state.d = u32(state.d + 1)
  const out = u32(t + state.d)
  state.c = u32(state.c + t)
  return out
}
const nextFloat = (state: RngState): number => next(state) / TWO_POW_32
const nextInt = (state: RngState, max: number): number => Math.floor(nextFloat(state) * max)
const clone = (state: RngState): RngState => ({ a: state.a, b: state.b, c: state.c, d: state.d })
export { clone, fromSeed, next, nextFloat, nextInt }
export type { RngState }
