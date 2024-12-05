<template>
  <div ref="el" class="home__about__gallery__item">
    <div
      class="home__about__gallery__item__content"
      @mouseenter="onMouseEnter"
      @mouseleave="onMouseLeave">
      <CustomImage
        ref="customImageEl"
        v-if="data.type === 'img' && !!data.image"
        :data="data.image"
        :lazy="true"
        :virtual="true"
        :size="{ d: data.columns / 12, t: data.columns / 8, m: data.columns / 8 }"
        @load="onImageLoaded" />
      <video
        v-else-if="data.type === 'vid' && !!data.video"
        ref="videoEl"
        :alt="data.video.alt"
        :width="data.video.width"
        :height="data.video.height"
        muted
        playsinline
        loop
        autoplay
        crossorigin="anonymous"
        @canplaythrough="onVideoLoaded">
        <source :src="data.video.webm" type="video/webm" />
        <source :src="data.video.mp4" type="video/mp4" />
      </video>
    </div>
    <div ref="creditsEl" class="home__about__gallery__item__credits">
      {{ data.type === 'img' ? data.image.alt : data.video?.alt || '' }}
    </div>
  </div>
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia'
// import useStore from '~/store/useStore'
import useScrollStore from '~/store/useScrollStore'
import type { HomepageAboutGalleryItem } from '~/types/wordpress/homepage'
import { shuffleElsIn, fadeOut } from '~/utils/animations'
import CustomImage from '~/components/Global/CustomImage.vue'
import { hexToRgb, rbgToVec4 } from '~/utils'

const props = defineProps<{
  pos: number
  data: HomepageAboutGalleryItem
  planesId: string
}>()

const { $three }: any = useNuxtApp()
// const { updateCursorPosition } = useStore()
const { scrollUpdated } = storeToRefs(useScrollStore())
// const { current, scrollUpdated } = storeToRefs(useScrollStore())
const { toScale, getColumnWidth } = useCss()
const { isMobileLayout } = useDevice()

const width = ref<number>(0)
const height = ref<number>(0)
const columns = computed<number>(() => {
  if (isMobileLayout.value) {
    if (props.data.columns <= 3) return 4
    else return 6
  }
  return props.data.columns
})

const videoEl = ref<HTMLVideoElement>()
const customImageEl = ref<InstanceType<typeof CustomImage>>()

const el = ref<HTMLElement>()
const creditsEl = ref<HTMLElement>()

const id: string = `${props.planesId}-${props.pos}`

// watch(current, () => {
//   updateCursorPosition({ x: -1, y: -1 })
// })

watch(scrollUpdated, () => {
  width.value = getWidth()
  height.value = getHeight()
  $three.planes.updateObject({
    id,
    size: { x: width.value, y: height.value, z: 1 },
    border: toScale(isMobileLayout.value ? 8 : 16),
  })
})

onMounted(() => {
  $three.planes.addObject({
    id,
    position: { x: 0, y: 0 },
    size: { x: 0, y: 0, z: 1 },
    opacity: 0,
    color: rbgToVec4(hexToRgb('#000000')),
  })
})

function getWidth() {
  return getColumnWidth(columns.value)
}

function getHeight() {
  let ar = 1
  if (props.data.type === 'img') {
    ar = props.data.image.height / props.data.image.width
  } else if (props.data.video) {
    ar = props.data.video.height / props.data.video.width
  }
  return width.value * ar
}

function onVideoLoaded() {
  $three.planes.updateObject({ id, video: videoEl.value })
}

function onImageLoaded(img: HTMLImageElement) {
  $three.planes.updateObject({ id, img })
  // customImageEl.value?.el && $three.planes.preload(customImageEl.value.el)
}

function onMouseEnter() {
  if (!creditsEl.value) return
  // const { left, top } = creditsEl.value.getBoundingClientRect()
  // updateCursorPosition({ x: left - toScale(20), y: top + toScale(17) })
  shuffleElsIn({ els: [creditsEl.value] })
}

function onMouseLeave() {
  if (!creditsEl.value) return
  // updateCursorPosition({ x: -1, y: -1 })
  fadeOut({ el: creditsEl.value })
}

onBeforeUnmount(() => {
  $three.planes.removeObject(`${props.planesId}-${props.pos}`)
})
</script>

<style lang="scss">
.home__about__gallery__item {
  padding-right: var(--layout-gutter);
  width: max-content;

  &__content {
    width: toColumns(v-bind(columns));
    border-radius: toScale(0.8rem, 37.5rem);
    pointer-events: auto;

    @include from__tablet--landscape {
      border-radius: toScale(1.6rem);
    }

    .custom-image,
    video {
      display: block;
      height: auto;
      width: 100%;
      pointer-events: none;
      opacity: 0;
    }
  }

  &__credits {
    display: none;
    width: toColumns(v-bind(columns));
    padding: toScale(1.2rem);
    user-select: none;
    pointer-events: none;
    @include will-fade;
    @include t-b3;
    @include from__tablet--landscape {
      display: block;
    }
  }
}
</style>
