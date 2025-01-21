<template>
  <div
    :class="[
      'home__about__testimonials__testimonial',
      { 'home__about__testimonials__testimonial--active': active },
      { 'home__about__testimonials__testimonial--expanded': isExpanded },
    ]">
    <div class="home__about__testimonials__testimonial__quote">
      <SvgQuote v-if="!isMobileLayout" :data-pos="pos" />
      <p
        ref="quoteEl"
        :class="[
          'home__about__testimonials__testimonial__quote__label',
          { 'home__about__testimonials__testimonial__quote__label--expanded': isExpanded },
        ]"
        :data-pos="pos"
        @mouseenter="onLabelMouseEnter"
        @mouseleave="onLabelMouseLeave">
        {{ data.quote }}
      </p>
    </div>
    <ClientOnly>
      <button
        v-if="isMobileLayout && !isExpanded && isExpandible"
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
      <ClientOnly>
        <p class="home__about__testimonials__testimonial__credit__role" v-html="credit" />
      </ClientOnly>
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
const { onResize } = useResize()

const credit = computed<string>(() => {
  return isMobileLayout.value ? props.data.credit.replace(/@/g, '<br>@') : props.data.credit
})

const isExpanded = ref<boolean>(false)
const isExpandible = ref<boolean>(true)

const quoteEl = ref<HTMLElement>()

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

watch(onResize, updateSize)

onMounted(() => {
  updateSize()
})

function toggle() {
  isExpanded.value = !isExpanded.value
}

function updateSize() {
  if (quoteEl.value) {
    const { clientHeight, scrollHeight } = quoteEl.value
    isExpandible.value = Math.abs(clientHeight - scrollHeight) > 1
  }
}

function onLabelMouseEnter() {
  emit('update:hover', {
    pos: props.pos,
    value: true,
    dir: 0,
  })
}

function onLabelMouseLeave(e: MouseEvent) {
  const { left } = quoteEl.value?.getBoundingClientRect() || { left: 0 }
  emit('update:hover', {
    pos: props.pos,
    value: false,
    dir: e.clientX < left ? -1 : 1,
  })
}

const emit = defineEmits(['update:expanded', 'update:hover'])
</script>

<style lang="scss">
.home__about__testimonials__testimonial {
  position: relative;
  width: calc(var(--layout-column-width) * 7 + var(--layout-gutter) * 7);
  padding-left: var(--layout-margin);
  padding-right: var(--layout-gutter);

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
        top: 0.1rem;
        left: 0;
        margin: 0;
        transform: translate(calc(-100% - var(--layout-gutter)), -5%);
      }
    }

    &__label {
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      line-clamp: 8;
      -webkit-line-clamp: 8;
      -webkit-box-orient: vertical;
      padding-bottom: toScale(1rem);
      will-change: opacity;
      @include t-h2;

      @include from__tablet--landscape {
        line-clamp: 5;
        -webkit-line-clamp: 5;
      }

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
    // font-family: 'HelveticaNowDisplayBold' !important;
    margin: toScale(1.2rem, 37.5rem) auto toScale(1.2rem, 37.5rem);
    @include t-black;
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

    br {
      display: none;
      @include from__tablet--landscape {
        display: block;
      }
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
