'use client'
import { useEffect, useState } from 'react'

type View = '2d' | '3d' | 'ref'
const KEY = 'sim-datapath-view'
const useViewMode = (
  allowed: readonly View[] = ['2d', '3d', 'ref']
): { mounted: boolean; setView: (v: View) => void; view: View } => {
  const [view, setView] = useState<View>(allowed[0] ?? '2d')
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    const ok = (v: null | string): v is View => v !== null && (allowed as readonly string[]).includes(v)
    const url = new URLSearchParams(globalThis.location.search).get('view')
    const stored = localStorage.getItem(KEY)
    const initial = ok(url) ? url : ok(stored) ? stored : (allowed[0] ?? '2d')
    // eslint-disable-next-line @eslint-react/set-state-in-effect
    setView(initial)
    // eslint-disable-next-line @eslint-react/set-state-in-effect
    setMounted(true)
  }, [allowed])
  const set = (v: View): void => {
    if (!(allowed as readonly string[]).includes(v)) return
    setView(v)
    localStorage.setItem(KEY, v)
    const params = new URLSearchParams(globalThis.location.search)
    params.set('view', v)
    globalThis.history.replaceState(null, '', `${globalThis.location.pathname}?${params.toString()}`)
  }
  return { mounted, setView: set, view }
}
export default useViewMode
export type { View }
