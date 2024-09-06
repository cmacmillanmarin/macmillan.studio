<template>
  <div
    ref="el"
    id="projects-target"
    class="home__projects"
    data-scroll-target-top
    data-scroll-set-position>
    <HomeProjectsProject
      v-for="(project, slug, i) in data"
      :slug="slug"
      :data="project"
      :top="top"
      :bottom="bottom"
      :side="i % 2 === 0 ? -1 : 1"
      :inProject="inProject" />
  </div>
</template>

<script lang="ts" setup>
import { type Projects } from '~/types/data'

defineProps<{
  data: Projects
  inProject: boolean
}>()

const { vh } = useResize()

const { onReset, getBounding } = useVirtualScrollAndThreeTools()

const top = ref<number>(0)
const bottom = ref<number>(0)
const el = ref<HTMLElement>()

watch(onReset, () => {
  const bounding = getBounding(el.value as HTMLElement)
  top.value = bounding.top
  bottom.value = bounding.bottom - vh.value
})
</script>

<style lang="scss">
.home__projects {
  padding-bottom: calc(var(--vh) * 0.8);
}
</style>
