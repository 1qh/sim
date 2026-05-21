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
import { useEffect, useState } from 'react'

type View = '2d' | '3d'
const KEY = 'sim-datapath-view'
const useViewMode = (): { mounted: boolean; setView: (v: View) => void; view: View } => {
  const [view, setView] = useState<View>('2d')
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    const url = new URLSearchParams(window.location.search).get('view')
    const stored = localStorage.getItem(KEY)
    const initial = url === '3d' || url === '2d' ? url : stored === '3d' ? '3d' : '2d'
    // eslint-disable-next-line @eslint-react/hooks-extra/no-direct-set-state-in-use-effect
    setView(initial)
    // eslint-disable-next-line @eslint-react/hooks-extra/no-direct-set-state-in-use-effect
    setMounted(true)
  }, [])
  const set = (v: View): void => {
    setView(v)
    localStorage.setItem(KEY, v)
    const params = new URLSearchParams(window.location.search)
    params.set('view', v)
    window.history.replaceState(null, '', `${window.location.pathname}?${params.toString()}`)
  }
  return { mounted, setView: set, view }
}
export default useViewMode
export type { View }
