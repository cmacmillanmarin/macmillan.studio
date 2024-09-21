<template>
  <CustomLink class="decorative-link" :to="to" :type="type" :content="true" @mouseenter="shuffle">
    <span ref="spanEl">{{ label }}</span>
    <SvgArrow />
  </CustomLink>
</template>

<script lang="ts" setup>
import { gsap } from 'gsap'

defineProps<{
  label: string
  to: string
  type: string
}>()

const spanEl = ref<HTMLElement>()

function shuffle(e: MouseEvent) {
  if (spanEl.value) {
    gsap.set(spanEl.value, { opacity: 0 })
    shuffleElsIn({ els: [spanEl.value] })
  }
}
</script>

<style lang="scss">
.decorative-link {
  .svg__arrow {
    margin-left: 0.8rem;
  }
}
</style>
