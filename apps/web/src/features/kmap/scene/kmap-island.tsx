'use client'
import dynamic from 'next/dynamic'

const ToroidalKmap = dynamic(async () => import('./toroidal-kmap'), {
  loading: () => <div className='h-[420px] w-full animate-pulse rounded-lg border bg-muted/30' />,
  ssr: false
})
const KmapIsland = ({ vars, truthTable }: { truthTable: readonly (0 | 1 | 'X')[]; vars: number }) => (
  <ToroidalKmap truthTable={truthTable} vars={vars} />
)
export default KmapIsland
