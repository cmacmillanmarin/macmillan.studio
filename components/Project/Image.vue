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
  layout?: 'full' | 'top' | 'bottom' | 'scroll'
  bgColor: string
}>()

const { vh } = useResize()
const { toScale } = useCss()

const el = ref<HTMLElement>()

const loaded = ref<boolean>(false)

const gap = computed<number>(() =>
  props.layout === 'top' || props.layout === 'bottom' ? toScale(260) : 0
)

const height = computed<string>(() => toPx(vh.value - gap.value))
const width = computed<string>(() =>
  toPx(((vh.value - gap.value) * props.data.width) / props.data.height)
)

watch([width, height], async () => {
  await nextTick()
  emit('update-scroll')
})

watch([loaded, () => props.ready], () => {
  const img = el.value?.querySelector('.custom-image')
  props.ready && loaded.value && img && fadeIn({ el: img })
  emit('update-scroll')
})

function onLoaded() {
  loaded.value = true
}

const emit = defineEmits(['update-scroll'])
</script>

<style lang="scss">
.project__image {
  background-color: v-bind(bgColor);
  .custom-image {
    display: block;
    width: v-bind(width);
    height: v-bind(height);
    @include will-fade;
  }
}
</style>
