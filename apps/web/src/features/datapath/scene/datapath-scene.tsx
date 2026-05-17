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
/* eslint-disable react/no-unknown-property, @eslint-react/dom/no-unknown-property */
'use client'
import { cn } from '@a/ui'
import { OrbitControls, Text } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { useMemo, useState } from 'react'
import { Vector3 } from 'three'
import type { Step } from '@/features/datapath/generated/stepTraces'
import type { ControlSignals } from '@/features/mips/types'
import { activePaths, componentsForPaths, STEPS } from '@/features/datapath/generated/stepTraces'
import { COMPONENTS, PATHS } from '@/features/datapath/generated/topology'
const ACCENT = '#22d3ee'
const SILICON = '#9aa3ad'
const SUBSTRATE = '#0b0f14'
const Box = ({
  position,
  size,
  active
}: {
  active: boolean
  position: readonly [number, number, number]
  size: readonly [number, number, number]
}) => (
  <mesh position={position}>
    <boxGeometry args={size} />
    <meshStandardMaterial
      color={active ? ACCENT : SILICON}
      emissive={active ? ACCENT : SUBSTRATE}
      emissiveIntensity={active ? 1.4 : 0}
      metalness={0.85}
      roughness={0.42}
    />
  </mesh>
)
const Wire = ({ from, to, active }: { active: boolean; from: Vector3; to: Vector3 }) => {
  const points = useMemo(() => new Float32Array([from.x, from.y, from.z, to.x, to.y, to.z]), [from, to])
  return (
    <line>
      <bufferGeometry>
        <bufferAttribute args={[points, 3]} attach='attributes-position' />
      </bufferGeometry>
      <lineBasicMaterial color={active ? ACCENT : '#33414d'} />
    </line>
  )
}
const DatapathScene = ({ name, control }: { control: ControlSignals; name: string }) => {
  const [step, setStep] = useState<Step>('EX')
  const center = useMemo(() => new Map(COMPONENTS.map(c => [c.id, new Vector3(...c.pos)])), [])
  const wires = useMemo(() => {
    const list: { from: Vector3; id: string; to: Vector3 }[] = []
    for (const p of PATHS) {
      const a = center.get(p.from)
      const b = center.get(p.to)
      if (a !== undefined && b !== undefined) list.push({ from: a, id: p.id, to: b })
    }
    return list
  }, [center])
  const activeP = useMemo(() => new Set(activePaths(control, step)), [control, step])
  const activeC = useMemo(() => new Set(componentsForPaths([...activeP])), [activeP])
  return (
    <div className='flex flex-col gap-2'>
      <div aria-label='datapath step' className='flex gap-2' role='tablist'>
        {STEPS.map(s => (
          <button
            aria-selected={s === step}
            className={cn('rounded px-3 py-1 text-sm', s === step ? 'bg-primary' : 'border')}
            key={s}
            onClick={() => setStep(s)}
            role='tab'
            type='button'>
            {s}
          </button>
        ))}
      </div>
      <div className='h-[420px] w-full overflow-hidden rounded-lg border' data-testid='datapath-canvas'>
        <Canvas camera={{ fov: 42, position: [0, 6, 18] }} frameloop='demand'>
          <color args={[SUBSTRATE]} attach='background' />
          <ambientLight intensity={0.6} />
          <directionalLight intensity={1.1} position={[6, 10, 8]} />
          {wires.map(w => (
            <Wire active={activeP.has(w.id)} from={w.from} key={w.id} to={w.to} />
          ))}
          {COMPONENTS.map(c => (
            <group key={c.id}>
              <Box active={activeC.has(c.id)} position={c.pos} size={c.size} />
              <Text
                anchorX='center'
                color={activeC.has(c.id) ? ACCENT : '#cbd5e1'}
                fontSize={0.42}
                position={[c.pos[0], c.pos[1] + c.size[1] / 2 + 0.4, c.pos[2]]}>
                {c.id}
              </Text>
            </group>
          ))}
          <OrbitControls enablePan makeDefault />
        </Canvas>
      </div>
      <p className='font-mono text-xs text-muted-foreground'>
        {name} · step {step} · {activeC.size} components / {activeP.size} paths active
      </p>
    </div>
  )
}
export default DatapathScene
