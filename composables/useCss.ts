export default function useKeyboard() {
  const { onResize } = useResize()

  const maxWidth = ref<number>(0)
  const menuHeight = ref<number>(0)
  const menuHeightSticky = ref<number>(0)
  const layoutIndent = ref<number>(0)
  const layoutGap = ref<number>(0)
  const gapS = ref<number>(0)

  onMounted(update)

  watch(onResize, update)

  function update(): void {
    maxWidth.value = parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue('--layout-max-width')
    )
    menuHeight.value =
      parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--menu-height')) * 10
    menuHeightSticky.value =
      parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue('--menu-height--sticky')
      ) * 10
    layoutIndent.value =
      parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--layout-indent')) *
      10
    layoutGap.value =
      parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--layout-indent')) *
      10
    gapS.value = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--s')) * 10
  }

  return {
    maxWidth,
    menuHeight,
    menuHeightSticky,
    layoutIndent,
    layoutGap,
    gapS,
  }
}
