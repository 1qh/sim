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
import type { Mesh, MeshStandardMaterial } from 'three'
import { OrbitControls, Text } from '@react-three/drei'
import { Canvas, useFrame } from '@react-three/fiber'
import { useTheme } from 'next-themes'
import { useMemo, useRef } from 'react'
import { Vector3 } from 'three'
import type { Step } from '@/features/datapath/generated/stepTraces'
import type { ControlSignals } from '@/features/mips/types'
import { activePaths, componentsForPaths } from '@/features/datapath/generated/stepTraces'
import { COMPONENTS, PATHS } from '@/features/datapath/generated/topology'

const ACCENT = '#22d3ee'
const CRITICAL = '#f97316'
const SELECTED = '#a855f7'
interface Palette {
  idle: string
  label: string
  substrate: string
  wire: string
}
const DARK: Palette = { idle: '#9aa3ad', label: '#cbd5e1', substrate: '#0b0f14', wire: '#33414d' }
const LIGHT: Palette = { idle: '#64748b', label: '#1e293b', substrate: '#eef2f7', wire: '#b4c0cc' }
const Box = ({
  position,
  size,
  active,
  critical,
  selected,
  palette,
  onSelect
}: {
  active: boolean
  critical: boolean
  onSelect: () => void
  palette: Palette
  position: readonly [number, number, number]
  selected: boolean
  size: readonly [number, number, number]
}): React.JSX.Element => {
  const matRef = useRef<MeshStandardMaterial>(null)
  const color = selected ? SELECTED : critical ? CRITICAL : active ? ACCENT : palette.idle
  const lit = selected || critical || active
  useFrame(({ clock }) => {
    if (matRef.current === null) return
    const base = selected ? 2 : critical ? 1.8 : active ? 1.3 : 0
    matRef.current.emissiveIntensity = lit ? base + Math.sin(clock.elapsedTime * 3) * 0.35 : 0
  })
  return (
    <mesh onPointerDown={onSelect} position={position}>
      <boxGeometry args={size} />
      <meshStandardMaterial
        color={color}
        emissive={lit ? color : palette.substrate}
        metalness={0.85}
        ref={matRef}
        roughness={0.42}
      />
    </mesh>
  )
}
const Pulse = ({ from, to }: { from: Vector3; to: Vector3 }): React.JSX.Element => {
  const ref = useRef<Mesh>(null)
  useFrame(({ clock }) => {
    if (ref.current === null) return
    const f = (clock.elapsedTime * 0.7) % 1
    ref.current.position.lerpVectors(from, to, f)
  })
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.13, 8, 8]} />
      <meshBasicMaterial color={ACCENT} />
    </mesh>
  )
}
const Wire = ({
  from,
  to,
  active,
  palette
}: {
  active: boolean
  from: Vector3
  palette: Palette
  to: Vector3
}): React.JSX.Element => {
  const points = useMemo(() => new Float32Array([from.x, from.y, from.z, to.x, to.y, to.z]), [from, to])
  return (
    <>
      <line>
        <bufferGeometry>
          <bufferAttribute args={[points, 3]} attach='attributes-position' />
        </bufferGeometry>
        <lineBasicMaterial color={active ? ACCENT : palette.wire} />
      </line>
      {active ? <Pulse from={from} to={to} /> : undefined}
    </>
  )
}
const Rig = ({ target }: { target: undefined | Vector3 }): React.JSX.Element => {
  const desired = useMemo(() => target ?? new Vector3(0, 0, 0), [target])
  useFrame(({ camera, controls }) => {
    if (controls === null || target === undefined) return
    const c = controls as unknown as { target: Vector3; update: () => void }
    c.target.lerp(desired, 0.08)
    const camGoal = desired.clone().add(new Vector3(0, 4, 9))
    camera.position.lerp(camGoal, 0.06)
    c.update()
  })
  return <OrbitControls enablePan makeDefault />
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
}): React.JSX.Element => {
  const { resolvedTheme } = useTheme()
  const palette = resolvedTheme === 'light' ? LIGHT : DARK
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
  const target = selected === undefined ? undefined : center.get(selected)
  return (
    <div className='size-full' data-testid='datapath-canvas'>
      <Canvas camera={{ fov: 42, position: [0, 6, 18] }}>
        <color args={[palette.substrate]} attach='background' />
        <ambientLight intensity={0.6} />
        <directionalLight intensity={1.1} position={[6, 10, 8]} />
        {wires.map(w => (
          <Wire active={activeP.has(w.id)} from={w.from} key={w.id} palette={palette} to={w.to} />
        ))}
        {COMPONENTS.map(c => {
          const isCritical = showCritical && criticalSet.has(c.id)
          const isActive = activeC.has(c.id)
          const isSelected = selected === c.id
          const lit = isSelected || isCritical || isActive
          const labelColor = isSelected ? SELECTED : isCritical ? CRITICAL : ACCENT
          return (
            <group key={c.id}>
              <Box
                active={isActive}
                critical={isCritical}
                onSelect={() => onSelect(c.id)}
                palette={palette}
                position={c.pos}
                selected={isSelected}
                size={c.size}
              />
              {lit ? (
                <Text
                  anchorX='center'
                  color={labelColor}
                  fontSize={0.5}
                  outlineColor={palette.substrate}
                  outlineWidth={0.04}
                  position={[c.pos[0], c.pos[1] + c.size[1] / 2 + 0.4, c.pos[2]]}>
                  {c.id}
                </Text>
              ) : undefined}
            </group>
          )
        })}
        <Rig target={target} />
      </Canvas>
    </div>
  )
}
export default DatapathScene
