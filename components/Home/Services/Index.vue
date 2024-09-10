<template>
  <div class="home__services" id="services-target" data-scroll-target-top>
    <h2 class="home__services__title">{{ data.title }}</h2>
    <div class="home__services__hint">
      <h3 class="home__services__hint__label">
        <span class="home__services__hint__label__indent" /><span v-html="data.hint" />
      </h3>
    </div>
    <div class="home__services__list">
      <div data-scroll-sticky data-scroll-sticky-top="24" class="home__services__list__active">
        <p
          v-for="i in data.list.length"
          :class="[
            'home__services__list__active__item',
            { 'home__services__list__active__item--active': active === i },
          ]"
          v-text="`{0${i}}`" />
      </div>
      <HomeServicesService
        v-for="(service, i) in data.list"
        :index="i"
        :data="service"
        data-scroll-sticky
        data-scroll-sticky-top="24" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { HomepageServices } from '~/types/wordpress/homepage'

defineProps<{
  data: HomepageServices
}>()

const active = ref<number>(1)
</script>

<style lang="scss">
.home__services {
  position: relative;
  background-color: var(--light-grey);
  padding: 4rem 0 0;

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
        &:not(:first-child) {
          position: absolute;
        }
        @include t-number;
        @include will-fade;
        &--active {
          opacity: 1;
        }
      }
    }
  }
}
</style>
