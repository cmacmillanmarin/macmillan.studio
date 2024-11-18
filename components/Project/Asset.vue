<template>
  <div
    ref="el"
    :class="[
      'project__asset',
      `project__asset--gap-${data.gap}`,
      `project__asset--layout-${data.layout}`,
    ]">
    <div class="project__asset__content">
      <ProjectVideo
        v-if="data.file.type === 'vid' && data.file.video"
        :data="data.file.video"
        :ready="ready"
        :bg-color="bgColor"
        :layout="data.layout"
        :transparent="data.transparent"
        @update-scroll="$emit('update-scroll')" />
      <ProjectImage
        v-else-if="data.file.type === 'img' && data.file.image"
        :data="data.file.image"
        :bg-color="bgColor"
        :ready="ready"
        :layout="data.layout"
        :transparent="data.transparent"
        @update-scroll="$emit('update-scroll')" />
    </div>
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
    props.ready && fadeIn({ el: el.value })
  }
)

onMounted(() => {
  props.ready && fadeIn({ el: el.value })
})
</script>

<style lang="scss">
.project__asset {
  @include will-fade;

  &__content {
    display: flex;
    width: 100%;
    height: 100%;
  }

  &--layout-top {
    .project__asset__content {
      justify-content: flex-start;
      @include from__tablet--landscape {
        align-items: flex-start;
      }
    }
  }

  &--layout-center {
    .project__asset__content {
      justify-content: center;
      @include from__tablet--landscape {
        align-items: center;
      }
    }
  }

  &--layout-bottom {
    .project__asset__content {
      justify-content: flex-end;
      @include from__tablet--landscape {
        align-items: flex-end;
      }
    }
  }

  &--gap-s {
    padding-bottom: 2rem;
    @include from__tablet--landscape {
      padding-right: 4rem;
      padding-bottom: 0;
    }
  }

  &--gap-m {
    padding-bottom: 8rem;
    @include from__tablet--landscape {
      padding-right: 20rem;
      padding-bottom: 0;
    }
  }

  &--gap-l {
    padding-bottom: 12rem;
    @include from__tablet--landscape {
      padding-right: 36rem;
      padding-bottom: 0;
    }
  }
}
</style>
