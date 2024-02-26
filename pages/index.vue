<template>
  <div class="c-page c-page--home" v-transition:out="{ callback: fadeOut, duration: 0.4 }">
    <template v-if="data">
      <CustomHead :seo="data.seo" />

      <h1 class="t-h1">MACMILLAN STUDIO</h1>
      <h2 class="t-h2">Delivering unique digital experiences implemented from the ground up.</h2>
      <h3 class="t-h3">Independent Development Studio</h3>

      Subpageeeee

      <!-- <HomeLanding data-scroll :data="data.landing" /> -->
      <!-- <ProjectCarousel
        id="project-carousel-target"
        data-scroll
        data-scroll-target-top
        :data="data.introduction" /> -->

      <!-- <Footer data-scroll /> -->
    </template>
  </div>
</template>

<script lang="ts" setup>
import useStore from '~/store/useStore'
import type { Homepage } from '~/types/wordpress/homepage'
import { fadeOut } from '~/utils/animations'
import pageTransition from '~/utils/page-transition'

const { data } = await useFetch<Homepage>('/api/wordpress/homepage')

const store = useStore()

onMounted((): void => {
  store.updateLoading(false)
})

onBeforeRouteLeave((to, from): void => {
  store.updateLoading(true)
  store.updateRouteFromTo(to.fullPath)
  store.updateRouteFrom(from.fullPath)
})

definePageMeta({
  key: 'homepage',
  pageTransition,
})
</script>

<style lang="scss">
.c-page {
  &--home {
    padding: 0.8rem;
  }
}
</style>
