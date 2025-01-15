<template>
  <iframe
    class="project__vimeo"
    :src="src"
    frameborder="0"
    allow="fullscreen; picture-in-picture"
    allowfullscreen />
</template>

<script lang="ts" setup>
defineProps<{
  src: string
}>()

const { vw, vh } = useResize()
const { toScale } = useCss()
const { isMobileLayout } = useDevice()

const gap = computed<number>(() => toScale(isMobileLayout.value ? 150 : 260))

const height = computed<string>(() => {
  if (isMobileLayout.value) return toPx(Math.ceil(((vw.value - gap.value) * 9) / 16))
  return toPx(Math.ceil(vh.value - gap.value))
})

const width = computed<string>(() => {
  if (isMobileLayout.value) return toPx(Math.ceil(vw.value - gap.value))
  return toPx(Math.ceil(((vh.value - gap.value) * 16) / 9))
})

watch([width, height], async () => {
  await nextTick()
  emit('update-scroll')
})

const emit = defineEmits(['update-scroll'])
</script>

<style lang="scss">
.project__vimeo {
  display: block;
  width: v-bind(width);
  height: v-bind(height);
}
</style>
