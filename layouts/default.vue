<template>
  <div ref="el" class="__layout">
    <Header v-if="!IS_PREVIEW && header" v-bind="header" />
    <ClientOnly>
      <Header v-if="IS_PREVIEW && !!user && header" v-bind="header" />
    </ClientOnly>
    <slot />

    <ClientOnly>
      <Noise />

      <div class="__layout__overlay" />

      <HelpersPreview v-if="IS_PREVIEW && user" />
    </ClientOnly>
  </div>
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import useStore from '~/store/useStore'
import useHeaderStore from '~/store/useHeaderStore'
import useAuthStore from '~/store/useAuthStore'
import useScrollStore from '~/store/useScrollStore'
import useDictionaryStore from '~/store/useDictionaryStore'
import type { Data, Direction } from '~/types/front/store/scroll'
import type { Theme } from '~/types/front/store/header'
import type { Header } from '~/types/wordpress/navigation'
import type { Dictionary } from '~/types/wordpress/dictionary'
import { round, loadScript } from '~/utils'

const config = useRuntimeConfig()
const { IS_PREVIEW } = config.public

const { data: header } = await useFetch<Header>('/api/wordpress/header')
const { data: dictionary } = await useFetch<Dictionary>('/api/wordpress/dictionary?lang=en')

const route = useRoute()
const router = useRouter()
const store = useStore()
const { isPreloaded, isLoading, routeTo, routeFromTo } = storeToRefs(store)
const headerStore = useHeaderStore()
headerStore.updateImage(header.value?.overlay.image)
const { headerOverlay } = storeToRefs(headerStore)
const { user } = storeToRefs(useAuthStore())

const { add: addDictionary, get, getImage } = useDictionaryStore()
addDictionary(dictionary.value as Dictionary)

const { touch } = useDevice()
const { vh, onResize } = useResize()
const { addTicker, killTicker } = useRaf()
const { addLinks, removeLinks } = useNuxtNavOnly()

const scrollStore = useScrollStore()
const { updateScrollTargetId } = scrollStore
const {
  scrollEl,
  scrollPosition,
  scrollProgress,
  scrollMode,
  scrollDisabled,
  scrollTarget,
  scrollTargetId,
  scrollUpdate,
} = storeToRefs(scrollStore)
let _target: number = 0
let _current: number = 0
let _previous: number = 0
let _direction: Direction = 'up'
let _bounding: number = 0
const scroll = useVirtualScroll()
const { create: createScrollLock, destroy: destroyScrollLock } = useScrollLock()

const el = ref<HTMLElement>()

const newsletterSubscriptionOverlay = computed<boolean>(
  (): boolean => route.query?.newsletter === 'true'
)

watch(
  () => route.hash,
  (): void => {
    updateScrollTargetId(route.hash?.substring(1))
  }
)

watch(onResize, async (): Promise<void> => {
  await nextTick()
  scroll.update()
})

watch(routeFromTo, (): void => {
  const hidden = ['get-your-quote']
  for (const slug of hidden) {
    if (routeFromTo.value.includes(slug)) {
      headerStore.updateVisibility(false)
      return
    }
  }
})

watch(routeTo, (): void => {
  const light = ['/']
  const lightContains = ['/blog', '/article']

  headerStore.updateOverlay(false)

  let theme: Theme = 'dark'
  if (light.indexOf(routeTo.value) >= 0) theme = 'light'
  else {
    for (const route of lightContains) {
      if (routeTo.value.includes(route)) theme = 'light'
    }
  }
  headerStore.updateTheme(theme)

  const hidden = ['get-your-quote']
  for (const slug of hidden) {
    if (routeTo.value.includes(slug)) {
      return
    }
  }
  headerStore.updateVisibility(true)
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

watch(headerOverlay, (): void => {
  scroll.disable(headerOverlay.value)
})

watch(
  () => store.pageTransition,
  async (): Promise<void> => {
    scroll.reset()
    await nextTick()
    updateScrollTargetId(route.hash?.substring(1))
    removeLinks()
    el.value && addLinks(el.value)
  }
)

watchEffect((): void => {
  store.updateRouteHistory(route.fullPath)
})

onMounted(async (): Promise<void> => {
  scrollStore.updateEl(el.value)
  store.updateRouteTo(route.fullPath)
  store.updateRouteFromTo(route.fullPath)

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
  store.updateRouteEntered(route.fullPath)
  el.value && addLinks(el.value)
  // setTimeout((): void => {
  //   document.addEventListener('mouseout', showExitIndentOverlay)
  // }, 1500)
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
  .c-header {
    position: fixed;
    z-index: 8;
    bottom: 0;
    width: 100%;
  }

  .c-page {
    position: relative;
    z-index: 1;

    will-change: opacity;
  }

  &__overlay {
    pointer-events: none;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 9;
  }
}
</style>
