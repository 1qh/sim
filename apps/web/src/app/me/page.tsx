/* eslint-disable @eslint-react/set-state-in-effect */
'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'

const KEY = 'anon-saved-hashes'
const Page = (): React.JSX.Element => {
  const [hashes, setHashes] = useState<string[]>([])
  useEffect(() => {
    try {
      const raw = globalThis.localStorage.getItem(KEY)
      setHashes(raw ? (JSON.parse(raw) as string[]) : [])
    } catch {
      setHashes([])
    }
  }, [])
  return (
    <main aria-label='my saves' className='mx-auto flex min-h-screen max-w-2xl flex-col gap-6 p-8'>
      <h1 className='text-3xl font-bold'>My saves</h1>
      <p className='text-muted-foreground'>
        Snapshots saved on this device. Sign in to keep them across devices — anonymous saves are claimed silently on
        sign-in.
      </p>
      {hashes.length === 0 ? (
        <p className='text-muted-foreground'>No saved snapshots yet. Save any sim state to get a permalink.</p>
      ) : (
        <ul className='flex flex-col gap-1 [&>li>a]:underline'>
          {hashes.map(h => (
            <li key={h}>
              <Link href={`/s/${h}`}>/s/{h}</Link>
            </li>
          ))}
        </ul>
      )}
      <Link className='text-sm underline' href='/'>
        back
      </Link>
    </main>
  )
}
export default Page
