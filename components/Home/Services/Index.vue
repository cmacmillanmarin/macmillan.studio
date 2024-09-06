<template>
  <div class="home__services" id="services-target" data-scroll-target-top>
    <h2 class="home__services__title">{{ data.title }}</h2>
    <div class="home__services__hint">
      <h3 class="home__services__hint__label">
        <span class="home__services__hint__label__indent" /><span v-html="data.hint" />
      </h3>
    </div>
    <HomeServicesService
      v-for="(service, i) in data.list"
      :index="i"
      :data="service"
      data-scroll-sticky
      data-scroll-sticky-top="24" />
  </div>
</template>

<script lang="ts" setup>
import type { Services } from '~/types/data'

defineProps<{
  data: Services
}>()
</script>

<style lang="scss">
.home__services {
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
          min(100vw, var(--layout-max-width)) - var(--layout-indent) * 2 - var(--layout-gap) * 11
        );
        --column-width: calc(var(--width) / 12);
        width: calc(var(--column-width) * 4 + var(--layout-gap) * 4);
        display: inline-block;
      }
    }
  }
}
</style>
