<template>
  <img
    ref="el"
    v-if="!virtual"
    :src="thumbnail ? data.src : undefined"
    :srcset="thumbnail ? undefined : imgSrcset"
    :sizes="thumbnail ? undefined : imgSizes"
    :alt="data.alt"
    :aria-label="data.alt"
    :width="data.width"
    :height="data.height"
    :loading="lazy ? 'lazy' : undefined"
    crossorigin="anonymous"
    :class="['custom-image', { 'custom-image--cover': cover }, { 'will-fade': fade }]"
    @load="onload"
    v-intersect="{ callback: intersect }" />
  <div
    v-else
    ref="el"
    class="custom-image"
    data-custom-image-virtual
    :aria-label="data.alt"
    :data-width="data.width"
    :data-height="data.height"
    v-intersect="{ callback: intersect }" />
</template>

<script lang="ts" setup>
import { fadeIn } from '~/utils/animations'
import type { Image, Thumbnail } from '~/types/wordpress'
import type { ImageDimensions } from '~/types/front/index'

const props = defineProps<{
  data: Image | Thumbnail
  size?: ImageDimensions
  lazy?: boolean
  fade?: boolean
  cover?: boolean
  thumbnail?: boolean
  virtual?: boolean
}>()

const el = ref<HTMLImageElement>()
const inView = ref<boolean>(false)
const isLoaded = ref<boolean>(false)
const isVisible = ref<boolean>(false)
const isVirtual = ref<boolean>(!!props.virtual)

const size = ref<ImageDimensions>(props.size || { d: 1, t: 1, m: 1 })
const imgSizes = computed<string>(
  () =>
    `(min-width: 1024px) ${100 * size.value.d}vw,
  (min-width: 768px) ${100 * size.value.t}vw,
  ${100 * size.value.m}vw`
)

const imgSrcset = computed<string>(() => {
  let srcset = ''
  const data = props.data as Image
  for (const { src, width } of Object.values(data.sizes)) {
    srcset += `${src} ${width}w,`
  }
  srcset += `${data.src} ${data.width}w`
  return srcset
})

watch([isLoaded, inView], () => {
  props.fade && isLoaded.value && inView.value && !isVisible.value && enter()
  isVirtual.value && inView.value && !isLoaded.value && createVirtualImage()
})

onMounted(() => {
  el.value?.complete && el.value?.naturalHeight !== 0 && onload()
  isVirtual.value && !isLoaded.value && !props.lazy && createVirtualImage()
})

function intersect(el: HTMLElement, visible: boolean): void {
  inView.value = visible
}

function onload(): void {
  isLoaded.value = true
  emit('load', el.value)
}

function enter(): void {
  fadeIn({ el: el.value as HTMLElement })
  isVisible.value = true
}

// needed while threejs does not support images from DOM with CSS: mrdoob/three.js#23164

function createVirtualImage() {
  const image = new Image()
  image.crossOrigin = 'annonymus'
  image.srcset = imgSrcset.value
  image.sizes = imgSizes.value
  image.onload = () => {
    isLoaded.value = true
    emit('load', image)
  }
}

defineExpose({
  el,
})

const emit = defineEmits(['load'])
</script>

<style lang="scss">
.custom-image {
  border-radius: var(--border-radius--m);

  &--cover {
    height: 100%;
    object-fit: cover;
  }
}
</style>
