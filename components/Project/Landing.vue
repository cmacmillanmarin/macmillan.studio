<template>
  <div
    :class="[
      'project__landing',
      `project__landing--${data.slug}`,
      { 'project__landing--animation': animation },
    ]">
    <div class="project__landing__info">
      <div ref="stackEl" class="project__landing__info__stack">
        <p>Role</p>
        <p>Tech Stack</p>
        <p>Credits</p>
      </div>
      <div ref="descriptionEl" class="project__landing__info__description">
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
    <div v-if="ready" class="project__landing__title">
      <!-- <SvgProjectWallpapers v-if="data.slug === 'pixel-wallpapers'" :animation="animation" /> -->
      <h2 v-transition:in="{ callback: animation ? shuffleIn : () => {} }">
        <span v-for="letter in data.title">{{ letter }}</span>
      </h2>
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
import { fadeIn, shuffleIn } from '~/utils/animations'

const store = useStore()
const { gridType } = storeToRefs(store)

const props = defineProps<{
  data: Project
  ready: boolean
  animation: boolean
}>()

const stackEl = ref<HTMLElement>()
const descriptionEl = ref<HTMLElement>()

watch(
  () => props.ready,
  () => {
    fadeIn({ el: stackEl.value })
    fadeIn({ el: descriptionEl.value, delay: 0.2 })
  }
)
</script>

<style lang="scss">
.project__landing {
  position: relative;
  height: var(--vh);

  &--animation {
    .project__landing__title {
      h2 {
        span {
          @include will-fade;
        }
      }
      svg {
        > path,
        > g {
          @include will-fade;
        }
      }
    }
    .project__landing__info {
      .project__landing__info__stack,
      .project__landing__info__description {
        @include will-fade;
      }
    }
  }

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
      &:nth-child(1) {
        margin-bottom: 1.2rem;
      }
    }
    h2 {
      text-transform: uppercase;
      @include t-project;
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
