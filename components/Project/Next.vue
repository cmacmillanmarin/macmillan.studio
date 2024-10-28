<template>
  <div class="project__next" v-transition:in="{ callback: enter }">
    <ProjectLanding :data="data" :ready="ready" :animation="true" />
  </div>
</template>

<script lang="ts" setup>
import type { Project } from '~/types/wordpress/project'

const props = defineProps<{
  data: Project
}>()

const ready = ref<boolean>(false)
const backgroundColor = ref<string>(props.data.color)

function enter() {
  ready.value = true
}
</script>

<style lang="scss">
.project__next {
  position: relative;
  background-color: v-bind(backgroundColor);
  .project__landing {
    position: relative;
    z-index: 1;
  }
  &::after {
    content: '';
    position: absolute;
    z-index: 0;
    top: 0;
    right: 0;
    width: 5vw;
    height: 100%;
    transform: translateX(50%);
    background-color: v-bind(backgroundColor);
  }
}
</style>
