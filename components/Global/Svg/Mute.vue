<template>
  <svg class="svg__mute" view-box="0 0 100 100">
    <g ref="groupEl" v-for="i in 5">
      <rect
        v-for="j in 5"
        :x="toPercentage(20 * (i - 1))"
        :y="toPercentage(20 * (j - 1))"
        :width="toPercentage(20)"
        :height="toPercentage(20)" />
    </g>
  </svg>
</template>

<script lang="ts" setup>
import { gsap } from 'gsap/gsap-core'
import { toPercentage } from '~/utils'

const props = defineProps<{
  state: boolean
}>()

const groupEl = ref<Array<SVGElement>>()

onMounted(() => {
  props.state ? pause() : play()
})

watch(
  () => props.state,
  () => {
    props.state ? pause() : play()
  }
)

function animate(params: { dots: NodeListOf<SVGRectElement>; delay: number; opacity: number }) {
  const { dots, delay, opacity } = params
  const lowDelay = opacity === 1 ? 0 : 0.1
  const highDelay = opacity === 1 ? 0.1 : 0
  const anim = { opacity: opacity, duration: 0.2, delay }
  gsap.killTweensOf(dots)
  gsap.set(dots[2], { opacity: 1 })
  gsap.to([dots[0], dots[4]], { ...anim, delay: delay + highDelay })
  gsap.to([dots[1], dots[3]], {
    ...anim,
    delay: delay + lowDelay,
    onComplete: () => {
      animate({ dots, delay: 0, opacity: opacity === 1 ? 0 : 1 })
    },
  })
}

function play() {
  let i = 0
  for (const el of groupEl.value || []) {
    let delay = 0.1
    if (i === 1 || i === 3) delay = 0.2
    const dots = el.querySelectorAll('rect')
    animate({ dots, delay, opacity: 1 })
    i++
  }
}

function pause() {
  for (const el of groupEl.value || []) {
    const dots = el.querySelectorAll('rect')
    gsap.killTweensOf(dots)
    gsap.set(dots[2], { opacity: 1 })
    gsap.to([dots[0], dots[1], dots[3], dots[4]], { opacity: 0, duration: 0.2 })
  }
}

onBeforeUnmount(() => {
  pause()
})
</script>

<style lang="scss">
.svg__mute {
  fill: none;
  display: block;
  width: toScale(2.8rem, 37.5rem);
  height: toScale(2.8rem, 37.5rem);
  @include from__tablet--landscape {
    width: toScale(2.8rem);
    height: toScale(2.8rem);
  }
  rect {
    fill: var(--lime);
    stroke: var(--black);
    stroke-width: 0.5;
    @include will-fade;
  }
}
</style>
