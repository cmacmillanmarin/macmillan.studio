<template>
  <CustomLink
    class="decorative-link"
    :to="to"
    :type="type"
    :content="true"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
    :tabindex="tabindex">
    <span ref="spanEl">{{ label }}</span>
    <SvgLinkArrow />
  </CustomLink>
</template>

<script lang="ts" setup>
import useStore from '~/store/useStore'
import { gsap } from 'gsap/gsap-core'
import { shuffleElsIn } from '~/utils/animations'

defineProps<{
  label: string
  to: string
  type: string
  tabindex?: number
}>()

const store = useStore()
const { updateCursorPosition } = store

const { toScale } = useCss()

const spanEl = ref<HTMLElement>()

function onMouseEnter(e: MouseEvent) {
  if (spanEl.value) {
    const { left, top } = spanEl.value.getBoundingClientRect()
    updateCursorPosition({ x: left - toScale(20), y: top + toScale(8) })
    gsap.set(spanEl.value, { opacity: 0 })
    shuffleElsIn({ els: [spanEl.value] })
  }
}

function onMouseLeave(e: MouseEvent) {
  updateCursorPosition({ x: -1, y: -1 })
}

defineExpose({
  shuffle,
})
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
