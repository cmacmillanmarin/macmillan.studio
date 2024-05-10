<template>
  <div v-if="data" class="page page--home">
    <CustomHead :head="data.head" />

    <Landing data-scroll data-scroll-continuous :data="data.landing" />

    <Services data-scroll :data="data.services" />

    <About data-scroll />

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
.page--home {
  @include page;
}
</style>
