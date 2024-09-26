<template>
  <div ref="el" class="home__about__gallery__item">
    <div
      class="home__about__gallery__item__content"
      @mouseenter="onMouseEnter"
      @mouseleave="onMouseLeave">
      <CustomImage
        ref="customImageEl"
        v-if="!!data.image"
        :data="data.image"
        @load="onImageLoaded" />
    </div>
    <div ref="creditsEl" class="home__about__gallery__item__credits">
      {{ data.type === 'image' ? data.image?.alt : data.video?.alt }} {{ columns }}
    </div>
  </div>
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import useScrollStore from '~/store/useScrollStore'
import type { Video } from '~/types/wordpress'
import type { HomepageAboutGalleryItem } from '~/types/wordpress/homepage'
import { shuffleElsIn, fadeOut } from '~/utils/animations'
import CustomImage from '~/components/Global/CustomImage.vue'

const props = defineProps<{
  pos: number
  data: HomepageAboutGalleryItem
  planesId: string
}>()

const { $scene }: any = useNuxtApp()
const { scrollUpdated } = storeToRefs(useScrollStore())
const { toScale } = useCss()

const width = ref<number>(0)
const height = ref<number>(0)
const loaded = ref<boolean>(false)
const columns = ref<number>(props.data.columns)

const video = ref<Video | undefined>(props.data.video)

const customImageEl = ref<InstanceType<typeof CustomImage>>()

const el = ref<HTMLElement>()
const creditsEl = ref<HTMLElement>()

watch(scrollUpdated, () => {
  if (loaded.value) {
    width.value = customImageEl.value?.el ? customImageEl.value.el.width : video.value?.width || 0
    height.value = customImageEl.value?.el
      ? customImageEl.value.el.height
      : video.value?.height || 0
    $scene.updateObject({
      id: `${props.planesId}-${props.pos}`,
      size: { x: width.value, y: height.value, z: 1 },
      border: toScale(16),
    })
  }
})

function onImageLoaded() {
  width.value = customImageEl.value?.el ? customImageEl.value.el.width : video.value?.width || 0
  height.value = customImageEl.value?.el ? customImageEl.value.el.height : video.value?.height || 0
  customImageEl.value?.el && $scene.preload(customImageEl.value.el)
  $scene.addObject({
    id: `${props.planesId}-${props.pos}`,
    type: 'plane',
    img: customImageEl.value?.el,
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
  $scene.removeObject(`${props.planesId}-${props.pos}`)
})
</script>

<style lang="scss">
.home__about__gallery__item {
  padding-right: var(--layout-gutter);

  &__content {
    width: toColumns(v-bind(columns));
    border-radius: toScale(1.6rem);
    pointer-events: auto;

    .custom-image {
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
