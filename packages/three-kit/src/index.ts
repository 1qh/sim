import type { ColorRepresentation } from 'three'
import { Color, MeshPhysicalMaterial, MeshStandardMaterial, Vector3 } from 'three'

interface MaterialTokens {
  accent: ColorRepresentation
  hazard: ColorRepresentation
  silicon: ColorRepresentation
  substrate: ColorRepresentation
}
const DEFAULT_TOKENS: MaterialTokens = {
  accent: '#22d3ee',
  hazard: '#f59e0b',
  silicon: '#9aa3ad',
  substrate: '#0b0f14'
}
const siliconMaterial = (tokens: MaterialTokens = DEFAULT_TOKENS): MeshStandardMaterial =>
  new MeshStandardMaterial({ color: new Color(tokens.silicon), metalness: 0.85, roughness: 0.42 })
const pcbMaterial = (tokens: MaterialTokens = DEFAULT_TOKENS): MeshStandardMaterial =>
  new MeshStandardMaterial({ color: new Color(tokens.substrate), metalness: 0.2, roughness: 0.8 })
const glassMaterial = (): MeshPhysicalMaterial =>
  new MeshPhysicalMaterial({ ior: 1.45, metalness: 0, roughness: 0.05, thickness: 0.4, transmission: 0.92 })
const traceMaterial = (active: boolean, tokens: MaterialTokens = DEFAULT_TOKENS): MeshStandardMaterial => {
  const m = new MeshStandardMaterial({ color: new Color(tokens.substrate), metalness: 0.6, roughness: 0.5 })
  m.emissive = new Color(active ? tokens.accent : tokens.substrate)
  m.emissiveIntensity = active ? 1.6 : 0
  return m
}
const hazardMaterial = (tokens: MaterialTokens = DEFAULT_TOKENS): MeshStandardMaterial => {
  const m = new MeshStandardMaterial({ color: new Color(tokens.silicon), metalness: 0.7, roughness: 0.5 })
  m.emissive = new Color(tokens.hazard)
  m.emissiveIntensity = 1.2
  return m
}
interface CameraBookmark {
  key: string
  position: Vector3
  target: Vector3
}
const bookmark = (key: string, position: [number, number, number], target: [number, number, number]): CameraBookmark => ({
  key,
  position: new Vector3(...position),
  target: new Vector3(...target)
})
const pulseAlong = (points: readonly Vector3[], alpha: number, out: Vector3): Vector3 => {
  if (points.length === 0) return out.set(0, 0, 0)
  const first = points[0]
  if (first === undefined) return out.set(0, 0, 0)
  if (points.length === 1) return out.copy(first)
  const clamped = alpha < 0 ? 0 : Math.min(1, alpha)
  const segCount = points.length - 1
  const scaled = clamped * segCount
  const i = Math.min(Math.floor(scaled), segCount - 1)
  const t = scaled - i
  const a = points[i]
  const b = points[i + 1]
  if (a === undefined || b === undefined) return out.copy(first)
  return out.set(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t, a.z + (b.z - a.z) * t)
}
const packInstanceMatrices = (
  transforms: readonly { position: [number, number, number]; scale: number }[],
  into: Float32Array
): Float32Array => {
  for (const [i, t] of transforms.entries()) {
    const o = i * 16
    into[o] = t.scale
    into[o + 5] = t.scale
    into[o + 10] = t.scale
    into[o + 15] = 1
    into[o + 12] = t.position[0]
    into[o + 13] = t.position[1]
    into[o + 14] = t.position[2]
  }
  return into
}
const DEFAULT_BOOKMARKS: readonly CameraBookmark[] = [
  bookmark('survey', [0, 6, 14], [0, 0, 0]),
  bookmark('alu', [3, 2, 6], [3, 0, 0]),
  bookmark('regfile', [-5, 2, 6], [-5, 0, 0]),
  bookmark('control', [0, 5, 5], [0, 2, 0]),
  bookmark('memory', [6, 2, 6], [6, 0, 0]),
  bookmark('side', [12, 2, 0], [0, 0, 0])
]
export {
  bookmark,
  DEFAULT_BOOKMARKS,
  DEFAULT_TOKENS,
  glassMaterial,
  hazardMaterial,
  packInstanceMatrices,
  pcbMaterial,
  pulseAlong,
  siliconMaterial,
  traceMaterial
}
export type { CameraBookmark, MaterialTokens }
