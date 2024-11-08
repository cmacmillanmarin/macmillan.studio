<template>
  <div
    :class="[
      'home__about__testimonials__testimonial',
      { 'home__about__testimonials__testimonial--active': active },
      { 'home__about__testimonials__testimonial--expanded': isExpanded },
    ]">
    <div class="home__about__testimonials__testimonial__quote">
      <SvgQuote :data-pos="pos" />
      <p
        :class="[
          'home__about__testimonials__testimonial__quote__label',
          { 'home__about__testimonials__testimonial__quote__label--expanded': isExpanded },
        ]"
        :data-pos="pos">
        {{ data.quote }}
      </p>
    </div>
    <ClientOnly>
      <button
        v-if="isMobileLayout && !isExpanded"
        class="home__about__testimonials__testimonial__read-more"
        @click="toggle">
        Read More
      </button>
    </ClientOnly>
    <div class="home__about__testimonials__testimonial__credit">
      <div class="home__about__testimonials__testimonial__credit__thumbnail">
        <img
          :src="data.thumbnail?.src"
          :alt="data.thumbnail?.alt"
          loading="lazy"
          class="home__about__testimonials__testimonial__credit__thumbnail__image" />
      </div>
      <p class="home__about__testimonials__testimonial__credit__role">{{ data.credit }}</p>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { Testimonial } from '~/types/wordpress/testimonial'

const props = defineProps<{
  pos: number
  data: Testimonial
  active: boolean
  expanded: boolean
}>()

const { isMobileLayout } = useDevice()
const isExpanded = ref<boolean>(false)

watch(
  () => props.active,
  () => {
    isExpanded.value = false
  }
)

watch(
  () => props.expanded,
  () => {
    isExpanded.value = props.expanded
  },
  { immediate: true }
)

watch(isExpanded, () => {
  emit('update:expanded', isExpanded.value)
})

function toggle() {
  isExpanded.value = !isExpanded.value
}

const emit = defineEmits(['update:expanded'])
</script>

<style lang="scss">
.home__about__testimonials__testimonial {
  position: relative;
  width: calc(var(--layout-column-width) * 8 + var(--layout-gutter) * 7 + var(--layout-margin) * 2);
  padding-left: var(--layout-margin);
  padding-right: var(--layout-margin);

  @include from__tablet--landscape {
    width: calc(var(--layout-column-width) * 9 + var(--layout-gutter) * 9);
    padding-left: calc(var(--layout-column-width) + var(--layout-gutter) * 2);
    padding-right: calc(var(--layout-column-width) + var(--layout-gutter));
    border-right: max(0.2rem, toScale(0.2rem)) solid black;
  }

  &:last-child {
    border-right: none;
  }

  &__quote {
    position: relative;

    .svg__quote {
      margin: 0 auto toScale(1.6rem, 37.5rem);
      @include from__tablet--landscape {
        position: absolute;
        top: 0;
        left: 0;
        margin: 0;
        transform: translate(calc(-100% - var(--layout-gutter)), -5%);
      }
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

  &__read-more {
    pointer-events: auto;
    display: block;
    border: none;
    padding: 0;
    width: max-content;
    text-decoration: underline;
    font-family: 'HelveticaNowDisplayBold' !important;
    margin: toScale(1.2rem, 37.5rem) auto toScale(1.2rem, 37.5rem);
    @include t-b1;
  }

  &__credit {
    display: flex;
    align-items: center;
    column-gap: toScale(0.8rem, 37.5rem);
    margin-top: toScale(1.6rem, 37.5rem);

    @include from__tablet--landscape {
      column-gap: toScale(0.8rem);
      margin-top: toScale(2.2rem);
    }

    &__thumbnail {
      position: relative;

      &__image {
        width: toScale(3.2rem, 37.5rem);
        height: toScale(3.2rem, 37.5rem);
        border-radius: 50%;
        object-fit: cover;
        -webkit-filter: grayscale(100%); /* Safari 6.0 - 9.0 */
        filter: grayscale(100%);
        @include from__tablet--landscape {
          width: toScale(4.8rem);
          height: toScale(4.8rem);
        }
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
      @include t-b3;
      @include from__tablet--landscape {
        @include t-b1;
      }
    }
  }
}
</style>
