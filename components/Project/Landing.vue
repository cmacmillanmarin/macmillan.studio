<template>
  <div :class="['project__landing', `project__landing--${data.slug}`]">
    <div class="project__landing__info">
      <div class="project__landing__info__stack">
        <p>Role</p>
        <p>Tech Stack</p>
        <p>Credits</p>
      </div>
      <div class="project__landing__info__description">
        <p>
          During my days at B-Reel, I worked with the Pixel Team at Google to conceptualize and
          build interactive and generative Wallpapers. Each Wallpaper is a calming, delightful
          portrait of the technical smarts behind Pixel. Some Wallpapers provide ambient information
          about your phone through subtle visualizations, while others react to changes in the
          environment.
        </p>
      </div>
      <div class="project__landing__info__link" />
    </div>
    <div class="project__landing__title">
      <SvgProjectWallpapers v-if="ready" />
    </div>
    <ClientOnly>
      <div v-if="gridType === 'golden-ratio'" class="project__landing__grid">
        <GridGoldenRatio />
      </div>
    </ClientOnly>
  </div>
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import useStore from '~/store/useStore'
import { type Project } from '~/types/wordpress/project'

const store = useStore()
const { gridType } = storeToRefs(store)

defineProps<{
  ready: boolean
  data: Project
}>()
</script>

<style lang="scss">
.project__landing {
  position: relative;

  &--nike-trail-challenge {
    .project__landing__title {
      svg {
        &:nth-child(1) {
          margin-bottom: 1.2rem;
        }
      }
    }
  }

  &__info {
    display: flex;
    justify-content: flex-start;
    width: 75vw;
    &__stack,
    &__description {
      display: flex;
      height: calc(var(--vh) * 0.33);
      align-items: flex-end;
      @include t-b2;
    }
    &__stack {
      margin-left: 3vw;
      width: 22vw;
    }
    &__description {
      margin-left: 15vw;
      width: 20vw;
      @include t-b2;
    }
  }

  &__title {
    position: absolute;
    bottom: var(--layout-margin);
    left: var(--layout-margin);
    svg {
      path {
        @include will-fade;
      }
      &:nth-child(1) {
        margin-bottom: 1.2rem;
      }
    }
  }

  &__grid {
    position: absolute;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100%;
    pointer-events: none;
  }
}
</style>
