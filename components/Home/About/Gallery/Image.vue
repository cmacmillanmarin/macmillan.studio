<template>
  <div ref="el" class="home__about__gallery__image">
    <div
      class="home__about__gallery__image__content"
      @mouseenter="onMouseEnter"
      @mouseleave="onMouseLeave">
      <img
        ref="imgEl"
        src="/assets/img/thumbnail.jpg"
        alt="thumbnail"
        loading="lazy"
        @load="onImageLoaded" />
    </div>
    <div ref="creditsEl" class="home__about__gallery__image__credits">🇲🇽 Shot on iPhone 13</div>
  </div>
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import useScrollStore from '~/store/useScrollStore'
import { shuffleElsIn, fadeOut } from '~/utils/animations'

const props = defineProps<{
  pos: number
  columns: number
}>()

const { $scene }: any = useNuxtApp()
const { scrollUpdated } = storeToRefs(useScrollStore())
const { toScale } = useCss()

const width = ref<number>(0)
const height = ref<number>(0)
const loaded = ref<boolean>(false)

const el = ref<HTMLElement>()
const imgEl = ref<HTMLImageElement>()
const creditsEl = ref<HTMLElement>()

watch(scrollUpdated, () => {
  if (imgEl.value && loaded.value) {
    width.value = imgEl.value.clientWidth
    height.value = imgEl.value.clientHeight
    $scene.updateObject({
      id: `gallery-image-${props.pos}`,
      size: { x: width.value, y: height.value, z: 1 },
    })
  }
})

function onImageLoaded() {
  if (!imgEl.value) return
  width.value = imgEl.value.clientWidth
  height.value = imgEl.value.clientHeight
  $scene.addObject({
    id: `gallery-image-${props.pos}`,
    type: 'plane',
    img: imgEl.value,
    position: { x: -1000, y: -1000 },
    size: { x: width.value, y: height.value, z: 1 },
    border: toScale(16),
    opacity: 0,
  })
  loaded.value = true
}

function onMouseEnter() {
  if (!creditsEl.value) return
  shuffleElsIn({ els: [creditsEl.value] })
}

function onMouseLeave() {
  if (!creditsEl.value) return
  fadeOut({ el: creditsEl.value })
}

onBeforeUnmount(() => {
  $scene.removeObject(`gallery-image-${props.pos}`)
})
</script>

<style lang="scss">
.home__about__gallery__image {
  padding-right: var(--layout-gutter);

  &__content {
    width: toColumns(v-bind(columns));
    aspect-ratio: 1;
    // background-color: var(--light-grey);
    border-radius: toScale(1.6rem);
    pointer-events: auto;

    img {
      width: 100%;
      pointer-events: none;
      opacity: 0;
    }
  }

  &__credits {
    padding: toScale(1.2rem);
    @include will-fade;
    @include t-b2;
  }
}
</style>
