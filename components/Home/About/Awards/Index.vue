<template>
  <div ref="el" class="home__about__awards">
    <div class="home__about__awards__hint">
      <h3 class="home__about__awards__hint__label">
        <span class="home__about__awards__hint__label__indent" />
        <span v-html="data.title" />
      </h3>
    </div>

    <div ref="listEl" class="home__about__awards__list">
      <ClientOnly>
        <div
          ref="logoEl"
          :class="[
            'home__about__awards__list__logo',
            { 'home__about__awards__list__logo--safari': safari },
          ]">
          <SvgLogo data-scroll-sticky />
        </div>
      </ClientOnly>
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
    activeAward.value = 0
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
  opacity: 0.000001;
  padding: 0 0 toScale(6rem, 37.5rem);
  will-change: opacity, transform;

  @include from__tablet--landscape {
    padding: 0 0 toScale(8rem);
  }

  &__hint {
    position: relative;
    z-index: 2;
    @include grid;

    &__label {
      @include columns(8, 'mobile');
      @include t-h2;

      @include from__tablet--landscape {
        padding-top: toScale(2rem);
        padding-bottom: toScale(2rem);
        @include columns(10, 'tablet--landscape');
        @include gap(2, 'left', 'tablet--landscape');
      }

      &__indent {
        width: calc(toColumns(1) + var(--layout-gutter));
        display: inline-block;
        @include from__tablet--landscape {
          width: calc(toColumns(4) + var(--layout-gutter));
        }
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
      top: toScale(3.2rem, 37.5rem);
      left: var(--layout-margin);
      z-index: 9;
      mix-blend-mode: color;
      @include will-fade;
      pointer-events: none;

      &--safari {
        mix-blend-mode: color-burn;
      }

      @include from__tablet--landscape {
        top: toScale(3.8rem);
      }

      @include from__desktop--x-large {
        left: calc((100vw - var(--layout-max-width)) * 0.5 + var(--layout-margin));
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
      top: calc(7.2rem - toScale(3.2rem, 37.5rem));
      @include from__tablet--landscape {
        top: calc(7.2rem - toScale(4rem));
      }
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
