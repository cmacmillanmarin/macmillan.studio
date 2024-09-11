<template>
  <div class="home__about__testimonials__testimonial">
    <div class="home__about__testimonials__testimonial__quote">
      <SvgQuote />
      <p class="home__about__testimonials__testimonial__quote__label">{{ data.quote }}</p>
    </div>
    <div class="home__about__testimonials__testimonial__credit">
      <div class="home__about__testimonials__testimonial__credit__thumbnail">
        <div class="home__about__testimonials__testimonial__credit__thumbnail__image" />
      </div>
      <p class="home__about__testimonials__testimonial__credit__role">{{ data.credit }}</p>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { Testimonial } from '~/types/wordpress/testimonial'

defineProps<{
  data: Testimonial
}>()
</script>

<style lang="scss">
.home__about__testimonials__testimonial {
  position: relative;
  width: calc(var(--layout-column-width) * 9 + var(--layout-gutter) * 9);
  padding-left: calc(var(--layout-column-width) + var(--layout-gutter) * 2);
  padding-right: calc(var(--layout-column-width) + var(--layout-gutter));
  border-right: 0.2rem solid black;
  &:last-child {
    border-right: none;
  }

  &__quote {
    position: relative;
    .svg__quote {
      position: absolute;
      top: 0;
      left: 0;
      transform: translate(calc(-100% - var(--layout-gutter)), -5%);
    }
    &__label {
      // line-height: 1.05 !important;
      @include t-h2;
    }
  }
  &__credit {
    display: flex;
    align-items: center;
    column-gap: 0.8rem;
    margin-top: toScale(3.2rem);
    &__thumbnail {
      &__image {
        width: 4.8rem;
        height: 4.8rem;
        border-radius: 50%;
        background-color: black;
      }
    }
    &__role {
      @include t-b1;
    }
  }
}
</style>
