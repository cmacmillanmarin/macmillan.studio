<template>
  <div ref="el" class="home__services" id="services-target" data-scroll-target-top>
    <ClientOnly>
      <Teleport to=".header__top">
        <transition
          mode="out-in"
          :css="false"
          @enter="transitionShuffleIn"
          @leave="transitionShuffleOut">
          <p
            v-if="activeService > 0 && section === 'services' && !isMobileLayout"
            class="home__services__index">
            <SvgSquare />
            <span v-html="`{${startWithZero(activeService)}—${startWithZero(data.list.length)}}`" />
          </p>
        </transition>
      </Teleport>
    </ClientOnly>

    <h2 class="home__services__title">{{ data.title }}</h2>
    <div class="home__services__hint">
      <h3 class="home__services__hint__label">
        <span class="home__services__hint__label__indent" /><span v-html="data.hint" />
      </h3>
    </div>

    <div v-show="!isMobileLayout" class="home__services__list">
      <HomeServicesService
        v-for="(service, i) in data.list"
        :i="i"
        :of="data.list.length - 1"
        :active="activeService"
        :data="service"
        data-scroll-sticky
        @update-active="updateActive" />
    </div>
    <ClientOnly>
      <div v-if="isMobileLayout" class="home__services__mobile-list">
        <Accordion
          v-for="(service, i) in data.list"
          :i="i"
          :number="i + 1"
          :title="service.title"
          :content="service.description"
          :html="true" />
      </div>
    </ClientOnly>

    <div class="home__services__intersect" v-intersect="{ callback: onIntersect }" />
  </div>
</template>

<script lang="ts" setup>
import useStore from '~/store/useStore'
import useScrollStore from '~/store/useScrollStore'
import { startWithZero } from '~/utils'
import { transitionShuffleIn, transitionShuffleOut } from '~/utils/animations'
import type { HomepageServices } from '~/types/wordpress/homepage'
import { storeToRefs } from 'pinia'

defineProps<{
  data: HomepageServices
}>()

const store = useStore()
const { updateSection } = store
const { section } = storeToRefs(store)
const { direction } = storeToRefs(useScrollStore())

const { isMobileLayout } = useDevice()

const activeService = ref<number>(0)

const isActive = computed(() => section.value === 'services')

const el = ref<HTMLElement>()

watch(isActive, () => {
  isActive.value ? fadeIn({ el: el.value, delay: 0.2 }) : fadeOut({ el: el.value })
})

function updateActive(i: number) {
  activeService.value = i + 1
}

function onIntersect(el: HTMLElement, visible: boolean) {
  if (visible) updateSection('services')
  else if (direction.value === 'up') updateSection('projects')
}
</script>

<style lang="scss">
.home__services {
  position: relative;
  min-height: var(--vh);
  padding: toScale(4rem) 0 0;
  opacity: 0.000001;
  will-change: opacity, transform;

  &__index {
    position: absolute;
    width: max-content;
    display: flex;
    align-items: center;
    column-gap: toScale(0.6rem);
    padding-top: toScale(7.1rem);
    @include will-fade;
    @include t-number;
    .svg__square {
      transform: translateY(10%);
    }
  }

  &__title {
    @include t-seo;
  }

  &__hint {
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
    .home__services__service {
      position: sticky;
      top: calc(var(--layout-margin) * 2);
    }
  }

  &__mobile-list {
    padding: 4rem var(--layout-margin) 0;
    .accordion__title__content__label {
      @include t-b1;
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
