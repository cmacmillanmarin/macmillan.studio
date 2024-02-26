type Swipe = {
  resistance?: number
  prevent?: boolean
  preventUp?: boolean
  preventDown?: boolean
  preventLeft?: boolean
  preventRight?: boolean
  preventClick?: boolean
}

export default (opts: Swipe) => {
  const debug: boolean = false

  const panHorizontal = ref<number>(0)
  const panVertical = ref<number>(0)
  const panStart = ref<boolean>(false)
  const panEnd = ref<boolean>(false)
  const onPan = ref<boolean>(false)

  const swipeLeft = ref<number>(0)
  const swipeRight = ref<number>(0)
  const swipeUp = ref<number>(0)
  const swipeDown = ref<number>(0)

  let target: HTMLElement
  let xDown: number = 0
  let yDown: number = 0
  let x: number = 0
  let y: number = 0
  let oldX: Array<number> = []
  let oldY: Array<number> = []
  let xDir: number = 0
  let yDir: number = 0
  let xDiff: number = 0
  let yDiff: number = 0
  let xVel: number = 0
  let yVel: number = 0
  let time: number = 0
  let to: any = undefined
  let timer: number = 0

  let resistance: number = opts.resistance || 1
  let prevent: boolean = !!opts.prevent
  let preventUp: boolean = !!opts.preventUp
  let preventDown: boolean = !!opts.preventDown
  let preventLeft: boolean = !!opts.preventLeft
  let preventRight: boolean = !!opts.preventRight
  let preventClick: boolean = !!opts.preventClick

  let customCursor: boolean = false

  const eventPassive: boolean = false
  const onTouchStartHandler: EventListenerOrEventListenerObject = handleTouchStart
  const onTouchMovementHandler: EventListenerOrEventListenerObject = handleTouchMove
  const onTouchEndHandler: EventListenerOrEventListenerObject = handleTouchEnd

  onUnmounted((): void => {
    destroy()
  })

  function init(params: { el: HTMLElement | undefined; cursor: boolean }): void {
    const { el, cursor } = params
    target = el || document.body
    customCursor = !!cursor
    if (customCursor) target.style.cursor = 'grab'
    addListeners()
  }

  function updateOpts(opts: Swipe): void {
    resistance = opts.resistance || 1
    prevent = !!opts.prevent
    preventUp = !!opts.preventUp
    preventDown = !!opts.preventDown
    preventLeft = !!opts.preventLeft
    preventRight = !!opts.preventRight
    preventClick = !!opts.preventClick
    // console.log('preventClick', preventClick)
  }

  function destroy(): void {
    clearTimeout(to)
    removeListeners()
  }

  function addListeners(): void {
    target.addEventListener('touchstart', onTouchStartHandler, { passive: eventPassive })
    target.addEventListener('mousedown', onTouchStartHandler)
  }

  function removeListeners(): void {
    target?.removeEventListener('touchstart', onTouchStartHandler)
    target?.removeEventListener('mousedown', onTouchStartHandler)
  }

  function addDragListeners(): void {
    document.addEventListener('touchmove', onTouchMovementHandler, { passive: eventPassive })
    document.addEventListener('touchend', onTouchEndHandler)
    document.addEventListener('mousemove', onTouchMovementHandler)
    document.addEventListener('mouseup', onTouchEndHandler)
  }

  function removeDragListeners(): void {
    document.removeEventListener('touchmove', onTouchMovementHandler)
    document.removeEventListener('touchend', onTouchEndHandler)
    document.removeEventListener('mousemove', onTouchMovementHandler)
    document.removeEventListener('mouseup', onTouchEndHandler)
  }

  function _prevent(e: Event): void {
    e.preventDefault()
    e.stopPropagation()
  }

  function handleTouchStart(e: Event): void {
    if (preventClick) _prevent(e)

    if (customCursor) target.style.cursor = 'grabbing'

    const firstTouch: Touch = getTouches(e)
    xDown = firstTouch.clientX
    yDown = firstTouch.clientY
    x = firstTouch.clientX
    y = firstTouch.clientY
    oldX = [x]
    oldY = [y]
    xDiff = 0
    yDiff = 0
    log('touchStart', { x: xDown, y: yDown })
    checkVelocity()
    timer = Date.now()

    panStart.value = !panStart.value
    onPan.value = true

    addDragListeners()
  }

  function handleTouchMove(e: Event): void {
    if (preventTouch() || !isTouch(e)) _prevent(e)

    const touch: Touch = getTouches(e)

    if (!touch) return

    const _x: number = touch.clientX
    const _y: number = touch.clientY

    xDir = _x > x ? 1 : -1
    yDir = _y > y ? 1 : -1

    const _xDiff: number = xDown - x
    const _yDiff: number = y - yDown

    log('touchUpdate', {
      x,
      xDiff,
      y,
      yDiff,
      xDir: xDir,
      yDir: yDir,
      xVel: xVel,
      yVel: yVel,
      event: e,
    })

    x = _x
    y = _y
    xDiff = _xDiff
    yDiff = _yDiff

    panHorizontal.value = xDiff
    panVertical.value = yDiff
  }

  function handleTouchEnd(e: Event): void {
    if (customCursor) target.style.cursor = 'grab'
    to && clearTimeout(to)
    const time: number = Date.now() - timer
    const length: number = oldY.length
    const index: number = time - 25 && length > 1 ? length - 1 : length
    xVel = Math.abs((oldX[index] - x) / time)
    yVel = Math.abs((oldY[index] - y) / time)

    swipeUp.value += isSwipeUp()
    swipeDown.value += isSwipeDown()
    swipeLeft.value += isSwipeLeft()
    swipeRight.value += isSwipeRight()
    panEnd.value = !panEnd.value
    onPan.value = false

    log('touchEnd', {
      x: x,
      y: y,
      xDiff: xDiff,
      yDiff: yDiff,
      xDir: xDir,
      yDir: yDir,
      xVel: xVel,
      yVel: yVel,
      time,
    })
    removeDragListeners()
  }

  function isVertical(): boolean {
    return Math.abs(yDiff) > Math.abs(xDiff)
  }

  function isSwipeUp(): number {
    const isCorrectDirection: boolean = isVertical() && yDir === -1
    const isFastEnough: boolean = yVel > 0.5 * resistance
    const thereIsEnoughDisplacement: boolean = Math.abs(yDiff) > 100 * resistance

    if (isCorrectDirection && (isFastEnough || thereIsEnoughDisplacement)) return 1
    return 0
  }

  function isSwipeDown(): number {
    const isCorrectDirection: boolean = isVertical() && yDir === 1
    const isFastEnough: boolean = yVel > 0.5 * resistance
    const thereIsEnoughDisplacement: boolean = yDiff > 100 * resistance

    if (isCorrectDirection && (isFastEnough || thereIsEnoughDisplacement)) return 1
    return 0
  }

  function isSwipeLeft(): number {
    const isCorrectDirection: boolean = !isVertical() && xDir === -1
    const isFastEnough: boolean = xVel > 0.5 * resistance
    const thereIsEnoughDisplacement: boolean = xDiff > 100 * resistance

    if (isCorrectDirection && (isFastEnough || thereIsEnoughDisplacement)) return 1
    return 0
  }

  function isSwipeRight(): number {
    const isCorrectDirection: boolean = !isVertical() && xDir === 1
    const isFastEnough: boolean = xVel > 0.5 * resistance
    const thereIsEnoughDisplacement: boolean = Math.abs(xDiff) > 100 * resistance

    if (isCorrectDirection && (isFastEnough || thereIsEnoughDisplacement)) return 1
    return 0
  }

  function checkVelocity(): void {
    time = Date.now()
    oldX.push(x)
    oldY.push(y)
    to = setTimeout(() => {
      checkVelocity()
    }, 50)
  }

  function getTouches(e: any): Touch {
    const touch: Array<Touch> = e.touches || (e.originalEvent && e.originalEvent.touches)
    return touch && touch.length ? touch[0] : e
  }

  function preventTouch(): boolean {
    const horizontalMovement: boolean = Math.abs(xDiff) > Math.abs(yDiff)
    const _preventLeft: boolean = preventLeft && xDir === 1 && horizontalMovement
    const _preventRight: boolean = preventRight && xDir === -1 && horizontalMovement
    const _preventUp: boolean = preventUp && yDir === 1 && !horizontalMovement
    const _preventDown: boolean = preventDown && yDir === -1 && !horizontalMovement
    return prevent || _preventLeft || _preventRight || _preventUp || _preventDown
  }

  function isTouch(e: any): boolean {
    const touch: Touch = e.touches || (e.originalEvent && e.originalEvent.touches)
    return !!touch
  }

  function log(msg: string, data: any): void {
    debug && console.log(msg, data)
  }

  return {
    init,
    destroy,
    updateOpts,
    swipeLeft,
    swipeRight,
    swipeUp,
    swipeDown,
    panHorizontal,
    panVertical,
    panStart,
    panEnd,
    onPan,
  }
}
