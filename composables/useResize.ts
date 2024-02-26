export default function useResize() {
  const onResize = ref<boolean>(false)

  const vr = ref<number>(0)
  const vw = ref<number>(0)
  const vh = ref<number>(0)
  const svh = ref<number>(0)

  const throttle: number = 200

  let to: any

  onMounted(() => {
    updateSize()
    window.addEventListener('resize', onResizeHandler)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', onResizeHandler)
  })

  function onResizeHandler(e: Event): void {
    updateSize()
    clearTimeout(to)
    to = setTimeout(() => {
      onResize.value = !onResize.value
    }, throttle)
  }

  function updateSize(): void {
    if (vw.value !== window.innerWidth) {
      svh.value = window.innerHeight
    }
    vw.value = window.innerWidth
    vh.value = window.innerHeight
    vr.value = vw.value / vh.value
  }

  return { vr, vw, vh, svh, onResize }
}
