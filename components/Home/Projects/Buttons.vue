<template>
  <div ref="el" class="home__projects__buttons">
    <transition
      mode="out-in"
      :css="false"
      :appear="true"
      @before-enter="prepareFadeIn"
      @enter="transitionShuffleIn"
      @leave="transitionShuffleOut">
      <button
        v-if="indicators"
        class="home__projects__buttons__button"
        @mouseenter="onButtonMouseEnter"
        @mouseleave="onButtonMouseLeave"
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
          <span class="home__projects__buttons__button__label__el">Selected Projects</span>
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
        class="home__projects__buttons__button"
        @mouseenter="onButtonMouseEnter"
        @mouseleave="onButtonMouseLeave"
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
          <span class="home__projects__buttons__button__label__el">All Projects</span>
          <span
            class="home__projects__buttons__button__label__count"
            v-html="`{${startWithZero(projects)}}`" />
        </span>
      </button>
    </transition>
  </div>
</template>

<script lang="ts" setup>
import { gsap } from 'gsap/gsap-core'
import { storeToRefs } from 'pinia'
import useStore from '~/store/useStore'

const props = defineProps<{
  activeList: 'selected' | 'all'
  indicators: boolean
  projects: number
  selectedProjects: number
}>()

const store = useStore()
const { cursor, landingTabIndex } = storeToRefs(store)
const { updateCursor, updateCursorPosition } = store

const { toScale } = useCss()

const el = ref<HTMLElement>()

watch(
  () => props.indicators,
  () => {
    if (!props.indicators) {
      emit('button-hover', false)
      updateCursorPosition({ x: -1, y: -1 })
    }
  }
)

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
  emit('button-hover', true)
  updateCursor('default')
  const el = e.target as HTMLElement
  if (!el || el.classList.contains('clicked')) return
  const labelEl = el.querySelector('.home__projects__buttons__button__label__el')

  if (labelEl) {
    const { left, top } = labelEl.getBoundingClientRect()
    updateCursorPosition({ x: left - toScale(18), y: top + toScale(8) })
    gsap.set(labelEl, { opacity: 0 })
    shuffleElsIn({ els: [labelEl] })
  }
}

function onButtonMouseLeave(e: MouseEvent) {
  emit('button-hover', false)
  updateCursorPosition({ x: -1, y: -1 })
}

const emit = defineEmits(['update-list', 'button-hover'])

defineExpose({
  el,
})
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
    width: 100%;
    border: none;
    -webkit-tap-highlight-color: rgba(0, 0, 0, 0);

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

    &__label {
      display: block;
      pointer-events: auto;
      position: relative;
      width: max-content;
      margin: auto;

      &__el {
        display: block;
        width: max-content;
        color: var(--dark-grey);
        position: relative;
        will-change: opacity;
        font-family: 'HelveticaNowDisplayBold' !important;
        @include t-b1;
      }

      .svg__square {
        position: absolute;
        top: 50%;
        left: 0;
        transform: translate(calc(-100% - toScale(0.6rem, 37.5rem)), -50%);
        @include will-fade;
        @include from__tablet--landscape {
          transform: translate(calc(-100% - toScale(0.6rem)), -50%);
        }
        rect {
          fill: var(--dark-grey);
        }
      }

      &__count {
        position: absolute;
        top: 0;
        right: 0;
        transform: translate(calc(100% + toScale(0.4rem, 37.5rem)), toScale(0rem, 37.5rem));
        color: var(--dark-grey);
        @include t-b3--number;
        @include from__tablet--landscape {
          transform: translate(calc(100% + toScale(0.6rem)), toScale(-0.4rem));
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
