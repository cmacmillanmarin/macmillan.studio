<template>
  <Head>
    <Title>{{ head.title }}</Title>
    <Meta name="description" :content="head.description" />
    <Link rel="canonical" :href="canonical" />

    <Meta name="theme-color" content="#d3d6da" />

    <Meta name="og:title" :content="head.title" />
    <Meta name="og:description" :content="head.description" />
    <Meta name="og:url" :content="canonical" />
    <Meta name="og:image" :content="head.og_image" />
    <Meta name="og:type" content="website" />

    <Meta name="twitter:card" content="summary_large_image" />
    <Meta name="twitter:title" :content="head.title" />
    <Meta name="twitter:description" :content="head.description" />
    <Meta name="twitter:image" :content="head.tw_image" />
    <Meta name="twitter:url" :content="canonical" />

    <Link rel="icon" type="image/x-icon" href="/assets/img/favicon.ico" />
    <Link rel="apple-touch-icon" href="/assets/img/apple-touch-icon.png" />

    <Meta http-equiv="x-ua-compatible" content="ie=edge" />
  </Head>
</template>

<script lang="ts" setup>
import type { Head } from '~/types/wordpress'

const props = defineProps<{
  head: Head
}>()

const config = useRuntimeConfig()
const { FE_BASE_URL } = config.public

const route = useRoute()
const canonical = computed(() => `${FE_BASE_URL}${route.fullPath !== '/' ? route.fullPath : ''}`)

useHead({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: 'MacMillan Studio',
        description: props.head.description,
        logo: '/assets/img/logo.jpg',
        url: canonical.value,
        sameAs: [
          'https://www.instagram.com/cmacmillanmarin',
          'https://www.linkedin.com/in/cmacmillanmarin',
          'https://twitter.com/cmacmillanmarin',
        ],
      }),
    },
  ],
})
</script>
