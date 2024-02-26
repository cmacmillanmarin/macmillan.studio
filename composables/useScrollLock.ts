//
// requires:
// ~/composables/useResize
//

export default function useScrollLock() {
  const { vh } = useResize()

  const _debug: boolean = false

  const el = ref<HTMLElement>()

  let _dir: number = 1

  interface createObject {
    el: HTMLElement
  }

  function create(obj?: createObject): void {
    _log('create()')
    el.value = obj?.el
    _addEventListeners()
  }

  function destroy(): void {
    _log('destroy()')
    _removeEventListeners()
  }

  function _preventScroll(e: WheelEvent): void {
    const { deltaY } = e
    _dir = deltaY < 0 ? 1 : -1
    _prevent(e)
  }

  function _preventTouch(e: TouchEvent): void {
    let _startingY = 0
    const { type, touches } = e
    const { screenY } = touches[0]
    if (type === 'touchstart') _startingY = screenY
    if (type === 'touchmove') {
      _dir = screenY < _startingY ? 1 : -1
      _prevent(e)
    }
  }

  function _prevent(e: WheelEvent | TouchEvent): void {
    const { scrollTop, scrollHeight } = el.value || { scrollTop: 0, scrollHeight: vh.value }
    const atTop = scrollTop === 0
    const atBottom = scrollTop === scrollHeight - vh.value
    if ((_dir === 1 && atBottom) || (_dir === -1 && atTop)) {
      e.preventDefault()
      e.stopPropagation()
    }
  }

  function _addEventListeners(): void {
    _log('_addEventListeners()')
    const disablePassive = { passive: false }
    window.addEventListener('wheel', _preventScroll, disablePassive)
    window.addEventListener('touchstart', _preventTouch, disablePassive)
    window.addEventListener('touchmove', _preventTouch, disablePassive)
    el.value?.addEventListener('wheel', _preventScroll, disablePassive)
    el.value?.addEventListener('touchstart', _preventTouch, disablePassive)
    el.value?.addEventListener('touchmove', _preventTouch, disablePassive)
  }

  function _removeEventListeners(): void {
    _log('_removeEventListeners()')
    window.removeEventListener('wheel', _preventScroll)
    window.removeEventListener('touchstart', _preventTouch)
    window.removeEventListener('touchmove', _preventTouch)
    el.value?.removeEventListener('wheel', _preventScroll)
    el.value?.removeEventListener('touchstart', _preventTouch)
    el.value?.removeEventListener('touchmove', _preventTouch)
  }

  function _log(msg: string): void {
    _debug && console.log(`useScrollLock ~ ${msg}`)
  }

  return {
    create,
    destroy,
  }
}
