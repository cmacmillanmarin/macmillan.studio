<template>
  <img
    ref="el"
    :src="thumbnail ? data.src : undefined"
    :srcset="thumbnail ? undefined : imgSrcset"
    :sizes="thumbnail ? undefined : imgSizes"
    :alt="data.alt"
    :aria-label="data.alt"
    :width="data.width"
    :height="data.height"
    :loading="lazy ? 'lazy' : undefined"
    :class="['c-custom-image', { 'c-custom-image--cover': cover }, { 'will-fade': fade }]"
    @load="onload"
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
}>()

const el = ref<HTMLImageElement>()
const inView = ref<boolean>(false)
const isLoaded = ref<boolean>(false)
const isVisible = ref<boolean>(false)

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
  return srcset.slice(0, -1)
})

watch([isLoaded, inView], () => {
  props.fade && isLoaded.value && inView.value && !isVisible.value && enter()
})

function intersect(el: HTMLElement, visible: boolean): void {
  inView.value = visible
}

function onload(): void {
  isLoaded.value = true
}

function enter(): void {
  fadeIn({ el: el.value as HTMLElement })
  isVisible.value = true
}

onMounted(() => {
  el.value?.complete && el.value?.naturalHeight !== 0 && onload()
})

defineExpose({
  el,
})
</script>

<style lang="scss">
.c-custom-image {
  border-radius: var(--border-radius--m);
  &--cover {
    height: 100%;
    object-fit: cover;
  }
}
</style>
