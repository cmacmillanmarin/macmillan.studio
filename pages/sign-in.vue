<template>
  <div class="c-page c-page--sign-in" v-transition:out="{ callback: fadeOut, duration: 0.2 }">
    <ClientOnly>
      <CustomHead
        :seo="{
          title: 'Sign In',
          description: '',
          modified: '',
          og_image: '',
          tw_image: '',
        }" />

      <div
        class="c-page--sign-in__landing grid will-fade"
        data-scroll
        v-transition:in="{ callback: fadeIn }">
        <div class="grid__col-8--mobile grid__col-8--tablet grid__col-8--desktop">
          <p v-if="!fetched" class="t-b2">Loading</p>
          <AuthSignIn v-else @signed-in="signedIn" />
          <p v-if="user" class="t-b3 will-fade" v-transition:in="{ callback: fadeIn }">
            You're signed in as {{ user.username }}, check your account
            <NuxtLink to="/user" class="t-b3 t-burgundy--dark">here</NuxtLink>.
          </p>
        </div>
      </div>
    </ClientOnly>
  </div>
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import useStore from '~/store/useStore'
import useAuthStore from '~/store/useAuthStore'
import { fadeIn, fadeOut } from '~/utils/animations'
import pageTransition from '~/utils/page-transition'

const store = useStore()
const { fetched, user } = storeToRefs(useAuthStore())

const route = useRoute()
const router = useRouter()

onMounted((): void => {
  store.updateLoading(false)
})

function signedIn(): void {
  const config = useRuntimeConfig()
  const { IS_PASSWORD_PROTECTED } = config.public
  IS_PASSWORD_PROTECTED && router.push(route.query.to?.toString() || '/')
}

onBeforeRouteLeave((to, from): void => {
  store.updateLoading(true)
  store.updateRouteFromTo(to.fullPath)
  store.updateRouteFrom(from.fullPath)
})

definePageMeta({
  key: 'sign-in',
  pageTransition,
})
</script>

<style lang="scss">
.c-page--sign-in {
  &__landing {
    padding-top: calc(var(--menu-height) + var(--layout-indent) * 3);
    justify-content: center;
    padding-bottom: 20rem;
    a {
      font-weight: bold;
    }
  }
}
</style>
