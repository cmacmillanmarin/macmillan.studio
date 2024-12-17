<template></template>

<script lang="ts" setup>
import { gsap } from 'gsap/gsap-core'
const { $three }: any = useNuxtApp()
const { isMobileLayout } = useDevice()
const { onResize, vw, vh } = useResize()

const props = defineProps<{
  lab?: boolean
}>()

const opacity = ref<number>(0)

watch(onResize, () => {
  $three.updateSize({ size: { x: vw.value, y: vh.value } })
})

watch(isMobileLayout, () => {
  $three.updateMobileLayout(isMobileLayout.value)
})

onMounted(() => {
  $three.create({
    lab: !!props.lab,
    size: { x: vw.value, y: vh.value },
  })
  $three.updateMobileLayout(isMobileLayout.value)
  if (!props.lab) {
    gsap.to(opacity, {
      value: 1,
      duration: 2,
      onUpdate: () => $three.noise.updateOpacity(opacity.value),
    })
  }
})

onUnmounted(() => {
  gsap.killTweensOf(opacity)
  $three.destroy()
})
</script>
