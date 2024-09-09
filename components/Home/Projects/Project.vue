<template>
  <div ref="el" class="home__projects__project" data-scroll-set-position>
    <CustomLink :to="`/${data.slug}`" class="home__projects__project__" :content="true">{{
      data.title
    }}</CustomLink>
  </div>
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import useStore from '~/store/useStore'
import useScrollStore from '~/store/useScrollStore'
import type { Project } from '~/types/wordpress/project'
import { slugify } from '~/utils'

const props = defineProps<{
  data: Project
  top: number
  bottom: number
  side: number
}>()

const { $scene }: any = useNuxtApp()

const { vw, vh } = useResize()
const { isInProjectEntered } = storeToRefs(useStore())
const { current } = storeToRefs(useScrollStore())
const { getBounding } = useVirtualScrollAndThreeTools()

const projectId = computed<string>(() => `project-${slugify(props.data.title)}`)

const el = ref<HTMLElement>()
const progress = ref<number>(0)
const leaveProgress = ref<number>(0)
const size = ref<{ x: number; y: number }>({ x: 400, y: (400 * 7) / 5 })

watch(current, () => {
  let { top, bottom } = getBounding(el.value as HTMLElement)
  top -= vh.value
  bottom -= vh.value
  const leaveBottom = bottom + vh.value
  progress.value = Math.min(Math.max(0, (current.value - top) / (bottom - top)), 1)
  leaveProgress.value = Math.min(Math.max(0, (current.value - bottom) / (leaveBottom - bottom)), 1)
})

watch([() => props.top, () => props.bottom, progress, leaveProgress, isInProjectEntered], () => {
  const sizeX = size.value.x * (progress.value + leaveProgress.value)
  const sizeY = size.value.y * (progress.value + leaveProgress.value)

  const positionX =
    vw.value * 0.5 -
    sizeX * 0.5 +
    sizeX * props.side * leaveProgress.value +
    sizeX * leaveProgress.value * props.side
  const positionY =
    props.top + vh.value * 0.5 - sizeY * 0.5 + sizeY * props.side * leaveProgress.value * 0

  const rotateY = (Math.PI / 180) * 90 * props.side * leaveProgress.value

  const opacity = leaveProgress.value === 1 ? 0 : 1

  $scene.updateObject({
    id: projectId.value,
    opacity,
    rotate: { x: 0, y: rotateY, z: 0 },
    position: { x: isInProjectEntered.value ? -10000 : positionX, y: positionY },
    size: { x: sizeX, y: sizeY, z: 1 },
    fixed: { from: props.top, to: props.bottom },
  })
})

onMounted(() => {
  $scene.addObject({
    id: projectId.value,
    type: 'plane',
    size: { x: 1, y: 1, z: 1 },
    position: { x: 0, y: 0 },
    fixed: { from: props.top, to: props.bottom },
    border: 16,
  })
})

onBeforeUnmount(() => {
  $scene.removeObject({ id: projectId.value })
})
</script>

<style lang="scss">
.home__projects__project {
  min-height: var(--vh);
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
