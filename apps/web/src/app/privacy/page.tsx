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
import Link from 'next/link'
const Page = (): React.JSX.Element => (
  <main aria-label='privacy policy' className='mx-auto flex min-h-screen max-w-2xl flex-col gap-6 p-8'>
    <h1 className='text-3xl font-bold'>Privacy</h1>
    <p>
      Anonymous by default: nothing identifying is collected. Snapshots you save are stored under a content-addressed hash;
      your browser keeps that hash list locally so you can find them again on this device.
    </p>
    <p>
      If you sign in, only your email and display name from Google sign-in are stored, solely to list your saves across
      devices. Aggregate page-view counts use self-hosted, cookieless analytics that respect Do Not Track and Global
      Privacy Control.
    </p>
    <h2 className='text-xl font-semibold'>What we never do</h2>
    <ul className='list-disc pl-6 [&>li]:py-1'>
      <li>No tracking cookies, no third-party analytics, no advertising, no retargeting.</li>
      <li>No selling data, no session recording, no cross-site tracking, no email or notification spam.</li>
    </ul>
    <p>
      Snapshots are public to anyone with the permalink — don&apos;t put personal information in snapshot content. You can
      sign out, delete your account, or export your saved snapshots at any time.
    </p>
    <Link className='text-sm underline' href='/'>
      back
    </Link>
  </main>
)
export default Page
