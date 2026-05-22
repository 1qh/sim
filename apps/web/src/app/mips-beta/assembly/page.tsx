import type { View } from '@/features/datapath/use-view-mode'
import AssemblyView from '@/features/datapath/assembly-view'

const BETA: readonly View[] = ['2d', '3d']
const Page = (): React.JSX.Element => <AssemblyView base='/mips-beta' views={BETA} />
export default Page
