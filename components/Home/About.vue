<template>
  <div class="home__about" id="about-target" data-scroll-target-top>
    <h2 class="home__about__title">{{ data.title }}</h2>
    <div class="home__about__hint">
      <h3 class="home__about__hint__label">
        <span class="home__about__hint__label__indent" /><span v-html="data.hint" />
      </h3>
    </div>
    <div class="home__about__content">
      <div class="home__about__content__thumbnail">
        <p class="home__about__content__thumbnail__credit">{{ data.credit }}</p>
      </div>
      <div class="home__about__content__detail">
        <p class="home__about__content__detail__text">{{ data.detail }}</p>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { About } from '~/types/data'

defineProps<{
  data: About
}>()
</script>

<style lang="scss">
.home__about {
  padding: 8rem 0 12rem;
  background-color: var(--lime);

  &__title {
    @include t-seo;
  }

  &__hint {
    @include grid;

    &__label {
      @include columns(10, 'desktop');
      @include gap(2, 'left', 'desktop');
      @include t-h2;
      padding-bottom: 8rem;
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

  &__content {
    @include grid;

    &__thumbnail {
      @include columns(2, 'desktop');
      @include gap(2, 'left', 'desktop');
      &__credit {
        @include t-b1;
      }
    }

    &__detail {
      @include columns(6, 'desktop');
      @include gap(2, 'left', 'desktop');
      &__text {
        @include t-b1;
        column-count: 2;
        column-gap: var(--layout-gap);
      }
    }
  }
}
</style>
