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
import { cn } from '@a/ui'
import type { View } from '@/features/datapath/use-view-mode'

const ViewToggle = ({ view, setView }: { setView: (v: View) => void; view: View }): React.JSX.Element => (
  <div className='flex overflow-hidden rounded-lg border text-sm [&>button]:px-3 [&>button]:py-1'>
    <button
      className={cn(view === '2d' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted')}
      onClick={() => setView('2d')}
      type='button'>
      2D
    </button>
    <button
      className={cn(view === '3d' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted')}
      onClick={() => setView('3d')}
      type='button'>
      3D
    </button>
    <button
      className={cn(view === 'ref' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted')}
      onClick={() => setView('ref')}
      type='button'>
      REF 2D
    </button>
  </div>
)
export default ViewToggle
