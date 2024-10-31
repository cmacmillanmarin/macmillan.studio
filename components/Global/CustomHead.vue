<template>
  <Head>
    <Title>{{ head.title }}</Title>
    <Link rel="canonical" :href="canonical" />
    <Meta name="description" :content="head.description" />
    <Meta name="og:url" :content="canonical" />
  </Head>
</template>

<script lang="ts" setup>
import type { Head } from '~/types/wordpress'

defineProps<{
  head: Head
}>()

const config = useRuntimeConfig()
const { FE_BASE_URL } = config.public

const route = useRoute()
const canonical = computed(() => `${FE_BASE_URL}${route.fullPath !== '/' ? route.fullPath : ''}`)
</script>
