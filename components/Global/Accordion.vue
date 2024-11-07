<template>
  <div :class="['accordion', { 'accordion--first': first }]">
    <button
      :class="['accordion__title', { 'accordion__title--open': open }]"
      :aria-label="`${open ? 'Close' : 'Open'} ${title} accordion`"
      @click="toggle">
      <p class="accordion__title__label">{{ title }}</p>
      <SvgPlaySmall />
    </button>
    <div
      v-if="open"
      :class="['accordion__content', { 'accordion__content--animated': animated }]"
      v-transition:in="{ callback: animated ? shuffleIn : () => {} }">
      <div v-if="html" class="accordion__content__html" v-html="content" />
      <p v-else class="accordion__content__label">{{ content }}</p>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { shuffleIn } from '~/utils/animations'

const props = defineProps<{
  title: string
  content: string
  html?: boolean
  first?: boolean
  open?: boolean
  animation?: boolean
}>()

const open = ref<boolean>(!!props.open)
const animated = ref<boolean>(!!props.animation)

function toggle() {
  open.value = !open.value
  animated.value = true
}
</script>

<style lang="scss">
.accordion {
  position: relative;
  border-bottom: 0.2rem solid black;

  &--first {
    border-top: 0.2rem solid black;
  }

  &__title {
    height: 4rem;
    border: none;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    @include t-b3;

    .svg__play--small {
      width: 1.2rem;
      transform: rotate(90deg) translateY(0.4rem);
      path {
        fill: var(--black);
      }
    }

    &--open {
      .svg__play--small {
        transform: rotate(-90deg) translateY(-0.4rem);
      }
    }
  }
  &__content {
    padding-bottom: 1.6rem;
    &--animated {
      @include will-fade;
    }
    &__html,
    &__label {
      @include t-b2;
    }
  }
}
</style>
