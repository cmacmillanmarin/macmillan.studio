<template>
  <div :class="['accordion', { 'accordion--first': first }]" @mouseleave="onMouseLeave">
    <div
      ref="buttonEl"
      :class="['accordion__title', { 'accordion__title--open': open }]"
      :aria-label="`${open ? 'Close' : 'Open'} ${title} accordion`"
      @click="toggle"
      @mouseenter="onMouseEnter"
      tabindex="-1">
      <div class="accordion__title__content">
        <p
          v-if="number"
          class="accordion__title__content__number"
          v-text="`{${startWithZero(number)}}`" />
        <p class="accordion__title__content__label">{{ title }}</p>
      </div>
      <button
        class="accordion__title__content__button"
        :aria-label="`${open ? 'Close' : 'Open'} ${title} accordion`">
        <SvgPlaySmall />
      </button>
    </div>
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
import { gsap } from 'gsap/gsap-core'
import useStore from '~/store/useStore'
import useScrollStore from '~/store/useScrollStore'
import { startWithZero } from '~/utils'
import { shuffleIn } from '~/utils/animations'

const props = defineProps<{
  title: string
  content: string
  html?: boolean
  first?: boolean
  open?: boolean
  animation?: boolean
  number?: number
}>()

const store = useStore()
const { updateCursorPosition } = store

const scrollStore = useScrollStore()
const { updateScroll } = scrollStore

const { toScale } = useCss()

const open = ref<boolean>(!!props.open)
const animated = ref<boolean>(!!props.animation)

const buttonEl = ref<HTMLElement>()

watch(open, async () => {
  await nextTick()
  emit('toggle')
  updateScroll()
  await nextTick()
  updateMousePosition()
})

function toggle(e?: MouseEvent) {
  e?.preventDefault()
  e?.stopPropagation()
  open.value = !open.value
  animated.value = true
}

function onMouseEnter(e: MouseEvent) {
  updateMousePosition()
}

function updateMousePosition() {
  if (buttonEl.value) {
    const { top, left } = buttonEl.value.getBoundingClientRect()
    updateCursorPosition({ x: left - toScale(18), y: top + toScale(14) })
    const svgEl = buttonEl.value.querySelector('.svg__play--small')
    const pathEl = buttonEl.value.querySelector('path')
    pathEl && gsap.set(pathEl, { opacity: 0 })
    svgEl && shuffleIn({ el: svgEl as HTMLElement })
  }
}

function onMouseLeave(e: MouseEvent) {
  updateCursorPosition({ x: -1, y: -1 })
}

const emit = defineEmits(['toggle'])

defineExpose({ toggle, open })
</script>

<style lang="scss">
.accordion {
  position: relative;
  border-bottom: 0.2rem solid black;

  &--first {
    border-top: 0.2rem solid black;
  }

  &__title {
    height: toScale(4rem, 37.5rem);
    border: none;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;

    @include from__tablet--landscape {
      height: toScale(4rem);
    }

    &__content {
      display: flex;
      align-items: center;

      &__number {
        width: calc(var(--layout-column-width) * 2 + var(--layout-gutter) * 2);
        text-align: left;
        @include t-black;
        @include t-number;
      }

      &__label {
        @include t-black;
        @include t-b3;
      }
    }

    button {
      padding: 0;
      border: none;
      width: max-content;
      transform: rotate(90deg) translateY(24%);
      .svg__play--small {
        path {
          will-change: opacity;
          fill: var(--black);
        }
      }
    }

    &--open {
      button {
        transform: rotate(-90deg) translateY(-24%);
      }
    }
  }

  &__content {
    padding-bottom: toScale(1.6rem, 37.5rem);
    @include from__tablet--landscape {
      padding-bottom: toScale(1.6rem);
    }

    &--animated {
      @include will-fade;
    }

    &__html,
    &__label {
      @include t-b2;
    }

    &__html {
      p {
        margin-bottom: toScale(0.4rem, 37.5rem);
        @include from__tablet--landscape {
          margin-bottom: toScale(0.8rem);
        }
        &:last-child {
          margin-bottom: 0;
        }
      }
    }
  }
}
</style>
