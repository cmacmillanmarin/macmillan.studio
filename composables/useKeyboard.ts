export default function useKeyboard() {
  const keyPressed = ref<string>('')
  const onEnter = ref<boolean>(false)
  const onEscape = ref<boolean>(false)

  onMounted(() => {
    window.addEventListener('keydown', _onKeyDown)
  })
  onUnmounted(() => {
    window.removeEventListener('keydown', _onKeyDown)
  })

  async function _onKeyDown(e: KeyboardEvent): Promise<void> {
    if (e.key === 'Enter') onEnter.value = !onEnter.value
    if (e.key === 'Escape') onEscape.value = !onEscape.value
    keyPressed.value = ''
    await nextTick()
    keyPressed.value = e.key
  }

  return { onEnter, onEscape, keyPressed }
}
