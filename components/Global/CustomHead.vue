<template>
  <Head>
    <Title>{{ head.title }}</Title>
    <Link rel="canonical" :href="canonical" />
    <Meta name="og:url" :content="canonical" />
  </Head>
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import useStore from '~/store/useStore'
import type { Head } from '~/types/wordpress'

defineProps<{
  head: Head
}>()

const config = useRuntimeConfig()
const { FE_BASE_URL } = config.public

const route = useRoute()
const canonical = computed(() => `${FE_BASE_URL}${route.fullPath !== '/' ? route.fullPath : ''}`)

const store = useStore()
const { isPreloaded } = storeToRefs(store)

onMounted((): void => {
  isPreloaded.value && store.updateLoading(false)
})
</script>
