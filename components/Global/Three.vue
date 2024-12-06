<template></template>

<script lang="ts" setup>
import { gsap } from 'gsap/gsap-core'
const { $three }: any = useNuxtApp()
const { isMobileLayout } = useDevice()
const { onResize, vw, vh } = useResize()

const opacity = ref<number>(0)

watch(onResize, () => {
  $three.updateSize({ size: { x: vw.value, y: vh.value } })
})

watch(isMobileLayout, () => {
  $three.updateMobileLayout(isMobileLayout.value)
})

onMounted(() => {
  $three.create({
    size: { x: vw.value, y: vh.value },
  })
  $three.updateMobileLayout(isMobileLayout.value)
  gsap.to(opacity, {
    value: 1,
    duration: 2,
    onUpdate: () => $three.noise.updateOpacity(opacity.value),
  })
})

onUnmounted(() => {
  gsap.killTweensOf(opacity)
  $three.destroy()
})
</script>
