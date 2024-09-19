<template>
  <div class="home__about__gallery__image">
    <div
      class="home__about__gallery__image__content"
      @mouseenter="onMouseEnter"
      @mouseleave="onMouseLeave">
      <p>{{ pos }}</p>
    </div>
    <div ref="creditsEl" class="home__about__gallery__image__credits">🇲🇽 Shot on iPhone 13</div>
  </div>
</template>

<script lang="ts" setup>
import { shuffleElsIn, fadeOut } from '~/utils/animations'

defineProps<{
  pos: number
  columns: number
}>()

const creditsEl = ref<HTMLElement>()

function onMouseEnter() {
  if (!creditsEl.value) return
  shuffleElsIn({ els: [creditsEl.value] })
}

function onMouseLeave() {
  if (!creditsEl.value) return
  fadeOut({ el: creditsEl.value })
}
</script>

<style lang="scss">
.home__about__gallery__image {
  padding-right: var(--layout-gutter);

  &__content {
    width: toColumns(v-bind(columns));
    aspect-ratio: 1;
    background-color: var(--light-grey);
    border-radius: toScale(1.6rem);
    display: flex;
    justify-content: center;
    align-items: center;
    pointer-events: auto;
    @include t-h1;
  }

  &__credits {
    padding: toScale(1.2rem);
    @include will-fade;
    @include t-b2;
  }
}
</style>
