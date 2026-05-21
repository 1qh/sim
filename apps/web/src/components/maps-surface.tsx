import type { ReactNode } from 'react'
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
import { cn } from '@a/ui'

const PANEL = 'rounded-xl border bg-background/80 shadow-lg backdrop-blur-md'
const MapsSurface = ({
  label,
  info,
  children
}: {
  children: ReactNode
  info?: ReactNode
  label: string
}): React.JSX.Element => (
  <div className='fixed inset-0'>
    <div className='size-full'>{children}</div>
    <div className={cn('absolute top-4 left-16 px-3 py-1.5 font-mono text-sm', PANEL)}>{label}</div>
    {info === undefined ? undefined : (
      <div className={cn('absolute top-4 right-4 flex max-w-80 flex-col gap-1 p-3 font-mono text-xs', PANEL)}>{info}</div>
    )}
  </div>
)
export default MapsSurface
export { PANEL }
