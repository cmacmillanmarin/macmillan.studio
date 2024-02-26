<template>
  <canvas ref="el" class="c-noise" />
</template>

<script lang="ts" setup>
// technique for this demo found here
// http://stackoverflow.com/questions/22003491/animating-canvas-to-look-like-tv-noise

const { onResize } = useResize()
const { addTicker, killTicker } = useRaf()

const el = ref<HTMLCanvasElement>()
let _context: any

watch(onResize, update)

onMounted((): void => {
  if (!el.value) return

  _context = el.value.getContext('2d')

  el.value.width = el.value.height = 128

  update()
  addTicker(noise)
})

function update(): void {
  if (!el.value) return
  el.value.width = window.innerWidth * window.devicePixelRatio
  el.value.height = window.innerHeight * window.devicePixelRatio
  el.value.style.width = window.innerWidth + 'px'
  el.value.style.height = window.innerHeight + 'px'
}

function noise() {
  const w = _context.canvas.width,
    h = _context.canvas.height,
    iData = _context.createImageData(w, h),
    buffer32 = new Uint32Array(iData.data.buffer),
    len = buffer32.length
  let i = 0

  for (; i < len; i++) if (Math.random() < 0.5) buffer32[i] = 0xff000000

  _context.putImageData(iData, 0, 0)
}

onBeforeUnmount((): void => {
  killTicker(noise)
})
</script>

<style lang="scss">
.c-noise {
  position: absolute;
  z-index: 999999;
  opacity: 0.07;
  top: 0;
  left: 0;
  width: 100%;
  height: var(--vh);
  pointer-events: none;
  mix-blend-mode: difference;
  will-change: opacity, transform;
}
</style>
