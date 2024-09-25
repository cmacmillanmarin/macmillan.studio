<template>
  <div
    :class="[
      'home__about__testimonials__testimonial',
      { 'home__about__testimonials__testimonial--active': active },
      { 'home__about__testimonials__testimonial--expanded': expanded },
    ]">
    <div class="home__about__testimonials__testimonial__quote">
      <SvgQuote :data-pos="pos" />

      <p
        :class="[
          'home__about__testimonials__testimonial__quote__label',
          { 'home__about__testimonials__testimonial__quote__label--expanded': expanded },
        ]"
        :data-pos="pos">
        {{ data.quote }}
      </p>
    </div>
    <div class="home__about__testimonials__testimonial__credit">
      <div class="home__about__testimonials__testimonial__credit__thumbnail">
        <img
          :src="data.thumbnail?.src"
          :alt="data.thumbnail?.alt"
          class="home__about__testimonials__testimonial__credit__thumbnail__image" />
      </div>
      <p class="home__about__testimonials__testimonial__credit__role">{{ data.credit }}</p>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { Testimonial } from '~/types/wordpress/testimonial'

defineProps<{
  pos: number
  data: Testimonial
  active: boolean
  expanded: boolean
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
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      line-clamp: 5;
      -webkit-line-clamp: 5;
      -webkit-box-orient: vertical;
      padding-bottom: toScale(1rem);
      will-change: opacity;
      @include t-h2;

      &--expanded {
        line-clamp: unset;
        -webkit-line-clamp: unset;
      }
    }
  }

  &__credit {
    display: flex;
    align-items: center;
    column-gap: 0.8rem;
    margin-top: toScale(2.2rem);

    &__thumbnail {
      position: relative;

      &__image {
        width: toScale(4.8rem);
        height: toScale(4.8rem);
        border-radius: 50%;
        object-fit: cover;
        -webkit-filter: grayscale(100%); /* Safari 6.0 - 9.0 */
        filter: grayscale(100%);
      }

      &::after {
        content: ' ';
        border-radius: 50%;
        background-color: var(--light-grey);
        mix-blend-mode: multiply;
        @include absolute-fill;
      }
    }

    &__role {
      @include t-b1;
    }
  }
}
</style>
