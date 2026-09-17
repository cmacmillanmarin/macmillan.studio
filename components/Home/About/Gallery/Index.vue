<template>
  <div ref="el" class="home__about__gallery">
    <Ticker
      ref="tickerEl"
      :init-zero="true"
      :planes-id="planeIds"
      @mouseenter="onMouseEnter"
      @mouseleave="onMouseLeave">
      <HomeAboutGalleryItem
        v-for="(item, i) in items"
        :pos="i + 1"
        :data="item"
        :planes-id="planeIds" />
    </Ticker>
  </div>
</template>

<script lang="ts" setup>
import { gsap } from 'gsap/gsap-core'
import { storeToRefs } from 'pinia'
import useStore from '~/store/useStore'
import type { HomepageAboutGallery } from '~/types/wordpress/homepage'
import { fadeIn, fadeOut } from '~/utils/animations'
import Ticker from '~/components/Global/Ticker.vue'

const props = defineProps<{
  data: HomepageAboutGallery
}>()

const { $three }: any = useNuxtApp()

const store = useStore()
const { updateCursor } = store
const { section, inReelHovered } = storeToRefs(store)

const el = ref<HTMLElement>()
const items = ref<HomepageAboutGallery>(sortByYear([...props.data]))
const itemsFade = ref<number>(0)
const planeIds = ref<string>(`gallery-image-${Date.now()}`)
const mouseInGallery = ref<boolean>(false)

const tickerEl = ref<typeof Ticker>()

watch(section, () => {
  if (section.value === 'about-testimonials') {
    fadeIn({ el: el.value, delay: 0.2 })
    gsap.killTweensOf(itemsFade)
    gsap.to(itemsFade, { value: 1, duration: 1, delay: 0.2, onUpdate: onItemsFadeUpdate })
  } else if (itemsFade.value === 1) {
    fadeOut({ el: el.value })
    gsap.killTweensOf(itemsFade)
    gsap.to(itemsFade, { value: 0, duration: 0.6, onUpdate: onItemsFadeUpdate })
  }
})

watch(inReelHovered, () => {
  !inReelHovered.value && updateCursor(mouseInGallery.value ? 'drag' : 'default')
})

function onItemsFadeUpdate() {
  items.value.forEach((item, i) => {
    $three.planes.update({
      id: `${planeIds.value}-${i + 1}`,
      opacity: itemsFade.value,
    })
  })
}

function onMouseEnter() {
  mouseInGallery.value = true
  if (inReelHovered.value) return
  updateCursor('drag')
}

function onMouseLeave() {
  mouseInGallery.value = false
  if (inReelHovered.value) return
  updateCursor('default')
}

function update() {
  tickerEl.value?.update()
}

function parseYear(alt: string): number {
  if (!alt) return -Infinity
  const m = alt.match(/['’](\d{2})/)
  if (!m) return -Infinity
  const yy = parseInt(m[1], 10)
  return yy < 50 ? 2000 + yy : 1900 + yy
}

function getAlt(item: HomepageAboutGallery[number]): string {
  return item.type === 'img' ? item.image.alt : item.video?.alt || ''
}

function interleaveByColumns(group: HomepageAboutGallery): HomepageAboutGallery {
  const buckets = new Map<number, HomepageAboutGallery>()
  group.forEach(item => {
    buckets.set(item.columns, [...(buckets.get(item.columns) || []), item])
  })
  const queues = [...buckets.values()]
  const out: HomepageAboutGallery = []
  while (out.length < group.length) {
    const last = out[out.length - 1]?.columns
    const candidates = queues.filter(q => q.length && q[0].columns !== last)
    const pool = candidates.length ? candidates : queues.filter(q => q.length)
    const queue = pool.sort((a, b) => b.length - a.length)[0]
    out.push(queue.shift()!)
  }
  return out
}

function spreadVideos(group: HomepageAboutGallery): HomepageAboutGallery {
  const videos = group.filter(x => x.type === 'vid')
  const images = interleaveByColumns(group.filter(x => x.type !== 'vid'))
  if (!videos.length || !images.length) return interleaveByColumns(group)
  const n = group.length
  const slots = new Set(videos.map((_, i) => Math.floor(((i + 0.5) * n) / videos.length)))
  const out: HomepageAboutGallery = []
  for (let i = 0; i < n; i++) {
    if (!slots.has(i)) {
      out.push(images.shift()!)
      continue
    }
    const last = out[out.length - 1]
    const idx = Math.max(0, videos.findIndex(v => v.columns !== last?.columns))
    out.push(videos.splice(idx, 1)[0])
  }
  return out
}

function sortByYear(arr: HomepageAboutGallery): HomepageAboutGallery {
  const pinned = arr.filter(x => x.pinned)
  const rest = arr.filter(x => !x.pinned)
  const years = [...new Set(rest.map(x => parseYear(getAlt(x))))].sort((a, b) => b - a)
  const grouped = years.flatMap(year => spreadVideos(rest.filter(x => parseYear(getAlt(x)) === year)))
  return [...pinned, ...grouped]
}

defineExpose({
  update,
})
</script>

<style lang="scss">
.home__about__gallery {
  @include will-fade;
}
</style>
