<template>
  <div ref="el" :class="['cursor', { 'cursor--lime': cursorColor === 'lime' }]">
    <div ref="dotEl" class="cursor__dot">
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
    <div ref="squareEl" class="cursor__square" />
  </div>
</template>

<script lang="ts" setup>
import { gsap } from 'gsap/gsap-core'
import { storeToRefs } from 'pinia'
import useStore from '~/store/useStore'
import { fadeIn, fadeOut, transitionShuffleIn, transitionDone } from '~/utils/animations'

const { cursor, cursorColor, cursorPosition, headerLogo, isInReel } = storeToRefs(useStore())

const { addTicker, killTicker } = useRaf()

const { toScale } = useCss()
const { x: mouseX, y: mouseY } = useMouse()
const { touch } = useDevice()

const el = ref<HTMLElement>()
const dotEl = ref<HTMLElement>()
const squareEl = ref<HTMLElement>()

const targetX = ref<number>(0)
const targetY = ref<number>(0)

let _x: number = 0
let _y: number = 0
let _visible: boolean = false
let _entered: boolean = false
let _inFixedPosition: boolean = false

watch(touch, () => {
  touch.value ? killTicker(move) : addTicker(move)
})

watch(headerLogo, () => {
  if (headerLogo.value) {
    _entered = false
    squareEl.value && fadeOut({ el: squareEl.value })
  }
})

watch([mouseX, mouseY], () => {
  if (_inFixedPosition || headerLogo.value) return
  if (!_entered) {
    _entered = true
    _x = mouseX.value
    _y = mouseY.value
    squareEl.value && fadeIn({ el: squareEl.value })
  }
  targetX.value = mouseX.value
  targetY.value = mouseY.value
})

watch(cursorPosition, () => {
  _inFixedPosition = cursorPosition.value.x !== -1 && cursorPosition.value.y !== -1
  if (_inFixedPosition) {
    targetX.value = cursorPosition.value.x + toScale(6)
    targetY.value = cursorPosition.value.y + toScale(6)
  }
})

watch([cursor, isInReel], () => {
  if (!dotEl.value || touch.value) return
  const cursorIn = cursor.value !== 'default'
  cursorIn && (_visible = true)
  const scale = cursorIn ? 1 : 0
  const duration = cursorIn ? 0.4 : 0.3
  if (isInReel.value) {
    scale === 0 ? fadeOut({ el: squareEl.value }) : fadeIn({ el: squareEl.value })
  } else {
    fadeIn({ el: squareEl.value })
  }
  gsap.killTweensOf(dotEl.value)
  gsap.to(dotEl.value, {
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
  if (!touch.value && dotEl.value) {
    addTicker(move)
    gsap.set(dotEl.value, { scale: 0 })
  }
})

function move() {
  _x += (targetX.value - _x) * 0.2
  _y += (targetY.value - _y) * 0.2
  el.value && gsap.set(el.value, { x: _x, y: _y })
}

onBeforeUnmount(() => {
  killTicker(move)
})
</script>

<style lang="scss">
.cursor {
  pointer-events: none;
  will-change: transform;

  &--lime {
    .cursor__square {
      background-color: var(--lime);
    }
    .cursor__dot__icon svg {
      path,
      rect {
        fill: var(--black) !important;
      }
    }
  }

  &__square {
    width: toScale(1.2rem);
    height: toScale(1.2rem);
    background-color: var(--black);
    z-index: 1;
    @include will-fade;
    @include absolute-center;
  }

  &__dot {
    width: toScale(8rem);
    height: toScale(8rem);
    background-color: var(--black);
    border-radius: 50%;
    will-change: transform;
    z-index: 2;
    @include absolute-center;

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
