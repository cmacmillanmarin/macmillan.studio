<template>
  <div ref="el" class="project__transition">
    <div v-for="i in boxes" class="project__transition__box" :style="boxStyle" />
  </div>
</template>

<script lang="ts" setup>
import { gsap } from 'gsap'
import { toPx, shuffle, splitArray } from '~/utils'

defineProps<{
  color: string
}>()

const { vw, vh, onResize } = useResize()

const el = ref<HTMLElement>()
const boxes = ref<number>(0)
const boxStyle = ref({
  width: toPx(0),
  height: toPx(0),
})

watch(onResize, updateSize)

onMounted(async () => {
  updateSize()
  await nextTick()
  await enter()
  emit('done')
})

function enter(): Promise<void> {
  return new Promise(resolve => {
    if (!el.value) {
      return resolve()
    }
    const boxes = shuffle(Array.from(el.value.querySelectorAll('.project__transition__box')))
    const chunks = splitArray(boxes, 10)
    for (let i = 0; i <= chunks.length - 1; i++) {
      gsap.set(chunks[i], {
        opacity: 1,
        delay: 0.05 * i,
        onComplete: () => {
          if (i === chunks.length - 1) {
            resolve()
          }
        },
      })
    }
  })
}

function updateSize() {
  const idealSize = 100
  const numOfBoxesX = Math.round(vw.value / idealSize)
  const numOfBoxesY = Math.round(vh.value / idealSize)
  boxes.value = numOfBoxesX * numOfBoxesY
  boxStyle.value.width = toPx(vw.value / numOfBoxesX)
  boxStyle.value.height = toPx(vh.value / numOfBoxesY)
}

const emit = defineEmits(['done'])
</script>

<style lang="scss">
.project__transition {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9;
  display: flex;
  flex-wrap: wrap;
  &__box {
    background-color: v-bind(color);
    @include will-fade;
  }
}
</style>
