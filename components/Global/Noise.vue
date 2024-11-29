<template>
  <canvas ref="el" class="noise" data-scene-id="noise" />
</template>

<script lang="ts" setup>
import { gsap } from 'gsap/gsap-core'
const { $noise }: any = useNuxtApp()
const { onResize, vw, vh } = useResize()

const el = ref<HTMLCanvasElement>()
const opacity = ref<number>(0)

watch(onResize, () => {
  $noise.updateSize({ size: { x: vw.value, y: vh.value } })
})

onMounted(() => {
  $noise.create({
    el: el.value,
    size: { x: vw.value, y: vh.value },
  })
  gsap.to(opacity, { value: 1, duration: 2, onUpdate: () => $noise.updateOpacity(opacity.value) })
})

onUnmounted(() => {
  gsap.killTweensOf(opacity)
  $noise.destroy()
})
</script>

<style lang="scss">
.noise {
  width: 100%;
  height: 100%;
  pointer-events: none;
}
</style>
