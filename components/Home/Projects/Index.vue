<template>
  <div
    ref="el"
    id="projects-target"
    class="home__projects"
    data-scroll-target-top
    data-scroll-set-position>
    <HomeProjectsProject
      v-for="(project, i) in data.list"
      :i="i"
      :data="project"
      :top="top"
      :bottom="bottom"
      :side-x="i % 4 === 0 || i % 4 === 3 ? -1 : 1"
      :side-y="i % 4 <= 1 ? -1 : 1" />
  </div>
</template>

<script lang="ts" setup>
import { type HomepageProjects } from '~/types/wordpress/homepage'

defineProps<{
  data: HomepageProjects
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
  // padding-top: calc(var(--vh) * 0.5);
  padding-bottom: calc(var(--vh) * 0.25);
}
</style>
