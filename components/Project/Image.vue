<template>
  <div ref="el" class="project__image">
    <CustomImage :data="data" :size="{ d: 1, t: 1, m: 1 }" :lazy="true" @load="onLoaded" />
  </div>
</template>

<script lang="ts" setup>
import type { Image } from '~/types/wordpress'

const props = defineProps<{
  data: Image
  ready?: boolean
  transparent?: boolean
  layout?: 'full' | 'top' | 'bottom' | 'center' | 'scroll'
  bgColor: string
  first?: boolean
}>()

const { vw, vh } = useResize()
const { toScale } = useCss()
const { isMobileLayout } = useDevice()

const el = ref<HTMLElement>()

const loaded = ref<boolean>(false)
const background = ref<string>(props.transparent ? 'transparent' : props.bgColor)

const gap = computed<number>(() =>
  props.layout === 'top' || props.layout === 'bottom' || props.layout === 'center'
    ? toScale(isMobileLayout.value ? 150 : 260)
    : toScale(isMobileLayout.value && props.first ? 32 : 0)
)

const height = computed<string>(() => {
  if (isMobileLayout.value)
    return toPx(((vw.value - gap.value) * props.data.height) / props.data.width)
  return toPx(vh.value - gap.value)
})
const width = computed<string>(() => {
  if (isMobileLayout.value) return toPx(vw.value - gap.value)
  return toPx(((vh.value - gap.value) * props.data.width) / props.data.height)
})

watch([width, height], async () => {
  await nextTick()
  emit('update-scroll')
})

watch([loaded, () => props.ready], async () => {
  const img = el.value?.querySelector('.custom-image')
  props.ready && loaded.value && img && fadeIn({ el: img })
  await nextTick()
  emit('update-scroll')
})

function onLoaded() {
  loaded.value = true
}

const emit = defineEmits(['update-scroll'])
</script>

<style lang="scss">
.project__image {
  background-color: v-bind(background);
  .custom-image {
    display: block;
    width: v-bind(width);
    height: v-bind(height);
    @include will-fade;
  }
}
</style>
