<template>
  <div class="landing__service">
    <div class="landing__service__indicator">
      <div class="landing__service__indicator__dot" />
    </div>
    <div class="landing__service__content">
      <div class="landing__service__content__number">
        <p class="landing__service__content__number__label" v-text="`{${index}}`" />
      </div>
      <div class="landing__service__content__title">
        <h3 class="landing__service__content__title__label">{{ data.title }}</h3>
      </div>
      <div class="landing__service__content__description">
        <p class="landing__service__content__description__label">{{ data.description }}</p>
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
.landing__service {
  position: relative;
  padding-top: 6.4rem;

  &__indicator {
    position: absolute;
    top: 6.4rem;
    left: 0;
    width: 100%;
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
    }
    &__title {
      @include columns(4, 'desktop');
      @include t-b1;
    }
    &__description {
      @include columns(6, 'desktop');
      @include t-b2;
    }
  }
}
</style>
