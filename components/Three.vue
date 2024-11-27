<template>
  <canvas ref="el" class="three" data-scene-id="noise" />
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import useStore from '~/store/useStore'
import useScrollStore from '~/store/useScrollStore'

const store = useStore()
const { updateCursor } = store
const scrollStore = useScrollStore()
const { bounding } = storeToRefs(scrollStore)

const { $scene }: any = useNuxtApp()
const { isMobileLayout } = useDevice()
const { onResize, vw, vh } = useResize()

const el = ref<HTMLCanvasElement>()

watch(bounding, () => {
  $scene.updateObject({
    id: 'noise',
    fixed: { from: 0, to: bounding.value },
  })
})

watch(onResize, () => {
  $scene.updateSize({ size: { x: vw.value, y: vh.value } })
  $scene.updateObject({
    id: 'noise',
    fixed: { from: 0, to: bounding.value },
    size: { x: vw.value, y: vh.value, z: 1 },
  })
})

watch(isMobileLayout, () => {
  $scene.updateMobileLayout(isMobileLayout.value)
})

onMounted(() => {
  $scene.create({
    el: el.value,
    size: { x: vw.value, y: vh.value },
    updateCursor,
  })
  // $scene.addObject({
  //   id: 'noise',
  //   type: 'plane',
  //   fixed: { from: 0, to: bounding.value },
  //   size: { x: vw.value, y: vh.value, z: 1 },
  //   position: { x: 0, y: 0, z: 300 },
  //   fade: true,
  //   order: 50,
  // })
  $scene.updateMobileLayout(isMobileLayout.value)
})

onUnmounted(() => {
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
