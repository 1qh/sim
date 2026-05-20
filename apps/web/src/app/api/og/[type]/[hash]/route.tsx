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
/** biome-ignore-all lint/nursery/noReactNativeLiteralColors: next/og ImageResponse requires inline style literals (Satori, no Tailwind) */
/* oxlint-disable unicorn/no-array-reduce, unicorn/no-immediate-mutation, unicorn/number-literal-case, unicorn/no-process-exit, import/no-duplicates, promise/param-names, @eslint-react/naming-convention/component-name, react-perf/jsx-no-new-object-as-prop */
import { ImageResponse } from 'next/og'

const GET = async (
  _req: Request,
  { params }: { params: Promise<{ hash: string; type: string }> }
): Promise<ImageResponse> => {
  const { type, hash } = await params
  return new ImageResponse(
    <div
      style={{
        alignItems: 'flex-start',
        background: '#0b0f14',
        color: '#e5e7eb',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'monospace',
        height: '100%',
        justifyContent: 'space-between',
        padding: 64,
        width: '100%'
      }}>
      <div style={{ color: '#22d3ee', display: 'flex', fontSize: 32 }}>{`sim · ${type}`}</div>
      <div style={{ display: 'flex', fontSize: 56, fontWeight: 700 }}>{`${type} snapshot`}</div>
      <div style={{ color: '#9aa3ad', display: 'flex', fontSize: 28 }}>{hash}</div>
    </div>,
    {
      headers: { 'cache-control': 'public, immutable, max-age=31536000, s-maxage=31536000' },
      height: 630,
      width: 1200
    }
  )
}
export { GET }
