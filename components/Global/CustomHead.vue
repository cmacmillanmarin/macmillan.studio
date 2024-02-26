<template>
  <Head>
    <Title>{{ seo.title }}</Title>
    <Meta name="description" :content="seo.description" />
    <Meta name="article:publisher" content="https://www.facebook.com/MortgageExpertInc/" />
    <Meta name="article:modified_time" :content="seo.modified" />
    <Meta name="og:locale" content="en_US" />
    <Meta name="og:title" :content="seo.title" />
    <Meta name="og:description" :content="seo.description" />
    <Meta name="og:type" content="website" />
    <Meta name="og:url" :content="FE_BASE_URL + route.fullPath" />
    <Meta name="og:image" :content="seo.og_image" />
    <Meta name="twitter:card" content="summary" />
    <Meta name="twitter:site" content="@mtgeexpertinc" />
    <Meta name="twitter:title" :content="seo.title" />
    <Meta name="twitter:description" :content="seo.description" />
    <Meta name="twitter:image" :content="seo.tw_image" />
  </Head>
</template>

<script lang="ts" setup>
import type { SEO } from '~/types/wordpress'

defineProps<{
  seo: SEO
}>()

const config = useRuntimeConfig()
const { FE_BASE_URL } = config.public

const route = useRoute()
</script>
