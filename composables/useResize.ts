export default function useResize() {
  const onResize = ref<boolean>(false)

  const vr = ref<number>(0)
  const vw = ref<number>(0)
  const lvw = ref<number>(0)
  const vh = ref<number>(0)
  const svh = ref<number>(0)

  const throttle: number = 200

  let to: any

  onMounted(() => {
    updateSize()
    window.addEventListener('resize', onResizeHandler)
    // In-app browsers (Instagram, Facebook, TikTok) collapse their chrome shortly after
    // load and resize the webview without always firing a window resize, leaving every
    // viewport-derived position measured against the pre-collapse height.
    window.visualViewport?.addEventListener('resize', onResizeHandler)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', onResizeHandler)
    window.visualViewport?.removeEventListener('resize', onResizeHandler)
  })

  function onResizeHandler(): void {
    // The visual viewport also fires on pinch zoom and on the soft keyboard, neither of
    // which changes the layout viewport we measure.
    if (vw.value === window.innerWidth && vh.value === window.innerHeight) return
    updateSize()
    clearTimeout(to)
    to = setTimeout(() => {
      onResize.value = !onResize.value
    }, throttle)
  }

  function updateSize(): void {
    const maxWidth = parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue('--layout-max-width')
    )
    if (vw.value !== window.innerWidth) {
      svh.value = window.innerHeight
    }
    vw.value = window.innerWidth
    lvw.value = Math.min(vw.value, maxWidth)
    vh.value = window.innerHeight
    vr.value = vw.value / vh.value
  }

  return { vr, vw, lvw, vh, svh, onResize }
}
