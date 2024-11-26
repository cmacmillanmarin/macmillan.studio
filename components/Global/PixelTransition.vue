<template>
  <div ref="el" class="pixel-transition">
    <div v-for="i in boxes" class="pixel-transition__box" :style="boxStyle" />
  </div>
</template>

<script lang="ts" setup>
import { gsap } from 'gsap/gsap-core'
import { toPx, shuffle, splitArray } from '~/utils'

const props = defineProps<{
  color?: string
}>()

const { toScale } = useCss()
const { isMobileLayout } = useDevice()
const { vw, vh, onResize } = useResize()

const bgColor = ref<string>(props.color || '#c5ff20')

const el = ref<HTMLElement>()
const boxes = ref<number>(0)
const xBoxes = ref<number>(0)
const yBoxes = ref<number>(0)
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
    const boxes = Array.from(el.value.querySelectorAll('.pixel-transition__box'))
    const logoBox = boxes[xBoxes.value - 1]
    boxes.splice(boxes.indexOf(logoBox), 1)
    const shuffleBoxes = shuffle(boxes)
    const chunks = splitArray(shuffleBoxes, 8)
    for (let i = 0; i <= chunks.length - 1; i++) {
      gsap.set(chunks[i], {
        opacity: 1,
        delay: 0.05 * i,
        onComplete: () => {
          if (i === chunks.length - 1) {
            gsap.set(logoBox, { opacity: 1 })
            resolve()
          }
        },
      })
    }
  })
}

function updateSize() {
  const idealSize = toScale(isMobileLayout.value ? 45 : 80)
  xBoxes.value = Math.round(vw.value / idealSize)
  yBoxes.value = Math.round(vh.value / idealSize)
  boxes.value = xBoxes.value * yBoxes.value
  boxStyle.value.width = toPx(vw.value / xBoxes.value)
  boxStyle.value.height = toPx(vh.value / yBoxes.value)
}

const emit = defineEmits(['done'])
</script>

<style lang="scss">
.pixel-transition {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9;
  display: flex;
  flex-wrap: wrap;
  &__box {
    background-color: v-bind(bgColor);
    @include will-fade;
  }
}
</style>
