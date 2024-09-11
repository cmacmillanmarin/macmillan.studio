<template>
  <div class="home__services" id="services-target" data-scroll-target-top>
    <ClientOnly>
      <Teleport to=".header__top">
        <transition
          mode="out-in"
          :css="false"
          @enter="transitionShuffleIn"
          @leave="transitionShuffleOut">
          <p v-if="active !== 0" class="home__services__index">
            <SvgSquare />
            <span v-html="`{${startWithZero(active)}—${startWithZero(data.list.length)}}`" />
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

    <div class="home__services__list">
      <HomeServicesService
        v-for="(service, i) in data.list"
        :i="i"
        :of="data.list.length - 1"
        :active="active"
        :data="service"
        data-scroll-sticky
        data-scroll-sticky-top="24"
        @update-active="updateActive" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { startWithZero } from '~/utils'
import { transitionShuffleIn, transitionShuffleOut } from '~/utils/animations'
import type { HomepageServices } from '~/types/wordpress/homepage'

defineProps<{
  data: HomepageServices
}>()

const active = ref<number>(0)

function updateActive(i: number) {
  active.value = i + 1
}
</script>

<style lang="scss">
.home__services {
  position: relative;
  background-color: var(--light-grey);
  padding: 4rem 0 0;

  &__index {
    position: absolute;
    width: max-content;
    display: flex;
    align-items: center;
    column-gap: 0.8rem;
    padding-top: 6rem;
    @include will-fade;
    @include t-number;
  }

  &__title {
    @include t-seo;
  }

  &__hint {
    @include grid;

    &__label {
      padding-top: 2rem;
      padding-bottom: 2rem;
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

    &__active {
      position: absolute;
      z-index: 2;
      top: 0;
      margin-left: var(--layout-margin);
      padding-top: 5.4rem;

      &__item {
        position: relative;

        @include will-fade;
        @include t-number;

        &--active {
          opacity: 1;
        }

        &:not(:first-child) {
          position: absolute;
        }
      }
    }
  }
}
</style>
