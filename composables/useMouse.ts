let _x: number = 0
let _y: number = 0

export default function useMouse() {
  const x = ref<number>(_x)
  const y = ref<number>(_y)

  onMounted(() => {
    window.addEventListener('mousemove', onMouseMovement)
  })

  onUnmounted(() => {
    window.removeEventListener('mousemove', onMouseMovement)
  })

  function onMouseMovement(e: MouseEvent): void {
    x.value = e.clientX
    y.value = e.clientY
    _x = e.clientX
    _y = e.clientY
  }

  return { x, y }
}
