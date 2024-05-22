<template>
  <div v-if="data" class="home">
    <CustomHead :head="data.head" />

    <HomeHero data-scroll data-scroll-continuous :data="data.hero" />

    <!-- <Projects data-scroll /> -->

    <Services data-scroll :data="data.services" />

    <About data-scroll :data="data.about" />

    <Footer data-scroll />
  </div>
</template>

<script lang="ts" setup>
import type { Data } from '~/types/data'

const { data } = await useFetch<Data>('/api/data')

definePageMeta({
  key: 'home',
})
</script>

<style lang="scss">
.home {
  @include page;
}
</style>
