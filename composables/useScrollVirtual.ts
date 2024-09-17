//
// requires:
// ~/composables/useResize
// ~/composables/useDevice
// ~/composables/useRaf
// ~/composables/useSwipe
//

import { gsap } from 'gsap'
import { round, toPx, focusable } from '~/utils/index'
import type { Direction } from '~/types/front/store/scroll'

export default function useScrollVirtual() {
  const { vh } = useResize()
  const { safari, hasWheelEvent } = useDevice()
  const { addTicker, killTicker } = useRaf()
  const {
    init: initPan,
    destroy: destroyPan,
    panStart,
    panVertical,
    panEnd,
  } = useSwipe({
    prevent: true,
  })

  const config = useRuntimeConfig()
  const { IS_DEV } = config.public

  let _debug: boolean = false

  let _el: HTMLElement
  let _disabled: boolean = false
  let _inRaf: boolean = false
  let _previous: number = 0
  let _elasticity: number = 0.1
  let _velocity: number = 1
  let _bounding: number = 0
  let _panTarget: number = -1
  let _currentSticky: Array<number> = []

  let _shiftPressed: boolean = false

  let _backup: Array<string> = []

  let _updateCallback: Function = () => {}

  type Bounding = { top: number; height: number }

  interface Sticky {
    value: boolean
    top: number
    bottom: number
    parent: HTMLElement
    bounding: Bounding
  }

  interface Child {
    scrollable: boolean
    el: HTMLElement
    bounding: Bounding
    inView: boolean
    sticky: Sticky
    setProgress: boolean
    setPosition: boolean
    continuous: boolean
  }
  let _children: Array<Child> = []

  const active = ref<boolean>(false)
  const target = ref<number>(0)
  const current = ref<number>(0)
  const direction = ref<Direction>('down')

  watch(panVertical, (): void => {
    if (_disabled || Math.abs(panVertical.value) < 20) return
    if (_panTarget === -1) _panTarget = target.value
    target.value = _clampTarget(_panTarget - panVertical.value)
  })

  watch([panStart, panEnd], (): void => {
    _panTarget = target.value
  })

  onMounted(() => {
    addTicker(_raf)
  })

  interface CreateParams {
    el: HTMLElement
    update: Function
    position: number
  }

  async function create(params: CreateParams): Promise<void> {
    const { el, update, position } = params
    if (!el) _log('element not defined!')
    else if (!hasWheelEvent.value) _log('wheel event not supported!')
    else {
      _log('create()')
      active.value = true
      _el = el
      if (update) _updateCallback = update
      _getChildren({ reset: true })
      await _updateSize()
      _addEventListeners()
      if (position !== 0) {
        _previous = 0
        current.value = target.value = position
        _run({ force: true })
      }
    }
  }

  async function update(): Promise<void> {
    if (!active.value) return
    _log('update()')
    _getChildren({ reset: false })
    await _updateSize()
    _run({ force: true })
  }

  function disable(value: boolean): void {
    _log(`disable(): ${value}`)
    _disabled = value
  }

  function to(value: number): void {
    target.value = _clampTarget(value)
  }

  function toId(value: string): void {
    const target: HTMLElement | null = document.getElementById(value)
    target && _scrollToEl(target)
  }

  async function reset(): Promise<void> {
    if (!active.value) return
    _log('reset()')
    target.value = current.value = 0
    _restoreChildren()
    _getChildren({ reset: true })
    await _updateSize()
    _run()
  }

  function destroy(): void {
    if (!active.value) return
    _log('destroy()')
    killTicker(_raf)
    _removeEventListeners()
    if (!_el || !_el.parentElement) {
      _log('element without parent')
      return
    }
    _el.parentElement.style.overflow = 'visible'
    _el.parentElement.style.height = 'auto'
    target.value = current.value = 0
    _restoreChildren()
    _children = []
    _disabled = true
    active.value = false
  }

  function _restoreChildren(): void {
    for (const child of _children) {
      if (child.scrollable) child.el.dataset.scroll = ''
      if (child.sticky.value) {
        child.el.dataset.scrollSticky = ''
        child.el.dataset.scrollStickyTop = child.sticky.top.toString()
        child.el.dataset.scrollStickyBottom = child.sticky.bottom.toString()
        child.sticky.parent.style.removeProperty('transform')
      }
      if (child.setPosition) child.el.dataset.scrollSetPosition = ''
      if (child.setProgress) child.el.dataset.scrollSetProgress = ''
      child.el.style.removeProperty('transform')
    }
  }

  function _inTarget(): boolean {
    return Math.abs(current.value - target.value) < 0.1
  }

  interface getChildrenParams {
    reset: boolean
  }
  function _getChildren(params: getChildrenParams): void {
    _log(`_getChildren()`)

    const { reset } = params
    const elements: NodeListOf<HTMLElement> = _el.querySelectorAll(
      '[data-scroll], [data-scroll-sticky], [data-scroll-set-progress], [data-scroll-set-position]'
    )

    const bounding: Bounding = { top: 0, height: 0 }
    const inView: boolean = false

    if (reset) _children = []

    for (const el of elements) {
      const sticky = el.dataset.scrollSticky != undefined
      const scrollable = el.dataset.scroll != undefined
      const permanent = el.dataset.scrollPermanent != undefined
      const continuous = el.dataset.scrollContinuous != undefined
      const setProgress = el.dataset.scrollSetProgress != undefined
      const setPosition = el.dataset.scrollSetPosition != undefined

      if (scrollable || sticky) {
        const { willChange } = getComputedStyle(el)
        if (willChange === 'auto') el.style.willChange = 'transform'
        else if (!willChange.includes('transform'))
          console.warn('Element must have will-change: transform', el)
      }

      const stickyTop = parseFloat(window.getComputedStyle(el).top)
      _children.push({
        el,
        bounding,
        inView,
        sticky: {
          value: sticky,
          top: stickyTop,
          bottom: parseFloat(el.dataset.scrollStickyBottom || '0'),
          parent: el.parentElement as HTMLElement,
          bounding: bounding,
        },
        setProgress,
        setPosition,
        scrollable,
        continuous,
      })

      if (!permanent) delete el.dataset.scroll
      delete el.dataset.scrollSticky
      delete el.dataset.scrollStickyTop
      delete el.dataset.scrollStickyBottom
      delete el.dataset.scrollSetPosition
      delete el.dataset.scrollSetProgress
    }
  }

  function _updateChildren(): void {
    _log(`_updateChildren()`)
    _cleanTransforms()
    for (const child of _children) {
      const childBounding = child.el.getBoundingClientRect()
      child.bounding = {
        top: childBounding.top,
        height: childBounding.height,
      }
      if (child.setPosition) {
        child.el.dataset.positionTop = childBounding.top.toString()
        child.el.dataset.positionLeft = childBounding.left.toString()
      }
      child.inView = _inView(childBounding)
      if (child.setProgress) {
        child.el.dataset.scrollProgress = _getProgress(child)
        child.el.dataset.scrollCurrent = _getCurrentScroll(child)
      }
      if (child.sticky.value) {
        const parentBounding = child.sticky.parent.getBoundingClientRect()
        child.sticky.bounding = {
          top: parentBounding.top,
          height: parentBounding.height,
        }
        const stickyPosition = _stickyPositionOf(child)
        child.el.dataset.scrollStickyLimitTop = stickyPosition.topLimit.toString()
        child.el.dataset.scrollStickyLimitBottom = stickyPosition.bottomLimit.toString()
      }
    }
    _restoreTransforms()
  }

  function _cleanTransforms(): void {
    if (_backup.length > 0) _log(`_backup array wasn't empty, you better review your pipelines`)
    for (const child of _children) {
      const { transform } = window.getComputedStyle(child.el)
      child.el.style.removeProperty('transform')
      _backup.push(transform)
    }
  }

  function _restoreTransforms(): void {
    for (const i in _children) {
      if (_backup[i] !== 'none') _children[i].el.style.transform = _backup[i]
    }
    _backup = []
  }

  function _inView(bounding: Bounding): boolean {
    const initPos = Math.floor(bounding.top)
    const lastPos = Math.ceil(initPos + bounding.height)
    const windowSize = vh.value
    const scrollPoint = current.value
    return scrollPoint + windowSize + 100 > initPos && scrollPoint - 100 < lastPos
  }

  async function _updateSize(): Promise<void> {
    if (!active.value) return
    _log(`_updateSize()`)
    if (_el.parentElement) {
      _el.parentElement.style.overflow = safari.value ? 'hidden' : 'clip'
      _el.parentElement.style.height = toPx(vh.value)
      await nextTick()
    }
    _bounding = Math.floor(_el.getBoundingClientRect().height - vh.value)
    _log(`_bounding: ${_bounding}`)
    _updateChildren()
  }

  function _onWheel(e: WheelEvent): void {
    if (_disabled) return
    _log('_onWheel()')
    e.preventDefault()
    const { deltaY } = e
    const y = deltaY * _velocity
    target.value = _clampTarget(target.value + y)
  }

  function _clampTarget(value: number): number {
    return Math.max(Math.min(_bounding, value), 0)
  }

  // function _startRaf(): void {
  //   if (!_inRaf) {
  //     _log(`_startRaf()`)
  //     _inRaf = true
  //     addTicker(_raf)
  //   }
  // }

  // function _stopRaf(): void {
  //   _log(`_stopRaf()`)
  //   _inRaf = false
  //   current.value = target.value
  //   killTicker(_raf)
  // }

  function _raf(): void {
    current.value += (target.value - current.value) * _elasticity
    _run()
    // _inTarget() && _stopRaf()
  }

  interface RunParams {
    force: boolean
  }
  function _run(params?: RunParams): void {
    const force = !!params?.force
    if (current.value !== _previous) {
      direction.value = current.value < _previous ? 'up' : 'down'
    }
    _currentSticky = []
    for (const child of _children) {
      let y = 0
      const { el, scrollable, continuous, bounding, sticky, setProgress } = child
      const fixed = el.dataset.scrollFixedTo != undefined && el.dataset.scrollFixedFrom != undefined
      const { top, height } = bounding
      if (force) child.inView = _inView(bounding)
      if (sticky.value) {
        const stickyPosition = _stickyPositionOf(child)
        y = stickyPosition.y
        if (y > 0 && y <= stickyPosition.bottomLimit) {
          if (child.el.dataset.scrollStickyState !== 'true') {
            child.el.dataset.scrollStickyState = 'true'
          }
          _currentSticky.push(y)
        } else if (child.el.dataset.scrollStickyState !== 'false') {
          child.el.dataset.scrollStickyState = 'false'
        }
      } else if (fixed) {
        y = _fixedPositionOf(child)
      } else if ((scrollable && child.inView) || continuous) y = round(current.value) * -1
      else if (scrollable && current.value > top) y = Math.ceil(top + height) * -1
      gsap.set(child.el, { y })
      if (!force) child.inView = _inView(bounding)
      if (setProgress) {
        child.el.dataset.scrollProgress = _getProgress(child)
        child.el.dataset.scrollCurrent = _getCurrentScroll(child)
      }
    }

    _previous = current.value
    _updateCallback({
      current: round(current.value),
      currentVertical: _currentSticky.length
        ? round(current.value - _currentSticky.reduce((a, b) => a + b, 0))
        : round(current.value),
      speed: round(Math.abs(target.value - current.value)),
      direction: direction.value,
      bounding: _bounding,
      inTarget: _inTarget(),
    })
  }

  function _stickyPositionOf(child: Child): { topLimit: number; bottomLimit: number; y: number } {
    const { top, bottom, bounding } = child.sticky
    const topLimit = Math.ceil(child.bounding.top - top)
    const topGap = Math.ceil(child.bounding.top - bounding.top)
    const bottomLimit = Math.ceil(
      Math.max(0, bounding.height - child.bounding.height - bottom - topGap)
    )
    const y = Math.min(Math.max(0, round(current.value) - topLimit), bottomLimit)
    return {
      topLimit,
      bottomLimit,
      y,
    }
  }

  function _fixedPositionOf(child: Child): number {
    const { el } = child
    const from = parseFloat(el.dataset.scrollFixedFrom || '0')
    const to = parseFloat(el.dataset.scrollFixedTo || '0')
    if (current.value <= from) {
      return current.value * -1
    }
    if (current.value >= from && current.value <= to) {
      return from * -1
    }
    const extra = current.value - to
    return (from + extra) * -1
  }

  function _getProgress(child: Child): string {
    const progress =
      (round(current.value) - child.bounding.top + vh.value) / (child.bounding.height + vh.value)
    return Math.max(0, Math.min(progress, 1)).toFixed(2)
  }

  function _getCurrentScroll(child: Child): string {
    const currentScroll = round(round(current.value) - child.bounding.top + vh.value)
    return Math.max(0, currentScroll).toString()
  }

  function _scrollToEl(el: HTMLElement, gap?: number) {
    if (!el) return
    const _gap: number = gap || 0
    _cleanTransforms()
    const { top, height } = el.getBoundingClientRect()
    _restoreTransforms()
    const scrollOffset: number = parseFloat(el.dataset.scrollTargetOffset || '0')
    const scrollTop: boolean = el.dataset.scrollTargetTop !== undefined
    const vwHeight: number = scrollTop ? 0 : vh.value * 0.5
    const heightTarget: number = scrollTop ? 0 : height * 0.5
    const _target: number = _clampTarget(top - vwHeight + heightTarget - scrollOffset)
    if (Math.abs(target.value - _target) > _gap) {
      target.value = _target
      // _startRaf()
    }
  }

  function _keyDown(e: KeyboardEvent): void {
    if (_disabled) return
    switch (e.code) {
      case 'ShiftLeft':
        _shiftPressed = true
        break
      default:
        break
    }
  }

  function _keyUp(e: KeyboardEvent): void {
    if (_disabled) return
    let activeElement: HTMLElement
    let tagName: string
    let tabFixed: boolean
    switch (e.code) {
      case 'Tab':
        if (!document.activeElement) return
        activeElement = document.activeElement as HTMLElement
        tagName = activeElement.tagName.toLowerCase()
        tabFixed = activeElement.dataset.tabFixed === ''
        focusable.includes(tagName) &&
          !tabFixed &&
          _scrollToEl(document.activeElement as HTMLElement, 100)
        break
      case 'Space':
        if (document.activeElement) {
          activeElement = document.activeElement as HTMLElement

          tagName = activeElement.tagName.toLowerCase()
          if (focusable.includes(tagName)) return
        }
        target.value = _clampTarget(target.value + 100 * (_shiftPressed ? -1 : 1))
        break
      case 'ArrowDown':
        target.value = _clampTarget(target.value + 100)
        break
      case 'ArrowUp':
        target.value = _clampTarget(target.value - 100)
        break
      case 'ShiftLeft':
        _shiftPressed = false
        break
      default:
        break
    }
  }

  function _addEventListeners(): void {
    _log('_addEventListeners()')
    const disablePassive = { passive: false }
    // initPan({ el: document.body, cursor: false })
    _el.addEventListener('wheel', _onWheel, disablePassive)
    window.addEventListener('keyup', _keyUp)
    window.addEventListener('keydown', _keyDown)
  }

  function _removeEventListeners(): void {
    _log('_removeEventListeners()')
    // destroyPan()
    _el.removeEventListener('wheel', _onWheel)
    window.addEventListener('keyup', _keyUp)
    window.addEventListener('keydown', _keyDown)
    // _stopRaf()
  }

  function _log(msg: string): void {
    _debug && console.log(`useScroll ~ ${msg}`)
  }

  onBeforeUnmount(() => {
    destroy()
  })

  return {
    create,
    reset,
    update,
    destroy,
    disable,
    to,
    toId,
    active,
    current,
    direction,
  }
}
