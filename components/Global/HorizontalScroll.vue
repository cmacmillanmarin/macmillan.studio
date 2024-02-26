<template>
  <div
    ref="el"
    data-scroll-set-progress
    class="c-horizontal-scroll"
    :style="{ height: toPx(height), minHeight: toPx(svh) }">
    <div class="c-horizontal-scroll__content" data-scroll-sticky>
      <slot name="fixed" />
      <div
        :class="[
          'c-horizontal-scroll__content__heading',
          { 'c-horizontal-scroll__content__heading--top': headingTop },
        ]">
        <slot name="heading" />
      </div>
      <div
        ref="scrollerEl"
        class="c-horizontal-scroll__content__scroller"
        :style="{ transform: `translateX(${toPx(x)})` }">
        <slot name="items" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import { toPx } from '~/utils/index'
import useStore from '~/store/useStore'
import useScrollStore from '~/store/useScrollStore'

defineProps<{
  headingTop?: boolean
}>()

const { isPreloaded } = storeToRefs(useStore())
const scrollStore = useScrollStore()
const { updateScroll } = scrollStore
const { mode: scrollMode, scrollPosition, isVirtualScroll } = storeToRefs(scrollStore)

const { isMobile } = useDevice()
const { onResize, svh, vh } = useResize()
const { track } = useNativeScrollTracker()
const { maxWidth } = useCss()

const el = ref<HTMLElement | null>(null)
const scrollerEl = ref<HTMLElement>()

const scrollProgress = ref<number>(0)

const x = computed<number>((): number =>
  Math.max(
    scrollProgress.value * -1 + svh.value + margin.value * 0.5,
    (height.value - svh.value - margin.value * 0.5) * -1
  )
)
const cvh = computed<number>(() => (isMobile.value ? svh.value : vh.value))

const margin = ref<number>(0)
const height = ref<number>(0)
const sticky = ref<boolean>(false)

watch([scrollMode, isMobile, onResize, isPreloaded], async (): Promise<void> => {
  await nextTick()
  updateSize()
})

watch(scrollPosition, update)

function update(): void {
  if (!el.value) return
  if (isVirtualScroll.value) {
    scrollProgress.value = parseFloat(el.value.dataset.scrollCurrent || '0')
  } else {
    scrollProgress.value = track(el.value).current
  }
  sticky.value = scrollProgress.value > vh.value
}

async function updateSize(): Promise<void> {
  if (el.value && scrollerEl.value) {
    const { width: elWidth } = el.value.getBoundingClientRect()
    const { width: cointainerWidth } = scrollerEl.value.getBoundingClientRect()
    margin.value = Math.max(0, elWidth - maxWidth.value)
    height.value = cointainerWidth - elWidth + cvh.value + margin.value
    await nextTick()
    updateScroll()
    update()
  }
}

function getBounding(): number {
  return height.value - cvh.value
}

defineExpose({
  updateSize,
  getBounding,
  update,
  sticky,
})
</script>

<style lang="scss">
.c-horizontal-scroll {
  overflow: var(--overflow--hidden);
  font-size: 0;

  &__content {
    position: sticky;
    top: 0;

    &__heading {
      position: absolute;
      z-index: 1;
      top: 0;
      left: 0;
      width: 100%;
      &--top {
        z-index: 3;
      }
    }

    &__scroller {
      position: relative;
      z-index: 2;

      display: inline-block;
      white-space: nowrap;

      will-change: transform;
    }
  }
}
</style>
