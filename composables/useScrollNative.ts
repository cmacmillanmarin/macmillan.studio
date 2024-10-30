import { gsap } from 'gsap'
import type { Direction } from '~/types/front/store/scroll'

export default function useScrollNative() {
  const { vh } = useResize()
  const { addTicker, killTicker } = useRaf()

  let _el: HTMLElement | null = null
  let _children: Array<HTMLElement> = []
  let _target: number = 0
  let _current: number = 0
  let _previous: number = 0
  let _direction: Direction = 'up'
  let _bounding: number = 0
  let _update: Function

  function create(params: { el: HTMLElement; update: Function; position: number }) {
    _el = params.el
    _update = params.update
    gsap.set(window, { scrollTo: params.position })

    getChildren()
    update()
    addScrollListeners()
    addTicker(onNativeScrollRaf)
  }

  function update() {
    for (const child of _children) {
      const { top, left, bottom, right } = child.getBoundingClientRect()
      child.dataset.positionLeft = left.toString()
      child.dataset.positionTop = (top + _current).toString()
      child.dataset.positionRight = right.toString()
      child.dataset.positionBottom = (bottom + _current).toString()
    }
  }

  function getChildren() {
    _children = Array.from(
      _el?.querySelectorAll('[data-scroll-set-progress], [data-scroll-set-position]') || []
    )
  }

  function onNativeScroll() {
    _target = _el?.scrollTop || 0
    _direction = _target < _previous ? 'up' : 'down'
    _bounding = (_el?.scrollHeight || vh.value) - vh.value
    _previous = _current
  }

  function onNativeScrollInTarget() {
    return Math.abs(_target - _current) < 0.01
  }

  function onNativeScrollRaf() {
    if (!onNativeScrollInTarget()) {
      _current += (_target - _current) * 0.175
    } else {
      _current = _target
    }
    _update({
      current: round(_current),
      currentVertical: round(_current),
      speed: 0,
      direction: _direction,
      bounding: _bounding,
      inTarget: Math.abs(_current - _target) < 0.1,
    })
  }

  function to(params: { value: number; fixed?: boolean }) {
    gsap[params.fixed ? 'set' : 'to'](_el, { scrollTo: params.value })
  }

  function toId(params: { value: string; fixed?: boolean }) {
    const target: HTMLElement | null = document.getElementById(params.value)
    const offset: number = parseFloat(target?.dataset.scrollTargetOffset || '0')
    target && gsap[params.fixed ? 'set' : 'to'](_el, { scrollTo: { y: target, offsetY: offset } })
  }

  function reset() {
    if (!_el) return
    _target = _current = 0
    getChildren()
    update()
  }

  function addScrollListeners() {
    _el?.addEventListener('scroll', onNativeScroll, { passive: false })
  }

  function removeScrollListeners() {
    killTicker(onNativeScrollRaf)
    _el?.removeEventListener('scroll', onNativeScroll)
  }

  function destroy() {
    removeScrollListeners()
  }

  return {
    create,
    update,
    to,
    toId,
    reset,
    destroy,
  }
}
