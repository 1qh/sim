/** biome-ignore-all lint/suspicious/noBitwiseOperators: noise */
/** biome-ignore-all lint/nursery/noUnknownAttribute: R3F three.js intrinsic elements */
/* oxlint-disable react-perf/jsx-no-new-array-as-prop, react-perf/jsx-no-new-object-as-prop */
/* eslint-disable react/no-unknown-property, @eslint-react/dom/no-unknown-property, no-bitwise */
'use client'
import { cn } from '@a/ui'
import { OrbitControls } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { useTheme } from 'next-themes'
import { useMemo, useState } from 'react'

const ACCENT = '#22d3ee'
const SELECTED = '#a855f7'
const gray = (n: number): number => n ^ (n >> 1)
interface Cell {
  bin: string
  idx: number
  key: string
  out01: 0 | 1 | 'X'
  pos: [number, number, number]
}
const ToroidalKmap = ({ vars, truthTable }: { truthTable: readonly (0 | 1 | 'X')[]; vars: number }) => {
  const { resolvedTheme } = useTheme()
  const substrate = resolvedTheme === 'light' ? '#eef2f7' : '#0b0f14'
  const [selected, setSelected] = useState<Cell | undefined>(undefined)
  const major = 8
  const minor = vars >= 6 ? 8 : 4
  const R = 5
  const r = 2
  const cells = useMemo(() => {
    const out: Cell[] = []
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
        out.push({ bin: idx.toString(2).padStart(vars, '0'), idx, key: `${i}-${j}`, out01: v, pos: [x, y, z] })
      }
    return out
  }, [minor, truthTable, vars])
  return (
    <div className='relative size-full' data-testid='kmap-torus-canvas'>
      <Canvas camera={{ fov: 45, position: [0, 8, 18] }}>
        <color args={[substrate]} attach='background' />
        <ambientLight intensity={0.6} />
        <directionalLight intensity={1.1} position={[6, 10, 8]} />
        <mesh>
          <torusGeometry args={[R, r, 24, 48]} />
          <meshStandardMaterial color='#1b232b' metalness={0.4} roughness={0.7} wireframe />
        </mesh>
        {cells.map(c => (
          <mesh key={c.key} onPointerDown={() => setSelected(c)} position={c.pos}>
            <boxGeometry args={[0.55, 0.55, 0.55]} />
            <meshStandardMaterial
              color={selected?.key === c.key ? SELECTED : c.out01 === 1 ? ACCENT : c.out01 === 'X' ? '#f59e0b' : '#3a4651'}
              emissive={selected?.key === c.key ? SELECTED : c.out01 === 1 ? ACCENT : substrate}
              emissiveIntensity={selected?.key === c.key ? 1.8 : c.out01 === 1 ? 1.3 : 0}
              metalness={0.7}
              roughness={0.4}
            />
          </mesh>
        ))}
        <OrbitControls makeDefault />
      </Canvas>
      {selected === undefined ? undefined : (
        <div
          className={cn(
            'absolute right-4 bottom-4 rounded-xl border bg-background/80 p-3 font-mono text-xs shadow-lg backdrop-blur-md'
          )}>
          <div className='font-bold text-[#a855f7]'>
            m{selected.idx} = {selected.out01}
          </div>
          <div className='text-muted-foreground'>binary {selected.bin}</div>
        </div>
      )}
    </div>
  )
}
export default ToroidalKmap
