<template>
  <div class="home__about__testimonials">
    <HomeAboutTestimonialsTestimonial v-for="testimonial in data" :data="testimonial" />
  </div>
</template>

<script lang="ts" setup>
import type { Testimonials } from '~/types/wordpress/testimonial'

defineProps<{
  data: Testimonials
}>()
</script>

<style lang="scss">
.home__about__testimonials {
  padding-top: 12rem;
  padding-bottom: 12rem;
  background-color: var(--dark-grey);
}
</style>
