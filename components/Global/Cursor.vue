<template>
  <div ref="el" class="cursor">
    <div class="cursor__dot"></div>
  </div>
</template>

<script lang="ts" setup>
import { gsap } from 'gsap'
import { storeToRefs } from 'pinia'
import useStore from '~/store/useStore'

const { cursor } = storeToRefs(useStore())

const { addTicker, killTicker } = useRaf()
const { x: targetX, y: targetY } = useMouse()

const el = ref<HTMLElement>()

let _x: number = 0
let _y: number = 0

watch(cursor, () => {
  if (!el.value) return
  if (cursor.value !== 'default') {
    gsap.to(el.value, { scale: 1 })
  } else {
    gsap.to(el.value, { scale: 0 })
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
  transform: scale(0);
  will-change: transform;

  &__dot {
    @include absolute-center;
    width: 8rem;
    height: 8rem;
    background-color: var(--black);
    border-radius: 50%;

    will-change: transform;
  }
}
</style>
