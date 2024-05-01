<template>
  <div ref="el" class="__layout">
    <Header />
    <slot />

    <Three />

    <div data-scroll data-scroll-continuous class="__layout__top-layer" id="top-layer" />
  </div>
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import useStore from '~/store/useStore'
import useScrollStore from '~/store/useScrollStore'
import type { Data, Direction } from '~/types/front/store/scroll'
import { round } from '~/utils'

const config = useRuntimeConfig()
const { IS_PREVIEW } = config.public

const route = useRoute()
const store = useStore()
const { isPreloaded, isLoading } = storeToRefs(store)

const { touch } = useDevice()
const { vh, onResize } = useResize()
const { addTicker, killTicker } = useRaf()

const scrollStore = useScrollStore()
const { updateScroll, updateScrollTarget, updateScrollTargetId } = scrollStore
const { scrollEl, scrollMode, scrollDisabled, scrollTarget, scrollTargetId, scrollUpdate } =
  storeToRefs(scrollStore)

let _target: number = 0
let _current: number = 0
let _previous: number = 0
let _direction: Direction = 'up'
let _bounding: number = 0
const scroll = useVirtualScroll()
const { create: createScrollLock, destroy: destroyScrollLock } = useScrollLock()

const el = ref<HTMLElement>()

watch(
  () => route.hash,
  (): void => {
    updateScrollTargetId(route.hash?.substring(1))
  }
)

watch(
  () => route.params.slug,
  () => {
    if (!route.params.slug) {
      updateScrollTarget(0)
    }
    updateScroll()
  }
)

watch(onResize, async (): Promise<void> => {
  await nextTick()
  scroll.update()
})

watch(touch, resetScroll)

watch(isPreloaded, (): void => {
  scrollStore.disableScroll(false)
  el.value && init()
})

watch(isLoading, (): void => {
  IS_PREVIEW && !isLoading.value && nextTick(scroll.reset)
})

watch(scrollMode, (): void => {
  if (!scrollMode.value) return
  if ((scrollMode.value === 'auto' && !touch.value) || scrollMode.value === 'virtual') {
    scrollStore.updateActiveMode('virtual')
    removeScrollListeners()
    scroll.create({
      el: el.value as HTMLElement,
      update: onSmoothScroll,
      position: scrollStore.scrollPosition,
    })
    scroll.disable(scrollStore.scrollDisabled)
  } else {
    scrollStore.updateActiveMode('native')
    scroll.destroy()
    gsap.set(window, { scrollTo: scrollStore.scrollPosition })
    addScrollListeners()
  }
})

watch(scrollDisabled, (): void => {
  scroll.disable(scrollDisabled.value)
  if (scrollDisabled.value) createScrollLock({ el: el.value as HTMLElement })
  else destroyScrollLock()
})

watch(scrollTarget, (): void => {
  if (scrollTarget.value === -1 || scrollDisabled.value) return
  if (scroll.active.value) {
    scroll.to(scrollTarget.value)
  } else {
    gsap.to(scrollEl, { scrollTo: scrollTarget.value })
  }
})

watch(scrollTargetId, (): void => {
  if (scrollTargetId.value === '' || scrollDisabled.value) return
  const targetId = `${scrollTargetId.value}-target`
  if (scroll.active.value) {
    scroll.toId(targetId)
  } else {
    const target: HTMLElement | null = document.getElementById(targetId)
    const offset: number = parseFloat(target?.dataset.scrollTargetOffset || '0')
    target &&
      gsap.to(el.value, {
        scrollTo: { y: target, offsetY: offset },
      })
  }
})

watch(scrollUpdate, async (): Promise<void> => {
  await nextTick()
  scroll.update()
})

onMounted(async (): Promise<void> => {
  scrollStore.updateEl(el.value)

  if (!isPreloaded.value) {
    scrollStore.disableScroll(true)
  } else {
    // Await ClientOnly Template
    await nextTick()
    init()
  }
})

function init(): void {
  initScroll()
}

function initScroll(): void {
  scrollStore.updateScrollMode('auto')
}

async function resetScroll(): Promise<void> {
  scrollStore.updateScrollMode(undefined)
  await nextTick()
  initScroll()
}

function addScrollListeners(): void {
  el.value?.addEventListener('scroll', onNativeScroll, { passive: false })
}

function removeScrollListeners(): void {
  killTicker(onNativeScrollRaf)
  el.value?.removeEventListener('scroll', onNativeScroll)
}

function onNativeScroll(): void {
  _target = el.value?.scrollTop || 0
  _direction = _target < _previous ? 'up' : 'down'
  _bounding = (el.value?.scrollHeight || vh.value) - vh.value
  if (!onNativeScrollInTarget()) addTicker(onNativeScrollRaf)
  _previous = _current
}

function onNativeScrollInTarget() {
  return Math.abs(_target - _current) < 0.01
}

function onNativeScrollRaf(): void {
  _current += (_target - _current) * 0.175
  scrollStore.updateScrollData({
    current: round(_current),
    currentVertical: round(_current),
    direction: _direction,
    bounding: _bounding,
  })
  if (onNativeScrollInTarget()) {
    _current = _target
    killTicker(onNativeScrollRaf)
  }
}

function onSmoothScroll(data: Data): void {
  scrollStore.updateScrollData(data)
}

onUnmounted((): void => {
  scroll.destroy()
  removeScrollListeners()
})
</script>

<style lang="scss">
.__layout {
  .header {
    position: absolute;
    z-index: 9;
    bottom: 0;
    left: 50%;
    width: 100%;
    transform: translateX(-50%);
  }
  .three {
    @include absolute-fill();
    z-index: 7;
  }
  &__top-layer {
    @include absolute-fill();
    z-index: 8;
    pointer-events: none;
  }
}
</style>
