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
import { OrbitControls, Text } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { useMemo } from 'react'
import { Vector3 } from 'three'
import type { Step } from '@/features/datapath/generated/stepTraces'
import type { ControlSignals } from '@/features/mips/types'
import { activePaths, componentsForPaths } from '@/features/datapath/generated/stepTraces'
import { COMPONENTS, PATHS } from '@/features/datapath/generated/topology'

const ACCENT = '#22d3ee'
const CRITICAL = '#f97316'
const SILICON = '#9aa3ad'
const SUBSTRATE = '#0b0f14'
const SELECTED = '#a855f7'
const Box = ({
  position,
  size,
  active,
  critical,
  selected,
  onSelect
}: {
  active: boolean
  critical: boolean
  onSelect: () => void
  position: readonly [number, number, number]
  selected: boolean
  size: readonly [number, number, number]
}) => {
  const color = selected ? SELECTED : critical ? CRITICAL : active ? ACCENT : SILICON
  return (
    <mesh onPointerDown={onSelect} position={position}>
      <boxGeometry args={size} />
      <meshStandardMaterial
        color={color}
        emissive={selected || critical || active ? color : SUBSTRATE}
        emissiveIntensity={selected ? 2 : critical ? 1.8 : active ? 1.4 : 0}
        metalness={0.85}
        roughness={0.42}
      />
    </mesh>
  )
}
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
const DatapathScene = ({
  control,
  critical,
  step,
  showCritical,
  selected,
  onSelect
}: {
  control: ControlSignals
  critical: readonly string[]
  onSelect: (id: string) => void
  selected: string | undefined
  showCritical: boolean
  step: Step
}) => {
  const criticalSet = useMemo(() => new Set(critical), [critical])
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
    <div className='size-full' data-testid='datapath-canvas'>
      <Canvas camera={{ fov: 42, position: [0, 6, 18] }}>
        <color args={[SUBSTRATE]} attach='background' />
        <ambientLight intensity={0.6} />
        <directionalLight intensity={1.1} position={[6, 10, 8]} />
        {wires.map(w => (
          <Wire active={activeP.has(w.id)} from={w.from} key={w.id} to={w.to} />
        ))}
        {COMPONENTS.map(c => {
          const isCritical = showCritical && criticalSet.has(c.id)
          const isActive = activeC.has(c.id)
          const isSelected = selected === c.id
          const labelColor = isSelected ? SELECTED : isCritical ? CRITICAL : isActive ? ACCENT : '#cbd5e1'
          return (
            <group key={c.id}>
              <Box
                active={isActive}
                critical={isCritical}
                onSelect={() => onSelect(c.id)}
                position={c.pos}
                selected={isSelected}
                size={c.size}
              />
              <Text
                anchorX='center'
                color={labelColor}
                fontSize={0.42}
                position={[c.pos[0], c.pos[1] + c.size[1] / 2 + 0.4, c.pos[2]]}>
                {c.id}
              </Text>
            </group>
          )
        })}
        <OrbitControls enablePan makeDefault />
      </Canvas>
    </div>
  )
}
export default DatapathScene
