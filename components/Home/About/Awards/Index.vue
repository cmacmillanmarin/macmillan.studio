<template>
  <div ref="el" class="home__about__awards">
    <div class="home__about__awards__intersect" v-intersect="{ callback: onIntersect }" />
    <p class="home__about__awards__label">Awards</p>
    <p class="home__about__awards__label">Awards</p>
    <p class="home__about__awards__label">Awards</p>
    <p class="home__about__awards__label">Awards</p>
    <p class="home__about__awards__label">Awards</p>
    <p class="home__about__awards__label">Awards</p>
    <p class="home__about__awards__label">Awards</p>
    <p class="home__about__awards__label">Awards</p>
    <p class="home__about__awards__label">Awards</p>
    <p class="home__about__awards__label">Awards</p>
    <p class="home__about__awards__label">Awards</p>
    <p class="home__about__awards__label">Awards</p>
    <p class="home__about__awards__label">Awards</p>
    <p class="home__about__awards__label">Awards</p>
    <p class="home__about__awards__label">Awards</p>
    <p class="home__about__awards__label">Awards</p>
    <p class="home__about__awards__label">Awards</p>
  </div>
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import useStore from '~/store/useStore'
import useScrollStore from '~/store/useScrollStore'

const store = useStore()
const { updateSection } = store
const { section } = storeToRefs(store)
const { direction } = storeToRefs(useScrollStore())

const el = ref<HTMLElement>()

watch(section, () => {
  section.value === 'about-awards'
    ? fadeIn({ el: el.value, delay: 0.2 })
    : fadeOut({ el: el.value })
})

function onIntersect(el: HTMLElement, visible: boolean) {
  if (visible) updateSection('about-awards')
  else if (direction.value === 'up') updateSection('about-testimonials')
}
</script>

<style lang="scss">
.home__about__awards {
  text-align: center;
  position: relative;
  @include will-fade;

  &__intersect {
    position: absolute;
    top: calc(var(--vh) * 0.5);
    left: 0;
    width: 100%;
    height: 1px;
    background-color: red;
  }

  &__label {
    @include t-black;
    @include t-h2;
  }
}
</style>
