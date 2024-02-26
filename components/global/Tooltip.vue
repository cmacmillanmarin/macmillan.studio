<template>
  <button
    ref="buttonEl"
    class="c-tooltip"
    aria-label="Tooltip"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
    @click="onClick">
    <SvgTooltip class="c-tooltip__icon" />
  </button>
  <Teleport to=".__layout__tooltip-dialog">
    <transition @before-enter="prepareEnter" @enter="transitionFadeIn" @leave="transitionFadeOut">
      <div v-if="active" class="c-tooltip__content will-fade">
        <div v-show="!isDesktop" class="c-tooltip__content__title">
          <p class="t-h4 t-burgundy">{{ title }}</p>
          <SvgClose @click="close" />
        </div>
        <div class="t-b3 t-burgundy" v-html="content" />
      </div>
    </transition>
  </Teleport>
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import { transitionFadeIn, transitionFadeOut } from '~/utils/animations'
import useScrollStore from '~/store/useScrollStore'

defineProps<{
  title?: string
  content: string
}>()

const { scrollPosition } = storeToRefs(useScrollStore())

const { touch, isDesktop } = useDevice()

const active = ref<boolean>(false)
const buttonEl = ref<HTMLElement>()

watch(scrollPosition, close)

function onClick(e: MouseEvent): void {
  if (touch.value) {
    e.preventDefault()
    e.stopPropagation()
    active.value = !active.value
  }
}

function onMouseEnter(): void {
  if (touch.value) return
  active.value = true
}

function onMouseLeave(): void {
  if (touch.value) return
  active.value = false
}

function close(): void {
  active.value = false
}

function prepareEnter(el: Element): void {
  if (!buttonEl.value || !isDesktop.value) return
  const { top, left } = buttonEl.value.getBoundingClientRect()
  gsap.set(el, { top, left })
}
</script>

<style lang="scss">
.c-tooltip {
  position: absolute;
  top: 0;
  right: 0;
  transform: translate(calc(100% + var(--xs)), 0%);
  border: none;
  border-radius: 100%;
  margin: 0;
  padding: 0;
  width: max-content;

  &__icon {
    display: block;
  }

  &__content {
    position: absolute;
    z-index: 1;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);

    border-radius: var(--border-radius--l);
    background: var(--white);
    box-shadow: 0px 0px 8px 0px rgba(51, 51, 51, 0.18);
    width: 25.4rem;
    padding: 1.2rem 1.6rem;

    @include from__desktop {
      transform: translate(-50%, 3.2rem);
    }

    &__title {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 0.4rem;
      margin-bottom: 0.8rem;
      .c-svg-close {
        width: 1.7rem;
        min-width: 1.7rem;
        path {
          stroke: var(--burgundy);
        }
      }
    }
  }
}
</style>
