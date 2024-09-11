<template>
  <canvas ref="el" class="three" data-scene-id="noise" />
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import useScrollStore from '~/store/useScrollStore'

const { bounding } = storeToRefs(useScrollStore())

const { $scene }: any = useNuxtApp()
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

onMounted(() => {
  $scene.create({
    el: el.value,
    size: { x: vw.value, y: vh.value },
  })
  $scene.addObject({
    id: 'noise',
    type: 'plane',
    fixed: { from: 0, to: bounding.value },
    size: { x: vw.value, y: vh.value, z: 1 },
    position: { x: 0, y: 0, z: 300 },
  })
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
