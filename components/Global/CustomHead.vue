<template>
  <Head>
    <Title>{{ head.title }}</Title>
    <Meta name="description" :content="head.description" />
    <Link rel="canonical" :href="canonical" />

    <Meta name="theme-color" content="#d3d6da" />

    <Meta property="og:title" :content="head.title" />
    <Meta property="og:description" :content="head.description" />
    <Meta property="og:url" :content="canonical" />
    <Meta property="og:image" :content="head.og_image" />
    <Meta property="og:type" :content="ogType" />
    <Meta property="og:site_name" content="MacMillan Studio" />
    <template v-if="ogType === 'article'">
      <Meta property="article:author" content="Christian MacMillan" />
    </template>

    <Meta name="twitter:card" content="summary_large_image" />
    <Meta name="twitter:title" :content="head.title" />
    <Meta name="twitter:description" :content="head.description" />
    <Meta name="twitter:image" :content="head.tw_image" />
    <Meta name="twitter:url" :content="canonical" />
    <Meta name="twitter:creator" content="@cmacmillanmarin" />

    <Link rel="icon" type="image/x-icon" href="/assets/img/favicon.ico" />
    <Link rel="apple-touch-icon" href="/assets/img/apple-touch-icon.png" />

    <Meta http-equiv="x-ua-compatible" content="ie=edge" />
  </Head>
</template>

<script lang="ts" setup>
import type { Head } from '~/types/wordpress'
import type { Project } from '~/types/wordpress/project'

const props = withDefaults(
  defineProps<{
    head: Head
    type?: 'website' | 'article'
    project?: Project
  }>(),
  {
    type: 'website',
    project: undefined,
  }
)

const config = useRuntimeConfig()
const { FE_BASE_URL } = config.public

const route = useRoute()
const canonical = computed(() => `${FE_BASE_URL}${route.fullPath !== '/' ? route.fullPath : ''}`)

const ogType = computed(() => (props.project ? 'article' : props.type))

const socialLinks = [
  'https://www.instagram.com/cmacmillanmarin',
  'https://www.linkedin.com/in/cmacmillanmarin',
  'https://twitter.com/cmacmillanmarin',
]

const jsonLd = computed(() => {
  const person = {
    '@type': 'Person',
    '@id': `${FE_BASE_URL}/#christian`,
    name: 'Christian MacMillan',
    jobTitle: 'Independent Tech Lead & Creative Developer',
    url: FE_BASE_URL,
    email: 'christian@macmillan.studio',
    sameAs: socialLinks,
  }

  const organization = {
    '@type': 'Organization',
    '@id': `${FE_BASE_URL}/#organization`,
    name: 'MacMillan Studio',
    url: FE_BASE_URL,
    logo: `${FE_BASE_URL}/assets/img/logo.jpg`,
    founder: { '@id': `${FE_BASE_URL}/#christian` },
    sameAs: socialLinks,
  }

  const graph: Array<Record<string, unknown>> = [person, organization]

  if (props.project) {
    const project = props.project
    graph.push({
      '@type': 'CreativeWork',
      '@id': `${canonical.value}#creative-work`,
      name: project.title,
      headline: project.title,
      description: project.head.description || stripHtml(project.description),
      image: project.head.og_image,
      url: canonical.value,
      creator: { '@id': `${FE_BASE_URL}/#christian` },
      publisher: { '@id': `${FE_BASE_URL}/#organization` },
      keywords: project.services.join(', '),
      ...(project.client?.name
        ? { sourceOrganization: { '@type': 'Organization', name: project.client.name } }
        : {}),
    })
    graph.push({
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: FE_BASE_URL },
        { '@type': 'ListItem', position: 2, name: project.title, item: canonical.value },
      ],
    })
  } else {
    graph.push({
      '@type': 'WebPage',
      '@id': `${canonical.value}#webpage`,
      name: props.head.title,
      description: props.head.description,
      url: canonical.value,
      isPartOf: { '@id': `${FE_BASE_URL}/#organization` },
      about: { '@id': `${FE_BASE_URL}/#christian` },
    })
  }

  return { '@context': 'https://schema.org', '@graph': graph }
})

function stripHtml(input: string): string {
  return (input || '').replace(/<[^>]+>/g, '').trim()
}

useHead(() => ({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify(jsonLd.value),
    },
  ],
}))
</script>
