<template>
  <div v-if="data" class="page page--home">
    <CustomHead :head="data.head" />

    <Landing data-scroll />

    <Footer data-scroll />
  </div>
</template>

<script lang="ts" setup>
import type { Data } from '~/types/strapi'

const { data } = await useFetch<Data>('/api/data')

definePageMeta({
  key: 'home',
})
</script>

<style lang="scss">
.page--home {
  @include page;
  > div {
    @include t-b1;
    @include will-fade;
  }
}
</style>
