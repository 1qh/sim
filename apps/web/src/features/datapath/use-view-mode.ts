/** biome-ignore-all lint/nursery/useGlobalThis: noise */
'use client'
import { useEffect, useState } from 'react'

type View = '2d' | '3d' | 'ref'
const KEY = 'sim-datapath-view'
const VIEWS = new Set(['2d', '3d', 'ref'])
const useViewMode = (): { mounted: boolean; setView: (v: View) => void; view: View } => {
  const [view, setView] = useState<View>('2d')
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    const url = new URLSearchParams(window.location.search).get('view')
    const stored = localStorage.getItem(KEY)
    const initial =
      url !== null && VIEWS.has(url) ? (url as View) : stored !== null && VIEWS.has(stored) ? (stored as View) : '2d'
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
