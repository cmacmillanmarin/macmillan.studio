export default function useCss() {
  const { isMobileLayout } = useDevice()
  const { onResize, vw } = useResize()

  const maxWidth = ref<number>(0)
  const layoutColumns = ref<number>(12)
  const columnWidth = ref<number>(0)
  const layoutMargin = ref<number>(0)
  const layoutGutter = ref<number>(0)

  onMounted(update)

  watch(onResize, update)

  function update(): void {
    maxWidth.value = parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue('--layout-max-width')
    )
    layoutMargin.value =
      parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--layout-margin')) *
      10
    layoutGutter.value =
      parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--layout-gutter')) *
      10
    layoutColumns.value = parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue('--layout-columns')
    )
    columnWidth.value =
      (Math.min(maxWidth.value, vw.value) -
        layoutMargin.value * 2 -
        layoutGutter.value * (layoutColumns.value - 1)) /
      layoutColumns.value
  }

  function toScale(n: number): number {
    const mvw = Math.min(vw.value, maxWidth.value)
    return (n * mvw) / (isMobileLayout.value ? 375 : 1440)
  }

  function getColumnWidth(n: number): number {
    return columnWidth.value * n + layoutGutter.value * (n - 1)
  }

  return {
    maxWidth,
    columnWidth,
    layoutColumns,
    layoutMargin,
    layoutGutter,
    toScale,
    getColumnWidth,
  }
}
