<template>
  <div class="c-scroll-tracker">
    <div ref="bgEl" class="c-scroll-tracker__bg" />
  </div>
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import useScrollStore from '~/store/useScrollStore'
import { toPercentage } from '~/utils'

const { progress } = storeToRefs(useScrollStore())
const { addTicker, killTicker } = useRaf()
const bgEl = ref<HTMLElement>()
const current = ref<number>(0)

let rendering: boolean = false

watch(progress, (): void => {
  !rendering && addTicker(raf)
})

watch(current, (): void => {
  gsap.set(bgEl.value, { x: toPercentage(-100 + current.value * 100) })
})

function raf(): void {
  current.value += (progress.value - current.value) * 0.1
  inTarget() && kill()
}

function kill(): void {
  current.value = progress.value
  rendering = false
  killTicker(raf)
}

function inTarget(): boolean {
  return Math.abs(current.value - progress.value) < 0.001
}

onBeforeUnmount(kill)
</script>

<style lang="scss">
.c-scroll-tracker {
  position: fixed;
  z-index: 9;
  top: 0;
  left: 0;
  width: 100%;
  height: 0.4rem;
  &__bg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: var(--burgundy--dark);

    will-change: transform;
    transform: translateX(-100%);
  }
}
</style>
