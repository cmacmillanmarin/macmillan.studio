<template>
  <canvas ref="el" class="footer__tetris" v-intersect="{ callback: onIntersect }" />
</template>

<script lang="ts" setup>
import { type Tetris } from '~/types/front/tetris'

const { maxWidth } = useCss()
const { vw, vh, onResize } = useResize()
const { addTicker, killTicker } = useRaf()

const el = ref<HTMLCanvasElement>()
const inView = ref<boolean>(false)

const width = computed<number>((): number => Math.min(vw.value, maxWidth.value))
const height = computed<number>((): number => vh.value)

const tetris: Tetris = {
  size: { x: 0, y: 0 },
  matrix: [],
  points: 0,
}

watch(onResize, () => {
  update()
  reset()
})

watch(inView, () => {
  console.log('in view', inView.value)
})

onMounted(() => {
  update()
  reset()
})

function onIntersect(el: HTMLElement, visible: boolean) {
  inView.value = visible
}

function init() {}

function play() {}

function update() {
  if (!el.value) return
  el.value.width = width.value
  el.value.height = height.value
  gsap.set(el.value, { width: width.value, height: height.value })
}

function reset() {
  console.log(tetris)
}
</script>

<style lang="scss">
.footer__tetris {
  border: 1px solid red;
}
</style>
