/** biome-ignore-all lint/style/noProcessEnv: Convex env read at runtime */
import Google from '@auth/core/providers/google'
import { Anonymous } from '@convex-dev/auth/providers/Anonymous'
import { convexAuth } from '@convex-dev/auth/server'
const { auth, isAuthenticated, signIn, signOut, store } = convexAuth({
  providers: [Google, Anonymous]
})
export { auth, isAuthenticated, signIn, signOut, store }
