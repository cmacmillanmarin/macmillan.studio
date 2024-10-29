<template>
  <div class="home__projects__buttons" data-scroll-sticky>
    <transition
      mode="out-in"
      :css="false"
      :appear="true"
      @before-enter="prepareFadeIn"
      @enter="transitionShuffleIn"
      @leave="transitionShuffleOut">
      <button
        v-if="indicators"
        :class="[
          'home__projects__buttons__button',
          { 'home__projects__buttons__button--active': activeList === 'selected' },
        ]"
        @mouseenter="onButtonMouseEnter"
        @click="updateActiveListToSelected">
        <span class="home__projects__buttons__button__label">
          <transition
            mode="out-in"
            :css="false"
            :appear="true"
            @before-enter="prepareFadeIn"
            @enter="transitionShuffleIn"
            @leave="transitionShuffleOut">
            <SvgSquare v-if="activeList === 'selected'" />
          </transition>
          <span class="home__projects__buttons__button__label__el">Selected projects</span>
          <span
            class="home__projects__buttons__button__label__count"
            v-html="`{${startWithZero(selectedProjects)}}`" />
        </span>
      </button>
    </transition>
    <div class="home__projects__buttons__separator" />
    <transition
      mode="out-in"
      :css="false"
      :appear="true"
      @enter="transitionShuffleIn"
      @leave="transitionShuffleOut">
      <button
        v-if="indicators"
        :class="[
          'home__projects__buttons__button',
          { 'home__projects__buttons__button--active': activeList === 'all' },
        ]"
        @mouseenter="onButtonMouseEnter"
        @click="updateActiveListToAll">
        <span class="home__projects__buttons__button__label">
          <transition
            mode="out-in"
            :css="false"
            :appear="true"
            @before-enter="prepareFadeIn"
            @enter="transitionShuffleIn"
            @leave="transitionShuffleOut">
            <SvgSquare v-if="activeList === 'all'" />
          </transition>
          <span class="home__projects__buttons__button__label__el">All projects</span>
          <span
            class="home__projects__buttons__button__label__count"
            v-html="`{${startWithZero(projects)}}`" />
        </span>
      </button>
    </transition>
  </div>
</template>

<script lang="ts" setup>
import { gsap } from 'gsap'
import { storeToRefs } from 'pinia'
import useStore from '~/store/useStore'

defineProps<{
  activeList: 'selected' | 'all'
  indicators: boolean
  projects: number
  selectedProjects: number
}>()

const store = useStore()

const { cursor } = storeToRefs(store)

function updateActiveListToSelected(e: MouseEvent) {
  if (cursor.value === 'plus') return
  e.preventDefault()
  e.stopPropagation()
  emit('update-list', 'selected')
}

function updateActiveListToAll(e: MouseEvent) {
  if (cursor.value === 'plus') return
  e.preventDefault()
  e.stopPropagation()
  emit('update-list', 'all')
}

function onButtonMouseEnter(e: MouseEvent) {
  const el = e.target as HTMLElement
  if (!el || el.classList.contains('clicked')) return
  const labelEl = el.querySelector('.home__projects__buttons__button__label__el')
  if (labelEl) {
    gsap.set(labelEl, { opacity: 0 })
    shuffleElsIn({ els: [labelEl] })
  }
}

const emit = defineEmits(['update-list'])
</script>

<style lang="scss">
.home__projects__buttons {
  z-index: 9;
  position: absolute;
  top: 0;
  left: 50%;
  width: 100vw;
  max-width: var(--layout-max-width);
  transform: translate(-50%, 0);
  height: var(--vh);
  display: flex;
  justify-content: space-around;
  align-items: center;
  pointer-events: none;

  &__button {
    width: max-content;
    width: toScale(40rem);
    border: none;
    @include will-fade;
    pointer-events: auto;

    &--active {
      pointer-events: none;
    }

    &__label {
      position: relative;
      @include t-black;
      @include t-b1;

      &__el {
        will-change: opacity;
      }

      .svg__square {
        position: absolute;
        top: 50%;
        left: 0;
        transform: translate(calc(-100% - 0.4rem), -50%);
      }

      &__count {
        position: absolute;
        transform: translate(0.8rem, -0.4rem);
        @include t-b4;
      }
    }
  }
}
</style>
