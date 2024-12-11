<template>
  <div
    ref="el"
    data-scroll-sticky-state="false"
    :class="[
      'home__services__service',
      { 'home__services__service--hidden': hidden },
      { 'home__services__service--no-bg': (i === of && active === i + 1) || active === 0 },
    ]">
    <Separator :left="4" :start="true" />
    <div
      v-if="i === of"
      class="home__services__service__observer--in"
      v-intersect="{ callback: onIntersectIn }" />
    <div class="home__services__service__content">
      <div class="home__services__service__content__title">
        <h3 class="home__services__service__content__title__label">
          {{ data.title }}
        </h3>
      </div>
      <div class="home__services__service__content__description" v-html="data.description" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import useScrollStore from '~/store/useScrollStore'
import type { Service } from '~/types/wordpress/service'

const props = defineProps<{
  i: number
  of: number
  active: number
  data: Service
}>()

const { direction } = storeToRefs(useScrollStore())

const el = ref<HTMLElement>()
const sticky = ref<boolean>(false)
const hidden = computed<boolean>(() => props.active > props.i + 1)

let _observer: MutationObserver | null = null

watch(sticky, () => {
  if (sticky.value) emit('update-active', props.i)
  else if (direction.value === 'up') emit('update-active', props.i - 1)
})

onMounted(() => {
  if (!el.value) return
  _observer = new MutationObserver(mutationsList => {
    for (const mutation of mutationsList) {
      if (mutation.type === 'attributes') {
        sticky.value = el.value?.dataset.scrollStickyState === 'true'
      }
    }
  })
  _observer.observe(el.value, {
    attributes: true,
  })
})

function onIntersectIn(el: HTMLElement, visible: boolean) {
  if (props.active !== 0 && !visible && direction.value === 'down') emit('update-active', props.i)
  else if (visible && direction.value === 'up') emit('update-active', props.i - 1)
}

onBeforeUnmount(() => {
  _observer?.disconnect()
})

const emit = defineEmits<{
  (e: 'update-active', value: number): void
}>()
</script>

<style lang="scss">
.home__services__service {
  position: relative;
  max-width: var(--layout-max-width);
  padding-top: toScale(4rem);
  margin: 0 auto;

  will-change: opacity, transform;

  &--hidden {
    opacity: 0;
  }

  &--no-bg {
    .home__services__service__content {
      background-color: transparent;
      &:after {
        background-color: transparent;
      }
    }
  }

  &:last-child {
    .home__services__service__content {
      padding-bottom: toScale(18rem);
    }
  }

  .separator {
    z-index: 2;
    top: toScale(4rem);
    left: calc(var(--layout-column-width) * 2 + var(--layout-gutter) * 3);
    width: calc(var(--layout-column-width) * 10 + var(--layout-gutter) * 9);
  }

  &__observer {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 1px;
    // background-color: red;

    &--in,
    &--out {
      @extend .home__services__service__observer;
    }
    &--in {
      transform: translateY(toScale(-2.4rem));
    }
    &--out {
      transform: translateY(8.5rem);
    }
  }

  &__content {
    position: relative;
    z-index: 1;

    background-color: var(--light-grey);
    padding-top: toScale(1.2rem, 37.5rem);

    @include grid;

    @include from__tablet--landscape {
      padding-top: toScale(1.2rem);
    }

    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      transform: translateY(100%);
      height: toScale(10.4rem);
      background-color: var(--light-grey);
    }

    &__title {
      @include t-b1;
      @include gap(2, 'left', 'tablet--landscape');
      @include columns(4, 'tablet--landscape');
    }

    &__description {
      @include t-b1;
      @include columns(6, 'tablet--landscape');

      p {
        margin-bottom: toScale(0.8rem);
        &:last-child {
          margin-bottom: 0;
        }
      }
    }
  }
}
</style>
