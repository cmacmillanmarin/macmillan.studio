<template>
  <div class="project__next" v-transition:in="{ callback: enter }">
    <ProjectLanding
      :data="data"
      :ready="ready"
      :animation="true"
      :next="true"
      @next-project="emit('next-project')"
      @update-scroll="emit('update-scroll')" />
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

const emit = defineEmits(['update-scroll', 'next-project'])
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
    bottom: 0;
    left: 0;
    width: 100%;
    height: 5vw;
    transform: translateY(50%);
    background-color: v-bind(backgroundColor);
    @include from__tablet--landscape {
      bottom: auto;
      left: auto;
      top: 0;
      right: 0;
      width: 5vw;
      height: 100%;
      transform: translateX(50%);
    }
  }
}
</style>
