import { storeToRefs } from 'pinia'
import useAuthStore from '~/store/useAuthStore'

export default defineNuxtRouteMiddleware(async (to, from) => {
  const config = useRuntimeConfig()
  const { IS_PASSWORD_PROTECTED, IS_DEV } = config.public
  if (!process.server && (IS_PASSWORD_PROTECTED || IS_DEV)) {
    const authStore = useAuthStore()
    const { signInAttempt } = authStore
    const { fetched, user } = storeToRefs(authStore)

    if (!fetched.value) {
      await signInAttempt()
    }

    if (
      (IS_PASSWORD_PROTECTED && !user.value && to.path !== '/sign-in') ||
      (!user.value && to.path === '/user')
    )
      return navigateTo(`/sign-in?to=${to.fullPath}`)
  }
})
