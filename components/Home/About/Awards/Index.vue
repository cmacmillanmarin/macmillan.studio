<template>
  <div ref="el" class="home__about__awards">
    <div class="home__about__awards__hint">
      <h3 class="home__about__awards__hint__label">
        <span class="home__about__awards__hint__label__indent" />
        <span v-html="data.title" />
      </h3>
    </div>

    <div ref="listEl" class="home__about__awards__list">
      <div
        ref="logoEl"
        :class="[
          'home__about__awards__list__logo',
          { 'home__about__awards__list__logo--safari': safari },
        ]">
        <SvgLogo data-scroll-sticky />
      </div>
      <HomeAboutAwardsAward
        v-for="(award, i) in data.awards"
        :i="i"
        :of="data.awards.length - 1"
        :active="activeAward"
        :data="award"
        data-scroll-sticky
        @update-active="updateActive" />
    </div>

    <div class="home__about__awards__intersect" v-intersect="{ callback: onIntersect }" />
  </div>
</template>

<script lang="ts" setup>
import useStore from '~/store/useStore'
import useScrollStore from '~/store/useScrollStore'

import { storeToRefs } from 'pinia'
import type { HomepageAboutAwards } from '~/types/wordpress/homepage'

defineProps<{
  data: HomepageAboutAwards
}>()

const store = useStore()
const { updateSection } = store
const { section } = storeToRefs(store)
const { direction } = storeToRefs(useScrollStore())
const { safari } = useDevice()

const activeAward = ref<number>(0)

const isActive = computed(() => section.value === 'about-awards')

const el = ref<HTMLElement>()
const listEl = ref<HTMLElement>()
const logoEl = ref<HTMLElement>()

let _to: any

watch(isActive, () => {
  if (isActive.value) {
    fadeIn({ el: el.value, delay: 0.2 })
    _to = setTimeout(() => {
      listEl.value?.classList.add('home__about__awards__list--visible')
      fadeIn({ el: logoEl.value })
    }, 400)
  } else {
    listEl.value?.classList.remove('home__about__awards__list--visible')
    fadeOut({ el: el.value })
    fadeOut({ el: logoEl.value })
  }
})

function updateActive(i: number) {
  activeAward.value = i + 1
}

function onIntersect(el: HTMLElement, visible: boolean) {
  if (visible) updateSection('about-awards')
  else if (direction.value === 'up') updateSection('about-testimonials')
}
</script>

<style lang="scss">
.home__about__awards {
  position: relative;
  min-height: var(--vh);
  padding: 0 0 toScale(8rem);
  opacity: 0.000001;
  will-change: opacity, transform;

  &__hint {
    position: relative;
    z-index: 2;
    @include grid;

    &__label {
      padding-top: toScale(2rem);
      padding-bottom: toScale(2rem);
      @include t-h2;
      @include columns(10, 'desktop');
      @include gap(2, 'left', 'desktop');

      &__indent {
        --width: calc(
          min(100vw, var(--layout-max-width)) - var(--layout-margin) * 2 - var(--layout-gutter) * 11
        );
        --column-width: calc(var(--width) / 12);
        width: calc(var(--column-width) * 4 + var(--layout-gutter) * 4);
        display: inline-block;
      }
    }
  }

  &__list {
    position: relative;
    z-index: 1;

    &::after {
      content: ' ';
      z-index: -1;
      background-color: var(--light-grey);
      @include absolute-fill;
      @include will-fade;
    }

    &--visible {
      &::after {
        opacity: 1;
      }
    }

    &__logo {
      position: absolute;
      top: toScale(3.8rem);
      left: var(--layout-margin);
      z-index: 9;
      mix-blend-mode: color;
      @include will-fade;

      &--safari {
        mix-blend-mode: color-burn;
      }

      svg {
        width: toColumns(8);
        height: auto;
        path {
          fill: var(--lime);
        }
      }
    }

    .home__about__awards__award {
      position: sticky;
      top: calc(var(--layout-margin) * 2);
    }
  }

  &__intersect {
    position: absolute;
    top: calc(var(--vh) * 0.5);
    left: 0;
    width: 100%;
    height: 1px;
  }
}
</style>
