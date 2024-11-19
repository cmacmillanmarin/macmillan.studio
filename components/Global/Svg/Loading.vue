<template>
  <svg class="svg__loading" view-box="0 0 100 100">
    <rect
      v-for="i in 3"
      ref="rectEl"
      :x="toPercentage(40 * (i - 1))"
      :y="toPercentage(40)"
      :width="toPercentage(20)"
      :height="toPercentage(20)" />
  </svg>
</template>

<script lang="ts" setup>
import { gsap } from 'gsap/gsap-core'
import { toPercentage } from '~/utils'

const rectEl = ref<Array<SVGRectElement>>()

onMounted(() => {
  if (rectEl.value) {
    const anim = gsap.timeline({ repeat: -1 })
    anim.to(rectEl.value, { opacity: 1, duration: 0.2, stagger: 0.2 })
    anim.to(rectEl.value, { opacity: 0, duration: 0.2 })
  }
})

onBeforeUnmount(() => {
  rectEl.value && gsap.killTweensOf(rectEl.value)
})
</script>

<style lang="scss">
.svg__loading {
  display: block;
  width: toScale(4rem);
  height: toScale(4rem);
  rect {
    fill: var(--lime);
    @include will-fade;
  }
}
</style>
