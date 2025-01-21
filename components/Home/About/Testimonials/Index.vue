<template>
  <div ref="el" class="home__about__testimonials">
    <div class="home__about__testimonials__intersect" v-intersect="{ callback: onIntersect }" />
    <div v-if="isMobileLayout" class="home__about__testimonials__mobile-quote">
      <SvgQuote />
    </div>

    <div
      class="home__about__testimonials__container"
      @mouseenter="onMouseEnter"
      @mouseleave="onMouseLeave"
      @click="onClick">
      <div ref="contentEl" class="home__about__testimonials__container__content">
        <HomeAboutTestimonialsTestimonial
          v-for="(testimonial, i) in data"
          :pos="i"
          :data="testimonial"
          :active="activeEntered === i"
          :expanded="expanded && active === i"
          @update:hover="onTestimonialHoverUpdate"
          @update:expanded="updateScroll" />
      </div>
    </div>

    <div class="home__about__testimonials__indicator">
      <!-- <ClientOnly>
        <button
          v-if="isMobileLayout"
          class="home__about__testimonials__indicator__button--prev"
          @click="prev"
          :tabindex="landingTabIndex">
          <SvgPixelArrow />
        </button>
      </ClientOnly> -->

      <div class="home__about__testimonials__indicator__index">
        <p
          class="home__about__testimonials__indicator__index__label"
          v-text="`{${startWithZero(active + 1)}—${startWithZero(data.length)}}`" />
      </div>

      <!-- <ClientOnly>
        <button
          v-if="isMobileLayout"
          class="home__about__testimonials__indicator__button"
          @click="next"
          :tabindex="landingTabIndex">
          <SvgPixelArrow />
        </button>
      </ClientOnly> -->

      <div class="home__about__testimonials__indicator__buttons">
        <button
          v-for="i in data.length"
          :aria-label="`Go to testimonial ${i}`"
          :class="[
            'home__about__testimonials__indicator__buttons__button',
            { 'home__about__testimonials__indicator__buttons__button--active': i - 1 === active },
          ]"
          @click="updateActive(i - 1)"
          @mouseenter="onButtonMouseEnter"
          @mouseleave="onButtonMouseLeave"
          :tabindex="landingTabIndex">
          <SvgSquare />
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { gsap } from 'gsap/gsap-core'
import useStore from '~/store/useStore'
import useScrollStore from '~/store/useScrollStore'
import type { Testimonials } from '~/types/wordpress/testimonial'
import { storeToRefs } from 'pinia'
import { startWithZero } from '~/utils'
import { Swiper } from '~/utils/swiper'

const props = defineProps<{
  data: Testimonials
}>()

const store = useStore()
const { updateCursor, updateCursorPosition, updateSection } = store
const { cursor, section, inReelHovered, landingTabIndex } = storeToRefs(store)
const scrollStore = useScrollStore()
const { updateScroll } = scrollStore
const { direction } = storeToRefs(scrollStore)

const { toScale } = useCss()
const { isMobileLayout } = useDevice()

const el = ref<HTMLElement>()
const contentEl = ref<HTMLElement>()

const x = ref<number>(0)
const active = ref<number>(0)
const activeEntered = ref<number>(0)
const expanded = ref<boolean>(false)
const cursorInTestimonials = ref<boolean>(false)

let _Swiper = new Swiper({ preventLeft: true, preventRight: true, dragOnTarget: true })

watch(x, () => {
  const items = contentEl.value?.querySelectorAll('.home__about__testimonials__testimonial')
  items?.length && gsap.set(items, { x: x.value })
})

watch(active, () => {
  expanded.value = false
  const item = el.value?.querySelectorAll('.home__about__testimonials__testimonial')[active.value]
  if (!contentEl.value || !item) return
  const { left } = item.getBoundingClientRect()
  const { left: parentLeft } = contentEl.value.getBoundingClientRect()
  const dif = left - parentLeft
  gsap.to(x, {
    value: x.value - dif,
    onComplete: () => {
      activeEntered.value = active.value
    },
  })
})

watch(activeEntered, () => {
  if (
    (cursor.value === 'arrow-left' && activeEntered.value === 0) ||
    (cursor.value === 'arrow-right' && activeEntered.value === props.data.length - 1)
  )
    updateCursor('default')
})

watch(section, (to, from) => {
  section.value === 'about-testimonials'
    ? fadeIn({ el: el.value, delay: 0.2 })
    : fadeOut({ el: el.value })
  if (from === 'about-testimonials' && !inReelHovered.value) updateCursor('default')
})

watch(expanded, () => {
  emit('update-expanded', expanded.value)
  updateScroll()
  updateCursor(expanded.value ? 'close' : 'plus')
})

onMounted(() => {
  el.value &&
    isMobileLayout.value &&
    _Swiper.init({ el: el.value, cursor: false, onSwipeLeft, onSwipeRight })
})

function prev() {
  active.value = Math.max(0, active.value - 1)
}

function next() {
  active.value = Math.min(props.data.length - 1, active.value + 1)
}

function onSwipeLeft() {
  next()
}

function onSwipeRight() {
  prev()
}

function onIntersect(el: HTMLElement, visible: boolean) {
  if (visible) updateSection('about-testimonials')
  else if (direction.value === 'up') updateSection('about')
}

function onMouseEnter() {
  cursorInTestimonials.value = true
}

async function onClick(e: MouseEvent) {
  if (cursor.value === 'arrow-right')
    active.value = Math.min(props.data.length - 1, active.value + 1)
  else if (cursor.value === 'arrow-left') active.value = Math.max(0, active.value - 1)
  else if (cursor.value === 'plus') {
    expanded.value = true
  } else if (cursor.value === 'close') {
    expanded.value = false
  }
}

function onButtonMouseEnter(e: MouseEvent) {
  if (inReelHovered.value) return
  const el = e.target as HTMLElement
  const { top, left } = el.getBoundingClientRect()
  updateCursorPosition({ x: left + toScale(4), y: top + toScale(4) })
}

function onButtonMouseLeave(e: MouseEvent) {
  if (inReelHovered.value) return
  updateCursorPosition({ x: -1, y: -1 })
}

function updateActive(n: number) {
  active.value = n
}

function onMouseLeave() {
  cursorInTestimonials.value = false
  !inReelHovered.value && updateCursor('default')
}

async function onTestimonialHoverUpdate(params: { pos: number; value: boolean; dir: number }) {
  await nextTick()
  if (cursorInTestimonials.value) {
    if (params.value) {
      if (params.pos === active.value) updateCursor(expanded.value ? 'close' : 'plus')
      else updateCursor(params.pos > active.value ? 'arrow-right' : 'arrow-left')
    } else {
      if (params.dir === 1 && active.value !== props.data.length - 1) updateCursor('arrow-right')
      else if (params.dir === -1 && active.value !== 0) updateCursor('arrow-left')
      else updateCursor('default')
    }
  }
}

onBeforeUnmount(() => {
  _Swiper.destroy()
})

const emit = defineEmits(['update-expanded'])
</script>

<style lang="scss">
.home__about__testimonials {
  position: relative;
  padding-bottom: toScale(4.8rem, 37.5rem);
  @include will-fade;

  @include from__tablet--landscape {
    padding-bottom: 0;
  }

  &__mobile-quote {
    margin: 0 auto toScale(2rem, 37.5rem);
    svg {
      margin: auto;
    }
  }

  &__container {
    cursor: pointer;
    overflow: var(--overflow--hidden);

    &__content {
      max-width: var(--layout-max-width);
      margin: auto;
      white-space: nowrap;

      .home__about__testimonials__testimonial {
        display: inline-block;
        vertical-align: top;
        white-space: normal;
        will-change: transform;
        // pointer-events: none;

        // &--active {
        //   .home__about__testimonials__testimonial__quote__label {
        //     pointer-events: auto;
        //   }
        // }
      }
    }
  }

  &__indicator {
    max-width: var(--layout-max-width);
    margin: auto;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
    padding: toScale(3.2rem, 37.5rem) var(--layout-margin) 0;

    @include from__tablet--landscape {
      justify-content: space-between;
      padding: toScale(7.2rem) var(--layout-margin) 0;
    }

    &__button {
      position: relative;
      width: toScale(5.6rem, 37.5rem);
      height: toScale(5.6rem, 37.5rem);
      background-color: var(--black);
      border-radius: 100%;
      padding: 0;
      transform: rotate(-90deg);

      &--prev {
        @extend .home__about__testimonials__indicator__button;
        transform: rotate(90deg);
      }

      .svg__pixel-arrow {
        width: toScale(2.4rem, 37.5rem);
        height: toScale(1.6rem, 37.5rem);
        top: 54% !important;
        @include absolute-center;
        path {
          fill: var(--lime);
        }
      }
    }

    &__index {
      width: calc(100% - toScale(11.2rem, 37.5rem));

      @include from__tablet--landscape {
        width: max-content;
        margin-left: calc(var(--layout-column-width) + var(--layout-gutter));
      }

      &__label {
        text-align: center;
        @include t-black;
        @include t-number;
        @include from__tablet--landscape {
          text-align: left;
        }
      }
    }

    &__buttons {
      display: flex;
      column-gap: 0.4rem;
      margin-top: toScale(2.4rem, 37.5rem);

      @include from__tablet--landscape {
        margin-top: 0;
        margin-right: calc(var(--layout-column-width) * 2 + var(--layout-gutter));
        transform: translateX(100%);
      }

      &__button {
        padding: 0.2rem;
        border: 2px solid transparent;

        &--active {
          border: 2px solid black;
        }
      }
    }
  }

  &__intersect {
    position: absolute;
    top: calc(var(--vh) * 0.5);
    left: 0;
    width: 100%;
    height: 1px;
    // background-color: red;
  }
}
</style>
