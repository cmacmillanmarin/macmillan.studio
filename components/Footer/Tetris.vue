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

const tetris: Tetris = {
  ctx: null,
  size: { x: 0, y: 0, piece: 0 },
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
  init()
})

function onIntersect(el: HTMLElement, visible: boolean) {
  inView.value = visible
}

function init() {
  tetris.ctx = el.value?.getContext('2d')

  // Create a new image object
  const img = new Image()
  img.src = '/assets/img/logo.svg'

  // Draw the image onto the canvas when it's loaded
  img.onload = function () {
    if (tetris.ctx) {
      for (let row = 1; row < 5; row++) {
        for (let column = 0; column < 12; column++) {
          tetris.ctx.drawImage(
            img,
            tetris.size.piece * column,
            tetris.size.y - tetris.size.piece * row,
            tetris.size.piece,
            tetris.size.piece
          )

          // Set the composite operation
          tetris.ctx.globalCompositeOperation = 'source-atop'

          // Set the fill style
          tetris.ctx.fillStyle = '#101011'

          // Fill the canvas
          tetris.ctx.fillRect(0, 0, tetris.ctx.canvas.width, tetris.ctx.canvas.height)

          // Reset the composite operation
          tetris.ctx.globalCompositeOperation = 'source-over'
        }
      }
    }
  }
}

function play() {}

function update() {
  if (!el.value) return
  tetris.size.x = Math.min(vw.value, maxWidth.value)
  tetris.size.y = vh.value
  tetris.size.piece = tetris.size.x / 12
  el.value.width = tetris.size.x
  el.value.height = tetris.size.y
  gsap.set(el.value, { width: tetris.size.x, height: tetris.size.y })
}

function reset() {
  console.log(tetris)
}
</script>
