<template>
  <div ref="el" class="cursor">
    <div class="cursor__dot">
      <transition mode="out-in" :css="false" @enter="transitionShuffleIn" @leave="transitionDone">
        <div v-if="cursor !== 'default'" :key="cursor" class="cursor__dot__icon">
          <SvgPlay v-if="cursor === 'video'" />
          <SvgPlus v-else-if="cursor === 'plus'" />
          <SvgArrowBig v-else-if="cursor === 'arrow-left'" key="left-arrow" :side="1" />
          <SvgArrowBig v-else-if="cursor === 'arrow-right'" key="right-arrow" :side="-1" />
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

const { cursor } = storeToRefs(useStore())

const { addTicker, killTicker } = useRaf()
const { x: targetX, y: targetY } = useMouse()

const el = ref<HTMLElement>()

let _x: number = 0
let _y: number = 0

watch(cursor, () => {
  if (!el.value) return
  if (cursor.value !== 'default') {
    gsap.to(el.value, { scale: 1, duration: 0.4 })
  } else {
    gsap.to(el.value, { scale: 0, duration: 0.4 })
  }
})

onMounted(() => {
  addTicker(move)
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

<style lang="scss" scoped>
.cursor {
  pointer-events: none;
  transform: scale(0);
  will-change: transform;

  &__dot {
    @include absolute-center;
    width: 8rem;
    height: 8rem;
    background-color: var(--black);
    border-radius: 50%;

    will-change: transform;

    &__icon {
      @include will-fade;
      @include absolute-center;
    }
  }
}
</style>
