<template>
  <div
    ref="el"
    :class="[
      'project__asset',
      `project__asset--gap-${data.gap}`,
      `project__asset--layout-${data.layout}`,
      { 'project__asset--layout-mobile': data.mobile && isMobileLayout },
    ]">
    <div class="project__asset__content">
      <ProjectVimeo v-if="data.layout === 'vimeo'" :src="data.vimeoURL" :mobile="data.mobile" />
      <ProjectVideo
        v-else-if="data.file.type === 'vid' && data.file.video"
        :data="data.file.video"
        :ready="ready"
        :bg-color="bgColor"
        :layout="data.layout"
        :first="first"
        :transparent="data.transparent"
        :mobile="data.mobile"
        @update-scroll="$emit('update-scroll')" />
      <ProjectImage
        v-else-if="data.file.type === 'img' && data.file.image"
        :data="data.file.image"
        :bg-color="bgColor"
        :ready="ready"
        :first="first"
        :layout="data.layout"
        :transparent="data.transparent"
        :mobile="data.mobile"
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
  first: boolean
  bgColor: string
}>()

const el = ref<HTMLElement>()

const { isMobileLayout } = useDevice()

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
    justify-content: center;
    width: 100%;
    height: 100%;
  }

  &--layout-top {
    .project__asset__content {
      padding-left: var(--layout-margin);
      justify-content: flex-start;
      @include from__tablet--landscape {
        padding-left: 0;
        align-items: flex-start;
      }
    }
  }

  &--layout-center,
  &--layout-vimeo {
    .project__asset__content {
      justify-content: center;
      @include from__tablet--landscape {
        align-items: center;
      }
    }
  }

  &--layout-bottom {
    .project__asset__content {
      padding-right: var(--layout-margin);
      justify-content: flex-end;
      @include from__tablet--landscape {
        padding-right: 0;
        align-items: flex-end;
      }
    }
  }

  &--layout-scroll {
    justify-content: center;

    @include from__tablet--landscape {
      overflow: var(--overflow-hidden);
      padding-top: toScale(13rem);
    }
  }

  &--layout-mobile {
    .project__asset__content {
      padding-left: 0 !important;
      padding-right: 0 !important;
    }
  }

  &--gap-s {
    padding-bottom: 4rem;
    @include from__tablet--landscape {
      padding-right: 8rem;
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
