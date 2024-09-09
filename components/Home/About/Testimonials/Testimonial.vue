<template>
  <div class="home__about__testimonials__testimonial">
    <SvgQuote />
    <p class="home__about__testimonials__testimonial__quote">{{ data.quote }}</p>
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
  &__quote {
    @include t-h2;
  }
  &__credit {
    display: flex;
    align-items: center;
    column-gap: 0.8rem;
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
