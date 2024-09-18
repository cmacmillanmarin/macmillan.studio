import { storeToRefs } from 'pinia'
import useStore from '~/store/useStore'
import useScrollStore from '~/store/useScrollStore'
import type { Data } from '~/types/front/store/scroll'
import { targetify } from '~/utils'

export default function useScroll() {
  const route = useRoute()
  const routeHash = computed<string>(() => route.hash?.substring(1) || '')

  const { touch } = useDevice()

  const { create: createScrollLock, destroy: destroyScrollLock } = useScrollLock()

  const store = useStore()
  const { isPreloaded } = storeToRefs(store)

  const scrollStore = useScrollStore()
  const {
    updateEl,
    updateActiveMode,
    updateScrollData,
    updateScrollMode,
    updateScrollTargetId,
    disableScroll,
  } = scrollStore
  const {
    scrollMode,
    scrollPosition,
    scrollDisabled,
    scrollTarget,
    scrollTargetId,
    scrollUpdate,
    isVirtualScroll,
  } = storeToRefs(scrollStore)

  const virtualScroll = useScrollVirtual()
  const nativeScroll = useScrollNative()

  const el = ref<HTMLElement>()

  watch(isPreloaded, () => {
    disableScroll(false)
    el.value && init({ el: el.value })
  })

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
      ? virtualScroll.to(scrollTarget.value)
      : nativeScroll.to(scrollTarget.value)
  })

  watch(scrollTargetId, () => {
    if (scrollTargetId.value === '') return
    const targetId = targetify(scrollTargetId.value)
    isVirtualScroll.value ? virtualScroll.toId(targetId) : nativeScroll.toId(targetId)
  })

  watch(routeHash, () => {
    updateScrollTargetId(routeHash.value)
  })

  watch([scrollUpdate], async () => {
    await nextTick()
    update()
  })

  watch(touch, () => {
    forceReset()
  })

  onMounted(() => {
    disableScroll(!isPreloaded.value)
  })

  function init(params: { el: HTMLElement }) {
    el.value = params.el
    updateEl(el.value)
    updateScrollMode('auto')
  }

  function update() {
    isVirtualScroll.value ? virtualScroll.update() : nativeScroll.update()
  }

  function reset() {
    isVirtualScroll.value ? virtualScroll.reset() : nativeScroll.reset()
  }

  async function forceReset() {
    updateScrollMode(undefined)
    await nextTick()
    updateScrollMode('auto')
  }

  function onScroll(data: Data) {
    const { $scene }: any = useNuxtApp()
    if ($scene?.ready) {
      $scene.updateY(data.current)
      $scene.render()
    }
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
