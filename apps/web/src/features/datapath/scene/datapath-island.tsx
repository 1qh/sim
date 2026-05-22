'use client'
import dynamic from 'next/dynamic'
import type { Step } from '@/features/datapath/generated/stepTraces'
import type { ControlSignals } from '@/features/mips/types'

const DatapathScene = dynamic(async () => import('./datapath-scene'), {
  loading: () => <div className='size-full animate-pulse bg-muted/20' />,
  ssr: false
})
const DatapathIsland = ({
  control,
  step,
  selected,
  onSelect
}: {
  control: ControlSignals
  onSelect: (id: string) => void
  selected: string | undefined
  step: Step
}) => <DatapathScene control={control} onSelect={onSelect} selected={selected} step={step} />
export default DatapathIsland
