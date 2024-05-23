<template>
  <div class="home__services__service">
    <div class="home__services__service__indicator">
      <div class="home__services__service__indicator__dot" />
    </div>
    <div class="home__services__service__content">
      <div class="home__services__service__content__number">
        <p class="home__services__service__content__number__label" v-text="`{0${index + 1}}`" />
      </div>
      <div class="home__services__service__content__title">
        <h3 class="home__services__service__content__title__label">{{ data.title }}</h3>
      </div>
      <div class="home__services__service__content__description">
        <p class="home__services__service__content__description__label">{{ data.description }}</p>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { Service } from '~/types/data'

defineProps<{
  index: number
  data: Service
}>()
</script>

<style lang="scss">
.home__services__service {
  position: relative;
  width: var(--layout-max-width);
  padding-top: 6.4rem;
  margin: auto;

  &__indicator {
    --width: calc(
      min(100vw, var(--layout-max-width)) - var(--layout-indent) * 2 - var(--layout-gap) * 11
    );
    --column-width: calc(var(--width) / 12);

    position: absolute;
    top: 6.4rem;
    left: calc(var(--column-width) * 2 + var(--layout-gap) * 3);
    width: calc(var(--column-width) * 10 + var(--layout-gap) * 9);
    border-top: 1px solid black;

    &__dot {
      position: absolute;
      top: 0;
      left: 0;
      width: 0.8rem;
      height: 0.8rem;
      background-color: black;
      transform: translate(0, -100%);
    }
  }

  &__content {
    @include grid;
    background-color: grey;
    padding-top: 2rem;
    padding-bottom: 4rem;

    &__number {
      @include columns(2, 'desktop');
      @include t-number;
    }
    &__title {
      @include columns(4, 'desktop');
      @include t-b1;
    }
    &__description {
      @include columns(6, 'desktop');
      @include t-b1;
    }
  }
}
</style>
