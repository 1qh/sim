'use client'
import type { Step } from '@/features/datapath/generated/stepTraces'
import type { View } from '@/features/datapath/use-view-mode'
import type { ControlSignals } from '@/features/mips/types'
import RefDatapath2D from '@/features/datapath/ref-demo/ref-datapath-2d'
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
  word,
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
  word: number
}): React.JSX.Element => {
  if (!mounted) return <div className='size-full' data-testid='datapath-canvas' />
  if (view === 'ref') return <RefDatapath2D control={control} step={step} word={word} />
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
        word={word}
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
