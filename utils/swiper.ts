export type Opts = {
  resistance?: number
  prevent?: boolean
  preventUp?: boolean
  preventDown?: boolean
  preventLeft?: boolean
  preventRight?: boolean
  preventClick?: boolean
  preventMouse?: boolean
  dragOnTarget?: boolean
}

export type Params = {
  el: HTMLElement | undefined
  cursor?: boolean
  onPanStart?: Function
  onPanMove?: Function
  onPanEnd?: Function
  onSwipeLeft?: Function
  onSwipeRight?: Function
  onSwipeUp?: Function
  onSwipeDown?: Function
}

export type PanParams = {
  x: number
  y: number
  xDiff: number
  yDiff: number
  xDir: number
  yDir: number
  xVel: number
  yVel: number
  inertia: number
  speed?: number
}

export class Swiper {
  debug: boolean
  panHorizontal: number
  panHorizontalDirection: number
  panHorizontalSpeed: number
  panVertical: number
  panStart: boolean
  panEnd: boolean
  onPan: boolean
  swipeLeft: number
  swipeRight: number
  swipeUp: number
  swipeDown: number
  onPanStart: Function
  onPanMove: Function
  onPanEnd: Function
  onSwipeLeft: Function
  onSwipeRight: Function
  onSwipeUp: Function
  onSwipeDown: Function
  target: HTMLElement | undefined
  xDown: number
  yDown: number
  x: number
  y: number
  oldX: Array<number>
  oldY: Array<number>
  xDir: number
  yDir: number
  xDiff: number
  yDiff: number
  xVel: number
  yVel: number
  inertia: number
  time: number
  to: any
  timer: number
  resistance: number
  prevent: boolean
  preventUp: boolean
  preventDown: boolean
  preventLeft: boolean
  preventRight: boolean
  preventMouse: boolean
  preventClick: boolean
  dragOnTarget: boolean
  customCursor: boolean
  eventPassive: boolean
  onTouchStartHandler: EventListenerOrEventListenerObject
  onTouchMovementHandler: EventListenerOrEventListenerObject
  onTouchEndHandler: EventListenerOrEventListenerObject

  constructor(opts: Opts) {
    this.debug = false

    this.panHorizontal = 0
    this.panHorizontalDirection = 0
    this.panHorizontalSpeed = 0
    this.panVertical = 0
    this.panStart = false
    this.panEnd = false
    this.onPan = false

    this.swipeLeft = 0
    this.swipeRight = 0
    this.swipeUp = 0
    this.swipeDown = 0

    this.onPanStart = () => {}
    this.onPanMove = () => {}
    this.onPanEnd = () => {}
    this.onSwipeLeft = () => {}
    this.onSwipeRight = () => {}
    this.onSwipeUp = () => {}
    this.onSwipeDown = () => {}

    this.target = undefined
    this.xDown = 0
    this.yDown = 0
    this.x = 0
    this.y = 0
    this.oldX = []
    this.oldY = []
    this.xDir = 0
    this.yDir = 0
    this.xDiff = 0
    this.yDiff = 0
    this.inertia = 1
    this.xVel = 0
    this.yVel = 0
    this.time = 0
    this.to = undefined
    this.timer = 0

    this.resistance = opts.resistance || 1
    this.prevent = !!opts.prevent
    this.preventUp = !!opts.preventUp
    this.preventDown = !!opts.preventDown
    this.preventLeft = !!opts.preventLeft
    this.preventRight = !!opts.preventRight
    this.preventMouse = !!opts.preventMouse
    this.preventClick = !!opts.preventClick
    this.dragOnTarget = !!opts.dragOnTarget

    this.customCursor = false

    this.eventPassive = false
    this.onTouchStartHandler = this.handleTouchStart.bind(this)
    this.onTouchMovementHandler = this.handleTouchMove.bind(this)
    this.onTouchEndHandler = this.handleTouchEnd.bind(this)

    this.addListeners()
  }

  init(params: Params): void {
    const { el, cursor } = params
    this.target = el || document.body
    this.customCursor = !!cursor
    this.onPanStart = params.onPanStart || this.onPanStart
    this.onPanMove = params.onPanMove || this.onPanMove
    this.onPanEnd = params.onPanEnd || this.onPanEnd
    this.onSwipeLeft = params.onSwipeLeft || this.onSwipeLeft
    this.onSwipeRight = params.onSwipeRight || this.onSwipeRight
    this.onSwipeUp = params.onSwipeUp || this.onSwipeUp
    this.onSwipeDown = params.onSwipeDown || this.onSwipeDown
    if (this.customCursor) this.target.style.cursor = 'grab'
    this.addListeners()
  }

  updateOpts(opts: Opts): void {
    this.resistance = opts.resistance || 1
    this.prevent = !!opts.prevent
    this.preventUp = !!opts.preventUp
    this.preventDown = !!opts.preventDown
    this.preventLeft = !!opts.preventLeft
    this.preventRight = !!opts.preventRight
    this.preventClick = !!opts.preventClick
    this.preventMouse = !!opts.preventMouse
  }

  destroy(): void {
    clearTimeout(this.to)
    this.removeDragListeners()
    this.removeListeners()
  }

  addListeners(): void {
    this.target?.addEventListener('touchstart', this.onTouchStartHandler, {
      passive: this.eventPassive,
    })
    this.target?.addEventListener('mousedown', this.onTouchStartHandler)
  }

  removeListeners(): void {
    this.target?.removeEventListener('touchstart', this.onTouchStartHandler)
    this.target?.removeEventListener('mousedown', this.onTouchStartHandler)
  }

  addDragListeners(): void {
    const target = this.dragOnTarget && this.target ? this.target : document
    target.addEventListener('touchmove', this.onTouchMovementHandler, {
      passive: this.eventPassive,
    })
    target.addEventListener('touchend', this.onTouchEndHandler)
    target.addEventListener('mousemove', this.onTouchMovementHandler)
    target.addEventListener('mouseup', this.onTouchEndHandler)
  }

  removeDragListeners(): void {
    const target = this.dragOnTarget && this.target ? this.target : document
    target.removeEventListener('touchmove', this.onTouchMovementHandler)
    target.removeEventListener('touchend', this.onTouchEndHandler)
    target.removeEventListener('mousemove', this.onTouchMovementHandler)
    target.removeEventListener('mouseup', this.onTouchEndHandler)
  }

  _prevent(e: Event): void {
    e.preventDefault()
    e.stopPropagation()
  }

  handleTouchStart(e: Event): void {
    if (this.preventClick) this._prevent(e)

    if (this.customCursor && this.target) this.target.style.cursor = 'grabbing'

    const firstTouch: Touch = this.getTouches(e)
    this.xDown = firstTouch.clientX
    this.yDown = firstTouch.clientY
    this.x = firstTouch.clientX
    this.y = firstTouch.clientY
    this.oldX = [this.x]
    this.oldY = [this.y]
    this.xDiff = 0
    this.yDiff = 0
    this.log('touchStart', { x: this.xDown, y: this.yDown })
    this.checkVelocity()
    if (this.timer !== 0 && Math.abs(this.timer - Date.now()) < 500) {
      this.inertia += 0.25
    } else {
      this.inertia = 1
    }

    this.timer = Date.now()

    this.onPanStart()
    this.addDragListeners()
  }

  handleTouchMove(e: Event): void {
    if (this.preventTouch() || this.preventMouse) this._prevent(e)

    const touch: Touch = this.getTouches(e)

    if (!touch) return

    const _x: number = touch.clientX
    const _y: number = touch.clientY

    this.xDir = _x === this.x ? this.xDir : _x > this.x ? 1 : -1
    this.yDir = _y === this.y ? this.yDir : _y > this.y ? 1 : -1

    const _xDiff: number = this.xDown - this.x
    const _yDiff: number = this.y - this.yDown

    this.log('touchUpdate', {
      x: this.x,
      xDiff: this.xDiff,
      y: this.y,
      yDiff: this.yDiff,
      xDir: this.xDir,
      yDir: this.yDir,
      xVel: this.xVel,
      yVel: this.yVel,
      inertia: this.inertia,
      event: e,
    })

    this.x = _x
    this.y = _y
    this.xDiff = _xDiff
    this.yDiff = _yDiff

    this.onPanMove({
      x: this.x,
      y: this.y,
      xDiff: this.xDiff,
      yDiff: this.yDiff,
      xDir: this.xDir,
      yDir: this.yDir,
      xVel: this.xVel,
      yVel: this.yVel,
      inertia: this.inertia,
    })
  }

  handleTouchEnd(e: Event): void {
    if (this.customCursor && this.target) this.target.style.cursor = 'grab'
    this.to && clearTimeout(this.to)
    const time: number = Date.now() - this.timer
    const length: number = this.oldY.length
    const index: number = time - 25 && length > 1 ? length - 1 : length
    this.xVel = Math.abs((this.oldX[index] - this.x) / time)
    this.yVel = Math.abs((this.oldY[index] - this.y) / time)

    this.onPanEnd({
      x: this.x,
      y: this.y,
      xDiff: this.xDiff,
      yDiff: this.yDiff,
      xDir: this.xDir,
      yDir: this.yDir,
      xVel: this.xVel,
      yVel: this.yVel,
      inertia: this.inertia,
      time,
    })

    this.isSwipeUp() && this.onSwipeUp()
    this.isSwipeDown() && this.onSwipeDown()
    this.isSwipeLeft() && this.onSwipeLeft()
    this.isSwipeRight() && this.onSwipeRight()

    this.log('touchEnd', {
      x: this.x,
      y: this.y,
      xDiff: this.xDiff,
      yDiff: this.yDiff,
      xDir: this.xDir,
      yDir: this.yDir,
      xVel: this.xVel,
      yVel: this.yVel,
      time,
    })
    this.removeDragListeners()
  }

  isVertical(): boolean {
    return Math.abs(this.yDiff) > Math.abs(this.xDiff)
  }

  isSwipeUp(): number {
    const isCorrectDirection: boolean = this.isVertical() && this.yDir === -1
    const isFastEnough: boolean = this.yVel > 0.5 * this.resistance
    const thereIsEnoughDisplacement: boolean = Math.abs(this.yDiff) > 100 * this.resistance

    if (isCorrectDirection && (isFastEnough || thereIsEnoughDisplacement)) return 1
    return 0
  }

  isSwipeDown(): number {
    const isCorrectDirection: boolean = this.isVertical() && this.yDir === 1
    const isFastEnough: boolean = this.yVel > 0.5 * this.resistance
    const thereIsEnoughDisplacement: boolean = this.yDiff > 100 * this.resistance

    if (isCorrectDirection && (isFastEnough || thereIsEnoughDisplacement)) return 1
    return 0
  }

  isSwipeLeft(): number {
    const isCorrectDirection: boolean = !this.isVertical() && this.xDir === -1
    const isFastEnough: boolean = this.xVel > 0.5 * this.resistance
    const thereIsEnoughDisplacement: boolean = this.xDiff > 50 * this.resistance

    if (isCorrectDirection && (isFastEnough || thereIsEnoughDisplacement)) return 1
    return 0
  }

  isSwipeRight(): number {
    const isCorrectDirection: boolean = !this.isVertical() && this.xDir === 1
    const isFastEnough: boolean = this.xVel > 0.5 * this.resistance
    const thereIsEnoughDisplacement: boolean = Math.abs(this.xDiff) > 50 * this.resistance

    if (isCorrectDirection && (isFastEnough || thereIsEnoughDisplacement)) return 1
    return 0
  }

  checkVelocity(): void {
    this.time = Date.now()
    this.oldX.push(this.x)
    this.oldY.push(this.y)
    this.to = setTimeout(() => {
      this.checkVelocity()
    }, 50)
  }

  getTouches(e: any): Touch {
    const touch: Array<Touch> = e.touches || (e.originalEvent && e.originalEvent.touches)
    return touch && touch.length ? touch[0] : e
  }

  preventTouch(): boolean {
    const horizontalMovement: boolean = Math.abs(this.xDiff) > Math.abs(this.yDiff)
    const _preventLeft: boolean = this.preventLeft && this.xDir === 1 && horizontalMovement
    const _preventRight: boolean = this.preventRight && this.xDir === -1 && horizontalMovement
    const _preventUp: boolean = this.preventUp && this.yDir === 1 && !horizontalMovement
    const _preventDown: boolean = this.preventDown && this.yDir === -1 && !horizontalMovement
    return this.prevent || _preventLeft || _preventRight || _preventUp || _preventDown
  }

  isTouch(e: any): boolean {
    const touch: Touch = e.touches || (e.originalEvent && e.originalEvent.touches)
    return !!touch
  }

  log(msg: string, data: any): void {
    this.debug && console.log(msg, data)
  }
}
