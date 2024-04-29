<template>
  <canvas ref="el" class="three" />
</template>

<script lang="ts" setup>
const { $scene }: any = useNuxtApp()

const { onResize, vw, vh } = useResize()
const { addTicker, killTicker } = useRaf()

const el = ref<HTMLCanvasElement>()

onMounted((): void => {
  $scene.create({
    el: el.value,
    size: { x: vw.value, y: vh.value },
    play: addTicker,
    stop: killTicker,
  })
})

watch(onResize, (): void => {
  $scene.updateSize({ size: { x: vw.value, y: vh.value } })
})

onUnmounted((): void => {
  $scene.destroy()
})
</script>

<style lang="scss">
.three {
  width: 100%;
  height: 100%;
  pointer-events: none;
}
</style>
