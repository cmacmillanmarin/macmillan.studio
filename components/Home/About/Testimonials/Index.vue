<template>
  <div ref="el" class="home__about__testimonials">
    <div ref="contentEl" class="home__about__testimonials__content">
      <HomeAboutTestimonialsTestimonial v-for="testimonial in data" :data="testimonial" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { gsap } from 'gsap'
import type { Testimonials } from '~/types/wordpress/testimonial'

const props = defineProps<{
  data: Testimonials
}>()

const { init, swipeLeft, swipeRight } = useSwipe({})

const el = ref<HTMLElement>()
const contentEl = ref<HTMLElement>()

const x = ref<number>(0)
const active = ref<number>(0)

watch(x, () => {
  contentEl.value && gsap.set(contentEl.value, { x: x.value })
})

watch(active, () => {
  const item = el.value?.querySelectorAll('.home__about__testimonials__testimonial')[active.value]
  if (!el.value || !item) return
  const { left } = item.getBoundingClientRect()
  const { left: parentLeft } = el.value.getBoundingClientRect()
  const dif = left - parentLeft
  console.log(dif)
  gsap.to(x, { value: x.value - dif })
})

watch(swipeRight, () => {
  active.value = Math.max(0, active.value - 1)
})

watch(swipeLeft, () => {
  active.value = Math.min(props.data.length - 1, active.value + 1)
})

onMounted(() => {
  el.value && init({ el: el.value, cursor: true })
})
</script>

<style lang="scss">
.home__about__testimonials {
  overflow: var(--overflow--hidden);
  background-color: var(--dark-grey);

  &__content {
    margin: auto;
    max-width: var(--layout-max-width);
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
}
</style>
