<template>
  <p ref="el" class="c-animated-title" v-html="label" v-intersect="{ callback: intersect }" />
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import useStore from '~/store/useStore'

const props = defineProps<{
  label: string
  manual?: boolean
}>()

const { onResize } = useResize()
const { isPreloaded } = storeToRefs(useStore())

const el = ref<HTMLElement>()
const inView = ref<boolean>(false)

let prepared: boolean = false
let entered: boolean = false
let split: any

watch(inView, (): void => {
  prepared && !entered && inView.value && !props.manual && enter()
})

watch(el, async (): Promise<void> => {
  !prepared && isPreloaded.value && (await prepare())
  prepared && !entered && inView.value && !props.manual && enter()
})

watch(isPreloaded, (): void => {
  !prepared && prepare()
})

watch(onResize, (): void => {
  split.revert()
})

function intersect(el: HTMLElement, visible: boolean): void {
  inView.value = visible
}

async function prepare(): Promise<void> {
  prepared = true
  await nextTick()
  split = new SplitText(el.value, { type: 'lines', linesClass: 'line' })
  for (const line of split.lines) {
    line.innerHTML = `<div class='mask'>${line.innerHTML}</div>`
  }
}

function enter(): void {
  entered = true
  gsap.set(el.value, { opacity: 1 })
  const masks = [...(el.value?.querySelectorAll('.mask') || [])].reverse()
  gsap.to(masks, {
    y: '0%',
    stagger: 0.2,
    duration: 1.2,
  })
}

defineExpose({
  enter,
})
</script>

<style lang="scss">
.c-animated-title {
  position: relative;
  opacity: 0;
  will-change: opacity;
  .line {
    overflow: var(--overflow--hidden);
    .mask {
      transform: translateY(-100%);
      will-change: transform;
    }
  }
  span {
    display: inline-block;
  }
}
</style>
