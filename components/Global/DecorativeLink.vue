<template>
  <CustomLink
    class="decorative-link"
    :to="to"
    :type="type"
    :content="true"
    @mouseenter="shuffle"
    :tabindex="tabindex">
    <span ref="spanEl">{{ label }}</span>
    <SvgLinkArrow />
  </CustomLink>
</template>

<script lang="ts" setup>
import { gsap } from 'gsap'

defineProps<{
  label: string
  to: string
  type: string
  tabindex?: number
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
  display: flex;
  align-items: center;
  column-gap: toScale(0.5rem, 37.5rem);
  @include from__tablet--landscape {
    column-gap: toScale(0.7rem);
  }
  .svg__link-arrow {
    transform: translateY(0.2rem);
    @include from__tablet--landscape {
      transform: translateY(0.3rem);
    }
    path {
      fill: var(--lime);
    }
  }
}
</style>
