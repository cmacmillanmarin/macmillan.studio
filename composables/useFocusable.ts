export default function useFocusable() {
  const _el = ref<HTMLElement>()

  function add(el: HTMLElement): void {
    _el.value = el
    _el.value.addEventListener('mousedown', onClick)
    _el.value.addEventListener('blur', onBlur)
  }

  function onClick(e: Event): void {
    _el.value?.classList.add('clicked')
  }

  function onBlur(e: Event): void {
    _el.value?.classList.remove('clicked')
  }

  onBeforeUnmount((): void => {
    _el.value?.removeEventListener('mousedown', onClick)
    _el.value?.removeEventListener('blur', onBlur)
  })

  return { add }
}
