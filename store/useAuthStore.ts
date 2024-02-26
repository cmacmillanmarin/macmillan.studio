import { defineStore } from 'pinia'
import type {
  State,
  User,
  SignInUser,
  AuthToken,
  AuthTokenValidate,
  Cookie,
} from '~/types/front/store/auth'
import { parseUser } from '~/types/front/store/auth'

export default defineStore('use-auth-store', {
  state: (): State => ({
    data: {
      fetched: false,
      user: undefined,
    },
  }),
  getters: {
    fetched(): boolean {
      return this.data.fetched
    },
    user(): User | undefined {
      return this.data.user
    },
  },
  actions: {
    async signInAttempt(): Promise<void> {
      console.log('signInAttempt')
      const cookie = useCookie<Cookie | undefined>('wp_session', { sameSite: true })
      const config = useRuntimeConfig()
      const { BE_AUTH_URL } = config.public
      if (cookie.value) {
        console.log('Session cookie ->', cookie.value.token)
        const fetch = await $fetch<AuthTokenValidate>(`${BE_AUTH_URL}/token/validate`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${cookie.value.token}`,
          },
        })
        if (fetch.code === 'jwt_auth_valid_token') {
          this.data.user = cookie.value.user
          console.log('signedIn', cookie.value)
        } else {
          console.log(`Not signedIn -> ${fetch.code}`)
        }
      } else {
        console.log('Session cookie not found!')
      }
      this.data.fetched = true
    },
    async signIn(user: SignInUser): Promise<boolean> {
      console.log('signIn', user)

      try {
        const cookie = useCookie<Cookie | undefined>('wp_session', { sameSite: true })
        const config = useRuntimeConfig()
        const { BE_AUTH_URL } = config.public
        const { username, password } = user
        const fetch = await $fetch<AuthToken>(`${BE_AUTH_URL}/token`, {
          method: 'POST',
          body: { username, password },
        })
        if (fetch.token) {
          this.data.user = parseUser({
            ...fetch,
          }) as User
          cookie.value = {
            token: fetch.token,
            user: { ...this.data.user },
          }
          console.log('signedIn', cookie.value)
          return true
        } else {
          console.log('Wrong credentials')
          return false
        }
      } catch (error) {
        console.log('403')
        return false
      }
    },

    signOut(): void {
      console.log('signOut')
      const cookie = useCookie<Cookie | undefined>('wp_session', { sameSite: true })
      cookie.value = undefined
      this.data.user = undefined
    },
  },
})
