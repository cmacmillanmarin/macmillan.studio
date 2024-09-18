<template>
  <div ref="el" class="home__about__gallery">
    <Ticker>
      <HomeAboutGalleryImage :pos="1" :columns="4" />
      <HomeAboutGalleryImage :pos="2" :columns="3" />
      <HomeAboutGalleryImage :pos="3" :columns="5" />
      <HomeAboutGalleryImage :pos="4" :columns="6" />
      <HomeAboutGalleryImage :pos="5" :columns="3" />
      <HomeAboutGalleryImage :pos="6" :columns="4" />
      <HomeAboutGalleryImage :pos="7" :columns="6" />
      <HomeAboutGalleryImage :pos="8" :columns="4" />
      <HomeAboutGalleryImage :pos="9" :columns="5" />
      <HomeAboutGalleryImage :pos="10" :columns="3" />
      <HomeAboutGalleryImage :pos="11" :columns="2" />
      <HomeAboutGalleryImage :pos="12" :columns="4" />
      <HomeAboutGalleryImage :pos="13" :columns="6" />
      <HomeAboutGalleryImage :pos="14" :columns="4" />
    </Ticker>
  </div>
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import useStore from '~/store/useStore'

const store = useStore()
const { section } = storeToRefs(store)

const el = ref<HTMLElement>()

watch(section, (to, from) => {
  section.value === 'about-testimonials'
    ? fadeIn({ el: el.value, delay: 0.2 })
    : fadeOut({ el: el.value })
})
</script>

<style lang="scss">
.home__about__gallery {
  @include will-fade;
}
</style>
