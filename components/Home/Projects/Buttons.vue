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
        @click="updateActiveListToSelected"
        :tabindex="landingTabIndex">
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
        @click="updateActiveListToAll"
        :tabindex="landingTabIndex">
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
const { cursor, landingTabIndex } = storeToRefs(store)

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

  transform: translate(-50%, 0%);

  display: flex;
  flex-wrap: wrap;
  flex-direction: column;
  justify-content: center;
  height: var(--vh);

  pointer-events: none;

  @include from__tablet--landscape {
    flex-wrap: nowrap;
    flex-direction: row;
    align-items: center;
    justify-content: space-around;
  }

  &__button {
    width: max-content;
    width: 100%;
    border: none;
    pointer-events: auto;
    @include will-fade;

    &:first-child {
      align-self: flex-end;
      @include from__tablet--landscape {
        align-self: center;
      }
    }

    &:last-child {
      align-self: flex-start;
      @include from__tablet--landscape {
        align-self: center;
      }
    }

    @include from__tablet--landscape {
      width: toScale(40rem);
    }

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
        transform: translate(calc(-100% - toScale(0.4rem, 37.5rem)), -50%);
        @include will-fade;
        @include from__tablet--landscape {
          transform: translate(calc(-100% - toScale(0.6rem)), -50%);
        }
      }

      &__count {
        position: absolute;
        transform: translate(toScale(0.4rem, 37.5rem), toScale(0rem, 37.5rem));
        @include t-number-small;
        @include from__tablet--landscape {
          transform: translate(toScale(0.6rem), toScale(-0.4rem));
        }
      }
    }
  }

  &__separator {
    width: 100%;
    height: calc(toColumns(6) * 7 / 5 + toScale(1.2rem, 37.5rem));
    @include from__tablet--landscape {
      width: 0;
      height: 0;
    }
  }
}
</style>
