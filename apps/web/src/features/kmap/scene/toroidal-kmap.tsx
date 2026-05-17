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
/** biome-ignore-all lint/nursery/noUnknownAttribute: R3F three.js intrinsic elements */
/* oxlint-disable unicorn/no-array-reduce, unicorn/no-immediate-mutation, unicorn/number-literal-case, unicorn/no-process-exit, import/no-duplicates, promise/param-names, @eslint-react/naming-convention/component-name, unicorn/filename-case, react/no-unknown-property, react-perf/jsx-no-new-array-as-prop, react-perf/jsx-no-new-object-as-prop, eslint/no-bitwise */
/* eslint-disable react/no-unknown-property, @eslint-react/dom/no-unknown-property, no-bitwise */
'use client'
import { OrbitControls } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { useMemo } from 'react'
const ACCENT = '#22d3ee'
const SUBSTRATE = '#0b0f14'
const gray = (n: number): number => n ^ (n >> 1)
const ToroidalKmap = ({ vars, truthTable }: { truthTable: readonly (0 | 1 | 'X')[]; vars: number }) => {
  const major = vars >= 6 ? 8 : 8
  const minor = vars >= 6 ? 8 : 4
  const R = 5
  const r = 2
  const cells = useMemo(() => {
    const out: { key: string; out01: 0 | 1 | 'X'; pos: [number, number, number] }[] = []
    for (let i = 0; i < major; i += 1)
      for (let j = 0; j < minor; j += 1) {
        const idx = gray(i) * minor + gray(j)
        const v = truthTable[idx] ?? 0
        const u = (i / major) * Math.PI * 2
        const w = (j / minor) * Math.PI * 2
        const h = v === 1 ? 0.55 : v === 'X' ? 0.3 : 0.08
        const rr = r + h
        const x = (R + rr * Math.cos(w)) * Math.cos(u)
        const y = rr * Math.sin(w)
        const z = (R + rr * Math.cos(w)) * Math.sin(u)
        out.push({ key: `${i}-${j}`, out01: v, pos: [x, y, z] })
      }
    return out
  }, [major, minor, truthTable])
  return (
    <div className='h-[420px] w-full overflow-hidden rounded-lg border' data-testid='kmap-torus-canvas'>
      <Canvas camera={{ fov: 45, position: [0, 8, 18] }} frameloop='demand'>
        <color args={[SUBSTRATE]} attach='background' />
        <ambientLight intensity={0.6} />
        <directionalLight intensity={1.1} position={[6, 10, 8]} />
        <mesh>
          <torusGeometry args={[R, r, 24, 48]} />
          <meshStandardMaterial color='#1b232b' metalness={0.4} roughness={0.7} wireframe />
        </mesh>
        {cells.map(c => (
          <mesh key={c.key} position={c.pos}>
            <boxGeometry args={[0.55, 0.55, 0.55]} />
            <meshStandardMaterial
              color={c.out01 === 1 ? ACCENT : c.out01 === 'X' ? '#f59e0b' : '#3a4651'}
              emissive={c.out01 === 1 ? ACCENT : SUBSTRATE}
              emissiveIntensity={c.out01 === 1 ? 1.3 : 0}
              metalness={0.7}
              roughness={0.4}
            />
          </mesh>
        ))}
        <OrbitControls makeDefault />
      </Canvas>
    </div>
  )
}
export default ToroidalKmap
