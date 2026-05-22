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
import { ContactShadows, Environment, Lightformer, Line, OrbitControls, RoundedBox, Text } from '@react-three/drei'
import { Canvas, useFrame } from '@react-three/fiber'
import { Bloom, EffectComposer } from '@react-three/postprocessing'
import { useTheme } from 'next-themes'
import { useEffect, useMemo, useRef, useState } from 'react'
import { ACESFilmicToneMapping, Vector3 } from 'three'
import type { Step } from '@/features/datapath/generated/stepTraces'
import type { ControlSignals } from '@/features/mips/types'
import { activePaths, componentsForPaths } from '@/features/datapath/generated/stepTraces'
import { PATHS } from '@/features/datapath/generated/topology'
import { isControlPath, NODE_3D, NODES, pathPoints3D } from '@/features/datapath/scene-2d/datapath-graph'

const ACCENT = '#22d3ee'
const CRITICAL = '#f97316'
const SELECTED = '#a855f7'
const CONTROL_WIRE = '#8b5cf6'
const KIND_COLOR: Record<string, string> = {
  alu: '#ef4444',
  gate: '#eab308',
  mem: '#3b82f6',
  mux: '#22c55e'
}
const contrastOf = (hex: string): string => {
  const h = hex.replace('#', '')
  const r = Number.parseInt(h.slice(0, 2), 16)
  const g = Number.parseInt(h.slice(2, 4), 16)
  const b = Number.parseInt(h.slice(4, 6), 16)
  return 0.299 * r + 0.587 * g + 0.114 * b > 150 ? '#0b0f14' : '#f8fafc'
}
interface Palette {
  idle: string
  label: string
  substrate: string
  wire: string
}
const DARK: Palette = { idle: '#9aa3ad', label: '#cbd5e1', substrate: '#0b0f14', wire: '#6b7c8d' }
const LIGHT: Palette = { idle: '#64748b', label: '#1e293b', substrate: '#eef2f7', wire: '#94a3b8' }
const usePrefersReducedMotion = (): boolean => {
  const [reduced, setReduced] = useState(true)
  useEffect(() => {
    const m = window.matchMedia('(prefers-reduced-motion: reduce)')
    // eslint-disable-next-line @eslint-react/hooks-extra/no-direct-set-state-in-use-effect
    setReduced(m.matches)
    const onChange = (): void => setReduced(m.matches)
    m.addEventListener('change', onChange)
    return () => m.removeEventListener('change', onChange)
  }, [])
  return reduced
}
const frontZ = (kind: string, size: readonly [number, number, number]): number => {
  if (kind === 'alu') return size[0] * 0.62
  if (kind === 'mux') return size[0] * 0.6
  if (kind === 'gate') return Math.min(...size) * 0.7
  return size[2] / 2
}
const Geometry = ({ kind, size }: { kind: string; size: readonly [number, number, number] }): React.JSX.Element => {
  if (kind === 'mux') return <cylinderGeometry args={[size[0] * 0.32, size[0] * 0.6, size[1], 4]} />
  if (kind === 'alu') return <cylinderGeometry args={[size[0] * 0.62, size[0] * 0.62, size[2], 6]} />
  if (kind === 'gate') return <octahedronGeometry args={[Math.min(...size) * 0.7]} />
  return <boxGeometry args={size} />
}
const Box = ({
  position,
  size,
  active,
  critical,
  selected,
  palette,
  reduced,
  kind,
  id,
  onHover,
  onSelect
}: {
  active: boolean
  critical: boolean
  id: string
  kind: string
  onHover: (id: string | undefined) => void
  onSelect: () => void
  palette: Palette
  position: readonly [number, number, number]
  reduced: boolean
  selected: boolean
  size: readonly [number, number, number]
}): React.JSX.Element => {
  const matRef = useRef<MeshStandardMaterial>(null)
  const typeColor = KIND_COLOR[kind] ?? palette.idle
  const color = selected ? SELECTED : critical ? CRITICAL : typeColor
  const lit = selected || critical || active
  const base = selected ? 2.4 : critical ? 2.1 : active ? 1.5 : 0
  useFrame(({ clock }) => {
    if (matRef.current === null) return
    if (reduced) {
      matRef.current.emissiveIntensity = base
      return
    }
    const goal = lit ? base + Math.sin(clock.elapsedTime * 3) * 0.4 : 0
    matRef.current.emissiveIntensity += (goal - matRef.current.emissiveIntensity) * 0.12
  })
  const material = (
    <meshStandardMaterial
      color={color}
      emissive={lit ? color : palette.substrate}
      envMapIntensity={1.4}
      metalness={0.95}
      ref={matRef}
      roughness={0.22}
    />
  )
  const onOver = (e: { stopPropagation: () => void }): void => {
    e.stopPropagation()
    onHover(id)
  }
  if (kind === 'mem')
    return (
      <RoundedBox
        args={size as [number, number, number]}
        castShadow
        onPointerDown={onSelect}
        onPointerOut={() => onHover(undefined)}
        onPointerOver={onOver}
        position={position}
        radius={Math.min(...size) * 0.14}
        receiveShadow
        smoothness={4}>
        {material}
      </RoundedBox>
    )
  return (
    <mesh
      castShadow
      onPointerDown={onSelect}
      onPointerOut={() => onHover(undefined)}
      onPointerOver={onOver}
      position={position}
      receiveShadow>
      <Geometry kind={kind} size={size} />
      {material}
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
  pts,
  active,
  ctrl,
  palette,
  reduced
}: {
  active: boolean
  ctrl: boolean
  palette: Palette
  pts: Vector3[]
  reduced: boolean
}): React.JSX.Element => {
  const points = useMemo<[number, number, number][]>(() => pts.map(p => [p.x, p.y, p.z]), [pts])
  const first = pts[0]
  const last = pts.at(-1)
  const color = active ? ACCENT : ctrl ? CONTROL_WIRE : palette.wire
  const dashed = ctrl && !active
  return (
    <>
      <Line color={color} dashed={dashed} dashScale={4} lineWidth={active ? 3 : 1.6} points={points} transparent />
      {active && !reduced && first !== undefined && last !== undefined ? <Pulse from={first} to={last} /> : undefined}
    </>
  )
}
const Rig = ({ target, reduced }: { reduced: boolean; target: undefined | Vector3 }): React.JSX.Element => {
  const desired = useMemo(() => target ?? new Vector3(0, 0, 0), [target])
  useFrame(({ camera, controls }) => {
    if (controls === null || target === undefined) return
    const c = controls as unknown as { target: Vector3; update: () => void }
    c.target.lerp(desired, reduced ? 1 : 0.08)
    const camGoal = desired.clone().add(new Vector3(0, 4, 9))
    camera.position.lerp(camGoal, reduced ? 1 : 0.06)
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
  const reduced = usePrefersReducedMotion()
  const [hovered, setHovered] = useState<string | undefined>(undefined)
  const criticalSet = useMemo(() => new Set(critical), [critical])
  const center = useMemo(() => new Map(NODES.map(n => [n.id, new Vector3(...(NODE_3D[n.id]?.p ?? [0, 0, 0]))])), [])
  const wires = useMemo(() => PATHS.map(p => ({ id: p.id, pts: pathPoints3D(p.id).map(c => new Vector3(...c)) })), [])
  const activeP = useMemo(() => new Set(activePaths(control, step)), [control, step])
  const activeC = useMemo(() => new Set(componentsForPaths([...activeP])), [activeP])
  const target = selected === undefined ? undefined : center.get(selected)
  return (
    <div className='size-full' data-testid='datapath-canvas'>
      <Canvas
        camera={{ fov: 42, position: [0, 6, 18] }}
        dpr={[1, 2]}
        gl={{ antialias: true, toneMapping: ACESFilmicToneMapping, toneMappingExposure: 1.1 }}
        shadows>
        <color args={[palette.substrate]} attach='background' />
        <fog args={[palette.substrate, 22, 48]} attach='fog' />
        <hemisphereLight groundColor={palette.substrate} intensity={0.35} />
        <ambientLight intensity={0.25} />
        <directionalLight
          castShadow
          intensity={1.6}
          position={[8, 14, 8]}
          shadow-bias={-0.0004}
          shadow-mapSize={[2048, 2048]}>
          <orthographicCamera args={[-18, 18, 18, -18, 0.1, 60]} attach='shadow-camera' />
        </directionalLight>
        <directionalLight intensity={0.4} position={[-10, 4, -6]} />
        <Environment resolution={256}>
          <Lightformer
            color='#bcd4ff'
            form='rect'
            intensity={3}
            position={[0, 6, -6]}
            rotation={[0.3, 0, 0]}
            scale={[14, 6, 1]}
          />
          <Lightformer
            color='#ffffff'
            form='rect'
            intensity={2}
            position={[-8, 4, 4]}
            rotation={[0, 1, 0]}
            scale={[8, 5, 1]}
          />
          <Lightformer
            color='#ffd9a8'
            form='rect'
            intensity={1.4}
            position={[8, 3, 6]}
            rotation={[0, -1, 0]}
            scale={[8, 4, 1]}
          />
        </Environment>
        <ContactShadows blur={2.6} far={20} opacity={0.55} position={[0, -3, 0]} resolution={1024} scale={48} />
        {wires.map(w => (
          <Wire
            active={activeP.has(w.id)}
            ctrl={isControlPath(w.id)}
            key={w.id}
            palette={palette}
            pts={w.pts}
            reduced={reduced}
          />
        ))}
        {NODES.map(c => {
          const isCritical = showCritical && criticalSet.has(c.id)
          const isActive = activeC.has(c.id)
          const isSelected = selected === c.id
          const isHovered = hovered === c.id
          const lit = isSelected || isCritical || isActive
          const k = c.kind
          const boxColor = isSelected ? SELECTED : isCritical ? CRITICAL : (KIND_COLOR[k] ?? palette.idle)
          const labelColor = contrastOf(boxColor)
          const n3 = NODE_3D[c.id] ?? {
            p: [0, 0, 0] as [number, number, number],
            s: [1, 1, 1] as [number, number, number]
          }
          return (
            <group key={c.id}>
              <Box
                active={isActive}
                critical={isCritical}
                id={c.id}
                kind={k}
                onHover={setHovered}
                onSelect={() => onSelect(c.id)}
                palette={palette}
                position={n3.p}
                reduced={reduced}
                selected={isSelected}
                size={n3.s}
              />
              {lit || isHovered ? (
                <Text
                  anchorX='center'
                  anchorY='middle'
                  color={labelColor}
                  fontSize={Math.min(0.42, (n3.s[0] * 1.4) / c.label.length)}
                  maxWidth={n3.s[0] * 0.96}
                  outlineColor={boxColor}
                  outlineWidth={0.015}
                  position={[n3.p[0], n3.p[1], n3.p[2] + frontZ(k, n3.s) + 0.04]}>
                  {c.label}
                </Text>
              ) : undefined}
            </group>
          )
        })}
        <Rig reduced={reduced} target={target} />
        <EffectComposer>
          <Bloom intensity={0.7} luminanceSmoothing={0.3} luminanceThreshold={0.55} mipmapBlur />
        </EffectComposer>
      </Canvas>
    </div>
  )
}
export default DatapathScene
