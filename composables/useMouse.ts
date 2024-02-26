export default function useMouse() {
  const x = ref<number>(0)
  const y = ref<number>(0)

  onMounted(() => {
    window.addEventListener('mousemove', onMouseMovement)
  })

  onUnmounted(() => {
    window.removeEventListener('mousemove', onMouseMovement)
  })

  function onMouseMovement(e: MouseEvent): void {
    x.value = e.clientX
    y.value = e.clientY
  }

  return { x, y }
}
