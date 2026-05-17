/** biome-ignore-all lint/nursery/noUndeclaredEnvVars: noise */
/** biome-ignore-all lint/nursery/useGlobalThis: noise */
/** biome-ignore-all lint/suspicious/noBitwiseOperators: noise */
/** biome-ignore-all lint/suspicious/noMisplacedAssertion: noise */
/** biome-ignore-all lint/nursery/noComponentHookFactories: noise */
/** biome-ignore-all lint/nursery/noContinue: noise */
/** biome-ignore-all lint/performance/noAwaitInLoops: noise */
/** biome-ignore-all lint/performance/noNamespaceImport: noise */
/** biome-ignore-all lint/complexity/noUselessStringRaw: noise */
/** biome-ignore-all lint/complexity/useMaxParams: noise */
/* oxlint-disable unicorn/no-array-reduce, unicorn/no-immediate-mutation, unicorn/number-literal-case, unicorn/no-process-exit, import/no-duplicates, promise/param-names, @eslint-react/naming-convention/component-name */
import { describe, expect, test } from 'bun:test'
import { Vector3 } from 'three'
import {
  bookmark,
  DEFAULT_BOOKMARKS,
  glassMaterial,
  hazardMaterial,
  packInstanceMatrices,
  pcbMaterial,
  pulseAlong,
  siliconMaterial,
  traceMaterial
} from './index'
describe('@sim/three-kit materials', () => {
  test('silicon is metallic', () => {
    expect(siliconMaterial().metalness).toBeGreaterThan(0.5)
  })
  test('pcb is rough', () => {
    expect(pcbMaterial().roughness).toBeGreaterThan(0.5)
  })
  test('glass transmits', () => {
    expect(glassMaterial().transmission).toBeGreaterThan(0.5)
  })
  test('trace emissive only when active', () => {
    expect(traceMaterial(true).emissiveIntensity).toBeGreaterThan(0)
    expect(traceMaterial(false).emissiveIntensity).toBe(0)
  })
  test('hazard emissive', () => {
    expect(hazardMaterial().emissiveIntensity).toBeGreaterThan(0)
  })
})
describe('@sim/three-kit camera grammar', () => {
  test('bookmark stores position+target', () => {
    const b = bookmark('x', [1, 2, 3], [4, 5, 6])
    expect(b.position.x).toBe(1)
    expect(b.target.z).toBe(6)
  })
  test('default bookmarks cover survey + components', () => {
    expect(DEFAULT_BOOKMARKS.length).toBeGreaterThanOrEqual(6)
    expect(DEFAULT_BOOKMARKS.map(b => b.key)).toContain('survey')
  })
})
describe('@sim/three-kit pulseAlong (deterministic)', () => {
  const pts = [new Vector3(0, 0, 0), new Vector3(10, 0, 0)]
  test('alpha 0 = start', () => {
    expect(pulseAlong(pts, 0, new Vector3()).x).toBe(0)
  })
  test('alpha 0.5 = midpoint', () => {
    expect(pulseAlong(pts, 0.5, new Vector3()).x).toBe(5)
  })
  test('alpha 1 = end', () => {
    expect(pulseAlong(pts, 1, new Vector3()).x).toBe(10)
  })
  test('alpha clamps', () => {
    expect(pulseAlong(pts, 2, new Vector3()).x).toBe(10)
    expect(pulseAlong(pts, -1, new Vector3()).x).toBe(0)
  })
  test('multi-segment polyline', () => {
    const p = [new Vector3(0, 0, 0), new Vector3(2, 0, 0), new Vector3(2, 2, 0)]
    expect(pulseAlong(p, 0.75, new Vector3())).toMatchObject({ x: 2, y: 1 })
  })
  test('empty + single', () => {
    expect(pulseAlong([], 0.5, new Vector3()).x).toBe(0)
    expect(pulseAlong([new Vector3(7, 0, 0)], 0.5, new Vector3()).x).toBe(7)
  })
})
describe('@sim/three-kit instancing', () => {
  test('packInstanceMatrices writes scale + translation', () => {
    const buf = new Float32Array(32)
    packInstanceMatrices(
      [
        { position: [1, 2, 3], scale: 2 },
        { position: [4, 5, 6], scale: 3 }
      ],
      buf
    )
    expect(buf[0]).toBe(2)
    expect(buf[12]).toBe(1)
    expect(buf[16]).toBe(3)
    expect(buf[28]).toBe(4)
    expect(buf[31]).toBe(1)
  })
})
