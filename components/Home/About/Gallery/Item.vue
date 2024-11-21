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
        :lazy="true"
        @load="onImageLoaded" />
    </div>
    <div ref="creditsEl" class="home__about__gallery__item__credits">
      {{ data.image.alt }}
    </div>
  </div>
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import useScrollStore from '~/store/useScrollStore'
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
const { isMobileLayout } = useDevice()

const width = ref<number>(0)
const height = ref<number>(0)
const loaded = ref<boolean>(false)
const columns = computed<number>(() => {
  if (isMobileLayout.value) {
    if (props.data.columns <= 3) return 4
    else return 6
  }
  return props.data.columns
})

const customImageEl = ref<InstanceType<typeof CustomImage>>()

const el = ref<HTMLElement>()
const creditsEl = ref<HTMLElement>()

watch(scrollUpdated, () => {
  if (loaded.value) {
    width.value = customImageEl.value?.el ? customImageEl.value.el.width : 0
    height.value = customImageEl.value?.el ? customImageEl.value.el.height : 0
    $scene.updateObject({
      id: `${props.planesId}-${props.pos}`,
      size: { x: width.value, y: height.value, z: 1 },
      border: toScale(isMobileLayout.value ? 8 : 16),
    })
  }
})

function onImageLoaded() {
  width.value = customImageEl.value?.el ? customImageEl.value.el.width : 0
  height.value = customImageEl.value?.el ? customImageEl.value.el.height : 0
  customImageEl.value?.el && $scene.preload(customImageEl.value.el)
  $scene.addObject({
    id: `${props.planesId}-${props.pos}`,
    type: 'plane',
    img: customImageEl.value?.el,
    position: { x: -1000, y: -1000 },
    size: { x: width.value, y: height.value, z: 1 },
    border: toScale(isMobileLayout.value ? 8 : 16),
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
  width: max-content;

  &__content {
    width: toColumns(v-bind(columns));
    border-radius: toScale(0.8rem, 37.5rem);
    pointer-events: auto;

    @include from__tablet--landscape {
      border-radius: toScale(1.6rem);
    }

    .custom-image {
      width: 100%;
      pointer-events: none;
      opacity: 0;
    }
  }

  &__credits {
    display: none;
    width: toColumns(v-bind(columns));
    padding: 1.2rem;
    pointer-events: none;
    @include will-fade;
    @include t-b3;
    @include from__tablet--landscape {
      display: block;
    }
  }
}
</style>
