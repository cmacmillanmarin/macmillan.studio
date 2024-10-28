<template>
  <div
    ref="el"
    :class="[
      'project__asset',
      `project__asset--layout-${data.layout}`,
      `project__asset--gap-${data.gap}`,
    ]">
    <ProjectVideo
      v-if="data.type === 'vid'"
      :data="data.video"
      :ready="ready"
      :bg-color="bgColor"
      :layout="data.layout"
      @update-scroll="emit('update-scroll')" />
    <ProjectImage
      v-else
      :data="data.image"
      :bg-color="bgColor"
      :ready="ready"
      :layout="data.layout"
      @update-scroll="emit('update-scroll')" />
  </div>
</template>

<script lang="ts" setup>
import { fadeIn } from '~/utils/animations'
import { type ProjectAsset } from '~/types/wordpress/project'

const props = defineProps<{
  data: ProjectAsset
  ready: boolean
  bgColor: string
}>()

const el = ref<HTMLElement>()

watch(
  () => props.ready,
  () => {
    if (props.ready) {
      fadeIn({ el: el.value })
    }
  }
)

const emit = defineEmits(['update-scroll'])
</script>

<style lang="scss">
.project__asset {
  @include will-fade;
  &--layout-top {
    padding-bottom: 26rem;
  }
  &--layout-bottom {
    padding-top: 26rem;
  }
  &--gap-s {
    padding-right: 4rem;
  }
  &--gap-m {
    padding-right: 20rem;
  }
  &--gap-l {
    padding-right: 36rem;
  }
}
</style>
