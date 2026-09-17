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

function sortByYear(arr: HomepageAboutGallery): HomepageAboutGallery {
  const pinned = arr.filter(x => x.pinned)
  const rest = arr.filter(x => !x.pinned).sort((a, b) => {
    const yearDiff = parseYear(getAlt(b)) - parseYear(getAlt(a))
    if (yearDiff !== 0) return yearDiff
    return a.columns - b.columns
  })
  return [...pinned, ...rest]
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
