<template>
  <div ref="el" :class="['cursor', { 'cursor--lime': cursorColor === 'lime' }]">
    <div class="cursor__dot">
      <div v-if="cursorColor === 'lime'" class="cursor__dot__lime" />
      <transition mode="out-in" :css="false" @enter="transitionShuffleIn" @leave="transitionDone">
        <div v-if="cursor !== 'default'" :key="cursor" class="cursor__dot__icon">
          <SvgPlay v-if="cursor === 'play'" />
          <SvgPlus v-else-if="cursor === 'plus'" />
          <SvgPause v-else-if="cursor === 'pause'" />
          <SvgArrowBig v-else-if="cursor === 'arrow-left'" key="left-arrow" :side="1" />
          <SvgArrowBig v-else-if="cursor === 'arrow-right'" key="right-arrow" :side="-1" />
          <SvgCopy v-else-if="cursor === 'copy'" />
          <SvgTick v-else-if="cursor === 'copied'" />
          <SvgClose v-else-if="cursor === 'close'" />
          <SvgLoading v-else-if="cursor === 'loading'" />
        </div>
      </transition>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { gsap } from 'gsap'
import { storeToRefs } from 'pinia'
import useStore from '~/store/useStore'
import { transitionShuffleIn, transitionDone } from '~/utils/animations'

const { cursor, cursorColor } = storeToRefs(useStore())

const { addTicker, killTicker } = useRaf()

const { toScale } = useCss()
const { x: targetX, y: targetY } = useMouse()
const { touch } = useDevice()

const el = ref<HTMLElement>()

let _x: number = 0
let _y: number = 0
let _visible: boolean = false

watch(touch, () => {
  touch.value ? killTicker(move) : addTicker(move)
})

watch(cursor, () => {
  if (!el.value || touch.value) return
  const cursorIn = cursor.value !== 'default'
  cursorIn && (_visible = true)
  const scale = cursorIn ? 1 : getScale()
  const duration = cursorIn ? 0.4 : 0.3
  gsap.killTweensOf(el.value)
  gsap.to(el.value, {
    scale,
    duration,
    onComplete: () => {
      if (!cursorIn) {
        _visible = false
      }
    },
  })
})

onMounted(() => {
  if (!touch.value && el.value) {
    addTicker(move)
    gsap.set(el.value, { scale: getScale() })
  }
})

function move() {
  _x += (targetX.value - _x) * 0.2
  _y += (targetY.value - _y) * 0.2
  el.value && gsap.set(el.value, { x: _x, y: _y })
}

function getScale(): number {
  const size = toScale(80)
  const targetSize = toScale(12)
  return targetSize / size
}

function limeEnter(el: Element, done: Function) {
  gsap.to(el, {
    duration: 0.05,
    onComplete: () => {
      done()
    },
  })
}

function limeLeave(el: Element, done: Function) {
  gsap.to(el, {
    delay: 0.35,
    duration: 0.05,
    onComplete: () => {
      done()
    },
  })
}

onBeforeUnmount(() => {
  killTicker(move)
})
</script>

<style lang="scss">
.cursor {
  pointer-events: none;
  transform: scale(0);
  will-change: transform;

  &--lime {
    .cursor__dot__icon svg {
      path,
      rect {
        fill: var(--black) !important;
      }
    }
  }

  &__dot {
    @include absolute-center;
    width: toScale(8rem);
    height: toScale(8rem);
    background-color: var(--black);
    border-radius: 50%;

    will-change: transform;

    &__lime {
      width: calc(100% - 0.4rem);
      height: calc(100% - 0.4rem);
      border-radius: 50%;
      background-color: var(--lime);
      @include absolute-center;
    }

    &__icon {
      @include will-fade;
      @include absolute-center;

      .svg__play,
      .svg__arrow--big {
        position: relative;
        left: 15%;
      }

      .svg__arrow--big-left {
        position: relative;
        left: -15%;
      }
    }
  }
}
</style>
