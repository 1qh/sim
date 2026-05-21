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
'use client'
import type { Step } from '@/features/datapath/generated/stepTraces'
import type { View } from '@/features/datapath/use-view-mode'
import type { ControlSignals } from '@/features/mips/types'
import Datapath2D from '@/features/datapath/scene-2d/datapath-2d'
import DatapathIsland from '@/features/datapath/scene/datapath-island'

const DatapathCanvas = ({
  view,
  mounted,
  control,
  critical,
  step,
  showCritical,
  selected,
  values,
  onSelect
}: {
  control: ControlSignals
  critical: readonly string[]
  mounted: boolean
  onSelect: (id: string) => void
  selected: string | undefined
  showCritical: boolean
  step: Step
  values: Record<string, string>
  view: View
}): React.JSX.Element => {
  if (!mounted) return <div className='size-full' data-testid='datapath-canvas' />
  if (view === '2d')
    return (
      <Datapath2D
        control={control}
        critical={critical}
        onSelect={onSelect}
        selected={selected}
        showCritical={showCritical}
        step={step}
        values={values}
      />
    )
  return (
    <DatapathIsland
      control={control}
      critical={critical}
      onSelect={onSelect}
      selected={selected}
      showCritical={showCritical}
      step={step}
    />
  )
}
export default DatapathCanvas
