import { storeToRefs } from 'pinia'
import useStore from '~/store/useStore'
import useScrollStore from '~/store/useScrollStore'
import type { Data } from '~/types/front/store/scroll'
import { targetify } from '~/utils'

export default function useScroll() {
  const { $three }: any = useNuxtApp()

  const route = useRoute()
  const routeHash = computed<string>(() => route.hash?.substring(1) || '')

  const { touch } = useDevice()
  const { onResize } = useResize()

  const { create: createScrollLock, destroy: destroyScrollLock } = useScrollLock()

  const store = useStore()
  const { sectionThrottle } = storeToRefs(store)
  const { updateSectionThrottle } = store

  const scrollStore = useScrollStore()
  const {
    updateEl,
    updateActiveMode,
    updateScrollData,
    updateScrollMode,
    updateScrollTargetId,
    updateScrollUpdated,
    disableScroll,
  } = scrollStore
  const {
    bounding,
    scrollMode,
    scrollPosition,
    scrollDisabled,
    scrollTarget,
    scrollFixedTarget,
    scrollTargetId,
    scrollFixedTargetId,
    scrollUpdate,
    isVirtualScroll,
    renderCallbacks,
  } = storeToRefs(scrollStore)

  const virtualScroll = useScrollVirtual()
  const nativeScroll = useScrollNative()

  const el = ref<HTMLElement>()

  watch(scrollMode, () => {
    const mode = scrollMode.value
    if (!mode) return
    const params = {
      el: el.value as HTMLElement,
      update: onScroll,
      position: scrollPosition.value,
    }
    const isVirtualScroll = (mode === 'auto' && !touch.value) || mode === 'virtual'
    if (isVirtualScroll) {
      updateActiveMode('virtual')
      nativeScroll.destroy()
      virtualScroll.create(params)
      virtualScroll.disable(scrollDisabled.value)
    } else {
      updateActiveMode('native')
      virtualScroll.destroy()
      nativeScroll.create(params)
    }
  })

  watch(scrollDisabled, () => {
    virtualScroll.disable(scrollDisabled.value)
    if (scrollDisabled.value) createScrollLock({ el: el.value as HTMLElement })
    else destroyScrollLock()
  })

  watch(scrollTarget, () => {
    if (scrollTarget.value === -1) return
    isVirtualScroll.value
      ? virtualScroll.to({ value: scrollTarget.value })
      : nativeScroll.to({ value: scrollTarget.value })
  })

  watch(scrollFixedTarget, () => {
    if (scrollFixedTarget.value === -1) return
    isVirtualScroll.value
      ? virtualScroll.to({ value: scrollFixedTarget.value, fixed: true })
      : nativeScroll.to({ value: scrollFixedTarget.value, fixed: true })
  })

  watch(scrollTargetId, () => {
    if (scrollTargetId.value === '') return
    const targetId = targetify(scrollTargetId.value)
    isVirtualScroll.value
      ? virtualScroll.toId({ value: targetId })
      : nativeScroll.toId({ value: targetId })
  })

  watch(scrollFixedTargetId, () => {
    if (scrollFixedTargetId.value === '') return
    const targetId = targetify(scrollFixedTargetId.value)
    isVirtualScroll.value
      ? virtualScroll.toId({ value: targetId, fixed: true })
      : nativeScroll.toId({ value: targetId, fixed: true })
  })

  watch(routeHash, () => {
    updateScrollTargetId(routeHash.value)
  })

  watch([onResize, scrollUpdate], async () => {
    await nextTick()
    update()
  })

  watch(bounding, () => {
    $three.ready && $three.updateScrollBounding(bounding.value)
  })

  watch(touch, () => {
    // forceReset()
  })

  onMounted(() => {
    disableScroll(true)
  })

  function init(params: { el: HTMLElement }) {
    el.value = params.el
    updateEl(el.value)
    updateScrollMode('virtual')
  }

  function update() {
    isVirtualScroll.value ? virtualScroll.update() : nativeScroll.update()
    updateScrollUpdated()
  }

  function reset() {
    isVirtualScroll.value ? virtualScroll.reset() : nativeScroll.reset()
    updateScrollUpdated()
  }

  async function forceReset() {
    updateScrollMode(undefined)
    await nextTick()
    updateScrollMode('virtual')
  }

  function onScroll(data: Data) {
    if ($three.ready) {
      $three.updateCamera(data.current)
      $three.render()
    }
    for (const callback of renderCallbacks.value) callback()
    updateSectionThrottle(data.speed > 1000 || sectionThrottle.value)
    updateScrollData(data)
  }

  onBeforeUnmount(() => {
    nativeScroll.destroy()
    virtualScroll.destroy()
  })

  return {
    init,
    reset,
    forceReset,
  }
}
