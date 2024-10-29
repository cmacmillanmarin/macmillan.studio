<template>
  <div ref="el" class="home__about__testimonials">
    <div class="home__about__testimonials__intersect" v-intersect="{ callback: onIntersect }" />
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
          @mouseenter="onTestimonialMouseEnter"
          @mouseleave="onTestimonialMouseLeave" />
      </div>
    </div>

    <div class="home__about__testimonials__indicator">
      <div class="home__about__testimonials__indicator__index">
        <p
          class="home__about__testimonials__indicator__index__label"
          v-text="`{${startWithZero(active + 1)}—${startWithZero(data.length)}}`" />
      </div>
      <div class="home__about__testimonials__indicator__buttons">
        <button
          v-for="i in data.length"
          :aria-label="`Go to testimonial ${i}`"
          :class="[
            'home__about__testimonials__indicator__buttons__button',
            { 'home__about__testimonials__indicator__buttons__button--active': i - 1 === active },
          ]"
          @click="updateActive(i - 1)">
          <SvgSquare />
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { gsap } from 'gsap'
import useStore from '~/store/useStore'
import useScrollStore from '~/store/useScrollStore'
import type { Testimonials } from '~/types/wordpress/testimonial'
import { storeToRefs } from 'pinia'
import { startWithZero } from '~/utils'

const props = defineProps<{
  data: Testimonials
}>()

const store = useStore()
const { updateCursor, updateSection } = store
const { cursor, section } = storeToRefs(store)
const scrollStore = useScrollStore()
const { updateScroll } = scrollStore
const { direction } = storeToRefs(scrollStore)
const { vw } = useResize()
const { x: mouseX } = useMouse()

// const { init, swipeLeft, swipeRight } = useSwipe({})

const el = ref<HTMLElement>()
const contentEl = ref<HTMLElement>()

const x = ref<number>(0)
const active = ref<number>(0)
const activeEntered = ref<number>(0)
const expanded = ref<boolean>(false)

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

watch(section, (to, from) => {
  section.value === 'about-testimonials'
    ? fadeIn({ el: el.value, delay: 0.2 })
    : fadeOut({ el: el.value })
  if (from === 'about-testimonials') updateCursor('default')
})

watch(expanded, () => {
  onTestimonialMouseEnter()
  updateScroll()
  emit('update-expanded', expanded.value)
  // updateCarouselCursor()
})

// watch(swipeRight, () => {
//   active.value = Math.max(0, active.value - 1)
// })

// watch(swipeLeft, () => {
//   active.value = Math.min(props.data.length - 1, active.value + 1)
// })

watch(mouseX, () => {
  if (
    section.value === 'about-testimonials' &&
    cursor.value !== 'default' &&
    cursor.value !== 'plus' &&
    cursor.value !== 'close'
  ) {
    updateCarouselCursor()
  }
})

onMounted(() => {
  // el.value && init({ el: el.value, cursor: true })
})

function onIntersect(el: HTMLElement, visible: boolean) {
  if (visible) updateSection('about-testimonials')
  else if (direction.value === 'up') updateSection('about')
}

function onMouseEnter() {
  cursor.value === 'default' && updateCarouselCursor()
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

function updateActive(n: number) {
  active.value = n
}

function onMouseLeave() {
  updateCursor('default')
}

function onTestimonialMouseEnter() {
  updateCursor(expanded.value ? 'close' : 'plus')
}

function onTestimonialMouseLeave() {
  updateCarouselCursor()
}

function updateCarouselCursor() {
  if (active.value === 0) updateCursor('arrow-right')
  else if (active.value === props.data.length - 1) updateCursor('arrow-left')
  else mouseX.value > vw.value * 0.5 ? updateCursor('arrow-right') : updateCursor('arrow-left')
}

const emit = defineEmits(['update-expanded'])
</script>

<style lang="scss">
.home__about__testimonials {
  position: relative;
  @include will-fade;

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
        pointer-events: none;

        &--active {
          .home__about__testimonials__testimonial__quote__label {
            pointer-events: auto;
          }
        }
      }
    }
  }

  &__indicator {
    max-width: var(--layout-max-width);
    margin: auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: toScale(7.2rem) var(--layout-margin) 0;

    &__index {
      margin-left: calc(var(--layout-column-width) + var(--layout-gutter));

      &__label {
        @include t-black;
        @include t-number;
      }
    }

    &__buttons {
      display: flex;
      column-gap: 0.4rem;
      margin-right: calc(var(--layout-column-width) + var(--layout-gutter));

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
