<template>
  <div class="c-page c-page--user" v-transition:out="{ callback: fadeOut, duration: 0.2 }">
    <template v-if="user">
      <CustomHead
        :seo="{
          title: user.name,
          description: '',
          modified: '',
          og_image: '',
          tw_image: '',
        }" />

      <div
        class="c-page--user__landing grid will-fade"
        data-scroll
        v-transition:in="{ callback: fadeIn }">
        <div class="grid__col-8--mobile grid__col-8--tablet grid__col-24--desktop">
          <pre class="t-b1 t-burgundy">{{ user }}</pre>
          <!-- <CustomButton label="Sign out" @click="signOut" /> -->
        </div>
      </div>
    </template>
  </div>
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import useStore from '~/store/useStore'
import useAuthStore from '~/store/useAuthStore'
import { fadeIn, fadeOut } from '~/utils/animations'
import pageTransition from '~/utils/page-transition'

const store = useStore()
const authStore = useAuthStore()
const { user } = storeToRefs(authStore)

const router = useRouter()

onMounted((): void => {
  store.updateLoading(false)
})

function signOut(): void {
  authStore.signOut()
  router.push('/sign-in')
}

onBeforeRouteLeave((to, from): void => {
  store.updateLoading(true)
  store.updateRouteFromTo(to.fullPath)
  store.updateRouteFrom(from.fullPath)
})

definePageMeta({
  key: 'user',
  pageTransition,
})
</script>

<style lang="scss">
.c-page--user {
  padding-top: calc(var(--menu-height) + var(--layout-indent) * 3);
  &__landing {
    padding-bottom: 20rem;
    .t-b2 {
      margin-bottom: var(--l);
    }
  }
}
</style>
