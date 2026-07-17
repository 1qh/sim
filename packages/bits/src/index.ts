/* oxlint-disable unicorn/number-literal-case */
/* eslint-disable @typescript-eslint/max-params */
const HEX_PREFIX = /^0x/iu
const TWO_POW_32 = 4_294_967_296
const u32 = (n: number): number => {
  const m = ((n % TWO_POW_32) + TWO_POW_32) % TWO_POW_32
  return Math.trunc(m)
}
const s32 = (n: number): number => {
  const m = u32(n)
  return m >= 2_147_483_648 ? m - TWO_POW_32 : m
}
const mask = (width: number): number => (width >= 32 ? 0xff_ff_ff_ff : 2 ** width - 1)
const toU32 = (n: number): number => u32(n)
const toS32 = (n: number): number => s32(n)
const signExtend = (value: number, fromWidth: number): number => {
  const m = mask(fromWidth)
  const v = u32(value) % (m + 1)
  const signBit = 2 ** (fromWidth - 1)
  return v >= signBit ? v - (m + 1) : v
}
const zeroExtend = (value: number, fromWidth: number): number => u32(value) % (mask(fromWidth) + 1)
const extractField = (word: number, hi: number, lo: number): number => {
  const width = hi - lo + 1
  return Math.floor(u32(word) / 2 ** lo) % 2 ** width
}
const insertField = (word: number, hi: number, lo: number, value: number): number => {
  const width = hi - lo + 1
  const m = mask(width)
  const shifted = (u32(value) % (m + 1)) * 2 ** lo
  const cleared = u32(word) - (Math.floor(u32(word) / 2 ** lo) % (m + 1)) * 2 ** lo
  return u32(cleared + shifted)
}
const addU32 = (a: number, b: number): number => u32(a + b)
const subU32 = (a: number, b: number): number => u32(a - b)
const shlU32 = (a: number, shamt: number): number => u32(a * 2 ** (shamt % 32))
const shrU32 = (a: number, shamt: number): number => Math.floor(u32(a) / 2 ** (shamt % 32))
const sarS32 = (a: number, shamt: number): number => {
  const sh = shamt % 32
  const v = s32(a)
  return Math.floor(v / 2 ** sh)
}
const ltS32 = (a: number, b: number): boolean => s32(a) < s32(b)
const ltU32 = (a: number, b: number): boolean => u32(a) < u32(b)
const popcount = (a: number): number => {
  let v = u32(a)
  let count = 0
  while (v > 0) {
    if (v % 2 === 1) count += 1
    v = Math.floor(v / 2)
  }
  return count
}
const parity = (a: number): 0 | 1 => (popcount(a) % 2) as 0 | 1
const reverseBits32 = (a: number): number => {
  let v = u32(a)
  let result = 0
  for (let i = 0; i < 32; i += 1) {
    result = result * 2 + (v % 2)
    v = Math.floor(v / 2)
  }
  return u32(result)
}
const toHex32 = (a: number): string => `0x${u32(a).toString(16).padStart(8, '0')}`
const toBin32 = (a: number): string => u32(a).toString(2).padStart(32, '0')
const fromHex = (s: string): number => u32(Number.parseInt(s.replace(HEX_PREFIX, ''), 16))
const fromBin = (s: string): number => u32(Number.parseInt(s, 2))
export {
  addU32,
  extractField,
  fromBin,
  fromHex,
  insertField,
  ltS32,
  ltU32,
  mask,
  parity,
  popcount,
  reverseBits32,
  sarS32,
  shlU32,
  shrU32,
  signExtend,
  subU32,
  toBin32,
  toHex32,
  toS32,
  toU32,
  zeroExtend
}
