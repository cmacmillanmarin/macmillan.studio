export default function useKeyboard() {
  const { onResize, vw } = useResize()

  const maxWidth = ref<number>(0)
  const layoutIndent = ref<number>(0)
  const layoutGap = ref<number>(0)

  onMounted(update)

  watch(onResize, update)

  function update(): void {
    maxWidth.value = parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue('--layout-max-width')
    )
    layoutIndent.value =
      parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--layout-indent')) *
      10
    layoutGap.value =
      parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--layout-indent')) *
      10
  }

  function toScale(n: number): number {
    const mvw = Math.min(vw.value, maxWidth.value)
    return (n * mvw) / 1440
  }

  return {
    maxWidth,
    layoutIndent,
    layoutGap,
    toScale,
  }
}
