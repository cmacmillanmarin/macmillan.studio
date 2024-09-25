<template>
  <div ref="el" class="home__about__gallery">
    <Ticker planes-id="gallery-image">
      <HomeAboutGalleryImage v-for="(image, i) in images" :pos="i + 1" :columns="image" />
    </Ticker>
  </div>
</template>

<script lang="ts" setup>
import { gsap } from 'gsap'
import { storeToRefs } from 'pinia'
import useStore from '~/store/useStore'
import { fadeIn, fadeOut } from '~/utils/animations'

const { $scene }: any = useNuxtApp()

const store = useStore()
const { section } = storeToRefs(store)

const el = ref<HTMLElement>()

const images = ref<Array<number>>([4, 3, 5, 6, 3, 4, 6, 4, 5, 3, 2, 4, 6, 4])
const imagesFade = ref<number>(0)

watch(section, (to, from) => {
  if (!el.value) return
  gsap.killTweensOf(imagesFade)
  if (section.value === 'about-testimonials') {
    fadeIn({ el: el.value, delay: 0.2 })
    gsap.to(imagesFade, {
      value: 1,
      duration: 1,
      delay: 0.2,
      onUpdate: () => {
        images.value.forEach((position, index) => {
          $scene.updateObject({
            id: `gallery-image-${index + 1}`,
            opacity: imagesFade.value,
          })
        })
      },
    })
  } else {
    fadeOut({ el: el.value })
    gsap.to(imagesFade, {
      value: 0,
      duration: 0.6,
      onUpdate: () => {
        images.value.forEach((position, index) => {
          $scene.updateObject({
            id: `gallery-image-${index + 1}`,
            opacity: imagesFade.value,
          })
        })
      },
    })
  }
})
</script>

<style lang="scss">
.home__about__gallery {
  @include will-fade;
}
</style>
