<template>
  <div ref="el" class="home__about__testimonials">
    <div class="home__about__testimonials__intersect" v-intersect="{ callback: onIntersect }" />
    <div
      ref="contentEl"
      class="home__about__testimonials__content"
      @mouseenter="onMouseEnter"
      @mouseleave="onMouseLeave">
      <HomeAboutTestimonialsTestimonial v-for="testimonial in data" :data="testimonial" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { gsap } from 'gsap'
import useStore from '~/store/useStore'
import useScrollStore from '~/store/useScrollStore'
import type { Testimonials } from '~/types/wordpress/testimonial'
import { storeToRefs } from 'pinia'

const props = defineProps<{
  data: Testimonials
}>()

const store = useStore()
const { updateCursor, updateSection } = store
const { cursor, section } = storeToRefs(store)
const { direction } = storeToRefs(useScrollStore())
const { vw } = useResize()
const { x: mouseX } = useMouse()
const { init, swipeLeft, swipeRight } = useSwipe({})

const el = ref<HTMLElement>()
const contentEl = ref<HTMLElement>()

const x = ref<number>(0)
const active = ref<number>(0)

watch(x, () => {
  const items = contentEl.value?.querySelectorAll('.home__about__testimonials__testimonial')
  items?.length && gsap.set(items, { x: x.value })
})

watch(active, () => {
  const item = el.value?.querySelectorAll('.home__about__testimonials__testimonial')[active.value]
  if (!contentEl.value || !item) return
  const { left } = item.getBoundingClientRect()
  const { left: parentLeft } = contentEl.value.getBoundingClientRect()
  const dif = left - parentLeft
  gsap.to(x, { value: x.value - dif })
})

watch(section, () => {
  section.value === 'about-testimonials'
    ? fadeIn({ el: el.value, delay: 0.2 })
    : fadeOut({ el: el.value })
})

watch(swipeRight, () => {
  active.value = Math.max(0, active.value - 1)
})

watch(swipeLeft, () => {
  active.value = Math.min(props.data.length - 1, active.value + 1)
})

watch(mouseX, () => {
  if (section.value === 'about-testimonials' && cursor.value !== 'default') {
    mouseX.value > vw.value * 0.5 ? updateCursor('arrow-right') : updateCursor('arrow-left')
  }
})

onMounted(() => {
  el.value && init({ el: el.value, cursor: true })
})

function onIntersect(el: HTMLElement, visible: boolean) {
  if (visible) updateSection('about-testimonials')
  else if (direction.value === 'up') updateSection('about')
}

function onMouseEnter() {
  mouseX.value > vw.value * 0.5 ? updateCursor('arrow-right') : updateCursor('arrow-left')
}

function onMouseLeave() {
  updateCursor('default')
}
</script>

<style lang="scss">
.home__about__testimonials {
  position: relative;
  overflow: var(--overflow--hidden);
  @include will-fade;

  &__content {
    max-width: var(--layout-max-width);
    margin: auto;
    padding: 12rem 0;
    white-space: nowrap;
    will-change: transform;
    .home__about__testimonials__testimonial {
      display: inline-block;
      vertical-align: top;
      white-space: normal;
      // margin-right: var(--layout-gutter);
    }
  }

  &__intersect {
    position: absolute;
    top: calc(var(--vh) * 0.5);
    left: 0;
    width: 100%;
    height: 1px;
  }
}
</style>
