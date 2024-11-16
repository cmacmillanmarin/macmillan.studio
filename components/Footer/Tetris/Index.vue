<template>
  <canvas
    ref="el"
    class="footer__tetris"
    v-intersect="{ callback: onIntersect }"
    @touchstart="onTouchStart"
    @touchend="onTouchEnd" />
  <div
    v-show="active && isMobileLayout && !over"
    ref="domEl"
    class="footer__tetris__dom"
    @touchend="onPieceClick">
    <div ref="domPieceEl" class="footer__tetris__dom__piece" />
  </div>
</template>

<script lang="ts" setup>
import { gsap } from 'gsap'
import type { Tetris, Matrix, Piece, Position } from '~/types/front/tetris'
import useScrollStore from '~/store/useScrollStore'
import { storeToRefs } from 'pinia'
import { toPx } from '~/utils'

const props = defineProps<{
  active: boolean
}>()

const scrollStore = useScrollStore()
const { updateScrollFixedTarget } = scrollStore
const { bounding } = storeToRefs(scrollStore)

const { maxWidth, toScale } = useCss()
const { vw, vh, onResize } = useResize()
const { addTicker, killTicker } = useRaf()
const { keyPressed } = useKeyboard()
const { isMobileLayout, dpr } = useDevice()

const el = ref<HTMLCanvasElement>()
const domEl = ref<HTMLElement>()
const domPieceEl = ref<HTMLElement>()

const score = ref<number>(0)
const level = ref<number>(0)
const pieceWidth = ref<number>(0)
const pieceHeight = ref<number>(0)
const pieceWidthToPx = computed<string>(() => toPx(pieceWidth.value))
const pieceHeightToPx = computed<string>(() => toPx(pieceHeight.value))
const nextPiece = ref<Piece>(getPiece())
const over = ref<boolean>(false)
const ready = ref<boolean>(false)

const inView = ref<boolean>(false)
const opacity = ref<number>(1)

const dropTimer = computed<number>(() => 1000 - level.value * 100)

let to: any
let dropTo: any
let longPress: boolean = false
let logo: HTMLImageElement
const tetris: Tetris = {
  ctx: null,
  board: { columns: 0, rows: 0 },
  size: { x: 0, y: 0, piece: 0 },
  matrix: [],
  linesInLevel: 0,
  active: {
    piece: undefined,
    position: { x: 0, y: 0 },
  },
  freezed: false,
}

watch(keyPressed, () => {
  if (tetris.freezed || over.value) return
  if (keyPressed.value === ' ') rotate()
  else if (keyPressed.value === 'ArrowDown') drop()
  else if (keyPressed.value === 'ArrowLeft') move(-1)
  else if (keyPressed.value === 'ArrowRight') move(1)
})

watch([bounding, () => props.active], () => {
  if (props.active) updateScrollFixedTarget(bounding.value)
})

watch(onResize, () => {
  reset()
  if (!props.active) {
    initBoard()
    draw()
  }
})

watch([ready, inView, over, () => props.active], () => {
  if (ready.value && inView.value && props.active && !over.value) {
    addTicker(draw)
    drop()
    el.value && gsap.to(el.value, { opacity: 1, duration: 0.4 })
  } else {
    killTicker(draw)
    to && clearTimeout(to)
    dropTo && clearTimeout(dropTo)
    el.value && gsap.to(el.value, { opacity: 0.3, duration: 0.4 })
  }
})

onMounted(() => {
  reset()

  tetris.ctx = el.value?.getContext('2d')

  logo = new Image()
  logo.src = '/assets/img/logo.svg'
  logo.onload = () => {
    ready.value = true
    initBoard()
    draw()
  }
})

function initBoard() {
  tetris.matrix = []
  for (let row = 1; row <= tetris.board.rows; row++) {
    tetris.matrix.push(new Array(tetris.board.columns).fill(0))
  }
  tetris.matrix.forEach((row, r) => {
    row.forEach((column, c) => {
      const rows = tetris.matrix.length
      let pieces: Array<number> = []
      if (r + 10 === rows) {
        pieces = isMobileLayout.value ? [2] : []
      } else if (r + 9 === rows) {
        pieces = isMobileLayout.value ? [1, 2] : []
      } else if (r + 8 === rows) {
        pieces = isMobileLayout.value ? [2] : []
      } else if (r + 7 === rows) {
        pieces = isMobileLayout.value ? [0, 7] : []
      } else if (r + 6 === rows) {
        pieces = isMobileLayout.value ? [0, 7] : []
      } else if (r + 5 === rows) {
        pieces = isMobileLayout.value ? [0, 7] : [5]
      } else if (r + 4 === rows) {
        pieces = isMobileLayout.value ? [0, 4, 5, 7] : [5, 6, 11]
      } else if (r + 3 === rows) {
        pieces = isMobileLayout.value ? [0, 3, 4, 5, 6, 7] : [0, 6, 11]
      } else if (r + 2 === rows) {
        pieces = isMobileLayout.value ? [0, 3, 4, 5, 6, 7] : [0, 3, 4, 9, 11]
      } else if (r + 1 === rows) {
        pieces = isMobileLayout.value ? [0, 1, 3, 4, 5, 6, 7] : [0, 1, 3, 4, 8, 9, 10, 11]
      }
      tetris.matrix[r][c] = pieces.includes(c) ? 1 : 0
    })
  })
}

function onIntersect(el: HTMLElement, visible: boolean) {
  inView.value = visible
}

function draw() {
  // Clear
  tetris.ctx?.clearRect(0, 0, tetris.size.x * dpr.value, tetris.size.y * dpr.value)

  // Draw Pieces
  let _row = 0
  let _column = tetris.board.columns
  tetris.matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        if (value === 1 && _row < y) {
          _row = y
        }
        if (value === 1 && _column > x) {
          _column = x
        }
        if (tetris.ctx) tetris.ctx.globalAlpha = value === 3 ? opacity.value : 1
        drawLogo({
          x: tetris.size.piece * x,
          y: tetris.size.y - tetris.size.piece * (tetris.board.rows - y),
        })
      }
    })
  })

  if (tetris.active.piece && domEl.value) {
    const { piece } = tetris.active
    pieceWidth.value = tetris.size.piece * piece.matrix[0].length
    pieceHeight.value = tetris.size.piece * piece.matrix.length
    gsap.set(domEl.value, {
      x: toPx(_column * tetris.size.piece),
      y: toPx((tetris.board.rows - _row - 1) * -tetris.size.piece),
    })
  }

  // Draw helpers
  // drawBoard()
}

function drawBoard() {
  if (!tetris.ctx) return
  for (let row = 1; row <= tetris.board.rows; row++) {
    for (let column = 0; column < tetris.board.columns; column++) {
      tetris.ctx.lineWidth = 1
      tetris.ctx.strokeStyle = 'grey'
      tetris.ctx.strokeRect(
        tetris.size.piece * column * dpr.value,
        (tetris.size.y - tetris.size.piece * row) * dpr.value,
        tetris.size.piece * dpr.value,
        tetris.size.piece * dpr.value
      )
    }
  }
}

function drawLogo(position: Position) {
  const gap = 0.6
  const color = 66
  tetris.ctx?.drawImage(
    tint(logo, color, color, color),
    (position.x + gap * 0.5) * dpr.value,
    (position.y + gap * 0.5) * dpr.value,
    (tetris.size.piece - gap) * dpr.value,
    (tetris.size.piece - gap) * dpr.value
  )
}

function tint(
  image: HTMLImageElement,
  r: number,
  g: number,
  b: number
): OffscreenCanvas | HTMLImageElement {
  const imageSize = image.width

  const offscreen = new OffscreenCanvas(imageSize, imageSize)
  const ctx = offscreen.getContext('2d')
  if (!ctx) return image

  ctx.drawImage(image, 0, 0)

  const imageData = ctx.getImageData(0, 0, imageSize, imageSize)

  for (let i = 0; i < imageData.data.length; i += 4) {
    if (imageData.data[i + 3] === 0) continue
    imageData.data[i + 0] = r
    imageData.data[i + 1] = g
    imageData.data[i + 2] = b
  }

  ctx.putImageData(imageData, 0, 0)

  return offscreen
}

function reset() {
  if (!el.value) return

  score.value = 0
  level.value = 1
  over.value = false

  tetris.size.x = Math.min(vw.value, maxWidth.value)
  tetris.size.y = vh.value

  const size = isMobileLayout.value ? toScale(45) : toScale(80)

  for (let i = 12; i >= 0; i--) {
    if (tetris.size.x / i > size) {
      tetris.board.columns = i
      tetris.size.piece = tetris.size.x / tetris.board.columns
      break
    }
  }

  tetris.board.rows = Math.ceil(tetris.size.y / tetris.size.piece) + 3

  tetris.matrix = []
  for (let row = 1; row <= tetris.board.rows; row++) {
    tetris.matrix.push(new Array(tetris.board.columns).fill(0))
  }

  el.value.width = tetris.size.x * dpr.value
  el.value.height = tetris.size.y * dpr.value
  gsap.set(el.value, { width: tetris.size.x, height: tetris.size.y })
}

async function rotate() {
  if (!tetris.active.piece) return

  const rotated: Matrix = []
  for (let x = tetris.active.piece.matrix.length - 1; x >= 0; x--) {
    for (let y = 0; y < tetris.active.piece.matrix[x].length; y++) {
      if (!rotated[y]) rotated.push([])
      rotated[y].push(tetris.active.piece.matrix[x][y])
    }
  }

  if (!checkCollisionX({ matrix: rotated })) {
    tetris.active.piece.matrix = rotated
    update()
  } else {
    to && clearTimeout(to)
    tetris.freezed = true
    for (let x = tetris.matrix.length - 1; x >= 0; x--) {
      for (let y = 0; y < tetris.matrix[x].length; y++) {
        if (tetris.matrix[x][y] === 1) tetris.matrix[x][y] = 3
      }
    }
    await animate()
    for (let x = tetris.matrix.length - 1; x >= 0; x--) {
      for (let y = 0; y < tetris.matrix[x].length; y++) {
        if (tetris.matrix[x][y] === 3) tetris.matrix[x][y] = 1
      }
    }
    tetris.freezed = false
    drop()
  }
}

function move(dir: number) {
  if (!tetris.active.piece) return

  if (!checkCollisionX({ matrix: tetris.active.piece.matrix, dir })) {
    tetris.active.position.x += dir
    update()
  }
}

async function drop() {
  to && clearTimeout(to)
  to = setTimeout(drop, dropTimer.value)

  score.value++

  if (!tetris.active.piece) {
    tetris.active.piece = nextPiece.value
    nextPiece.value = getPiece()

    tetris.active.position = {
      x: Math.floor(tetris.board.columns / 2) - 1,
      y: tetris.board.rows - 4 + tetris.active.piece.matrix.length,
    }
    if (checkCollisionY({ matrix: tetris.active.piece.matrix })) {
      over.value = true
      // reset()
      clearTimeout(to)
      return
    }
  }

  if (!checkCollisionY({ matrix: tetris.active.piece.matrix })) {
    tetris.active.position.y--
    update()
  } else {
    tetris.matrix.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value === 1) {
          tetris.matrix[y][x] = 2
        }
      })
    })
    tetris.active.piece = undefined
    let linesOut = 0
    tetris.matrix.forEach(async (row, y) => {
      if (checkEntireLine(row)) {
        linesOut++
        to && clearTimeout(to)
        tetris.freezed = true
        for (let i = 0; i < row.length; i++) row[i] = 3
        await animate()
        tetris.freezed = false
        tetris.matrix.splice(y, 1)
        tetris.matrix.unshift(new Array(tetris.board.columns).fill(0))
        drop()
      }
    })
    if (linesOut === 1) score.value += 40 * (level.value + 1)
    else if (linesOut === 2) score.value += 100 * (level.value + 1)
    else if (linesOut === 3) score.value += 300 * (level.value + 1)
    else if (linesOut === 4) score.value += 1200 * (level.value + 1)
    tetris.linesInLevel += linesOut
    if (tetris.linesInLevel >= 10 || score.value % 1000 === 0) {
      level.value++
      tetris.linesInLevel = 0
    }
    !tetris.freezed && drop()
  }
}

function animate() {
  return new Promise(resolve => {
    const duration = 0.2
    gsap.set(opacity, { value: 1 })
    gsap.to(opacity, { value: 0, duration, ease: 'power1.in' })
    gsap.to(opacity, {
      value: 1,
      duration: duration * 0.5,
      delay: duration,
      ease: 'power1.out',
    })
    gsap.to(opacity, {
      value: 0,
      duration,
      delay: duration * 1.5,
      ease: 'power1.in',
      onComplete: resolve,
    })
  })
}

function checkEntireLine(line: Array<number>): boolean {
  return line.every(val => val === 2)
}

function update() {
  if (!tetris.active.piece) return

  tetris.matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 2) tetris.matrix[y][x] = 0
    })
  })

  tetris.active.piece.matrix.forEach((column, y) => {
    column.forEach((value, x) => {
      if (value === 1) {
        const c: number = tetris.matrix.length - tetris.active.position.y + y
        const r: number = tetris.active.position.x + x
        tetris.matrix[c][r] = 1
      }
    })
  })
}

function checkCollisionX(params: { matrix: Matrix; dir?: number }): boolean {
  const { matrix, dir } = params
  for (let column = 0; column < matrix[0].length; column++) {
    for (let row = 0; row < matrix.length; row++) {
      const value: number = matrix[row][column]
      if (value === 1) {
        const board: Position = {
          x: tetris.active.position.x + column + (dir || 0),
          y: tetris.matrix.length - tetris.active.position.y + row,
        }

        // collision
        if (
          board.x < 0 ||
          board.x > tetris.matrix[0].length - 1 ||
          tetris.matrix[board.y][board.x] === 2
        )
          return true
      }
    }
  }
  return false
}

function checkCollisionY(params: { matrix: Matrix }): boolean {
  const { matrix } = params
  for (let y = 0; y < matrix.length; y++) {
    const column: Array<number> = matrix[y]
    for (let x = 0; x < column.length; x++) {
      const value: number = matrix[y][x]
      if (value === 1) {
        const board: Position = {
          x: tetris.active.position.x + x,
          y: tetris.matrix.length - tetris.active.position.y + y + 1,
        }
        // collision
        if (!tetris.matrix[board.y] || tetris.matrix[board.y][board.x] === 2) {
          return true
        }
      }
    }
  }
  return false
}

function getPiece(): Piece {
  const pieces: Array<Piece> = [
    {
      name: 'o',
      matrix: [
        [1, 1],
        [1, 1],
      ],
    },
    {
      name: 'i',
      matrix: [[1], [1], [1], [1]],
    },
    {
      name: 's',
      matrix: [
        [0, 1, 1],
        [1, 1, 0],
      ],
    },
    {
      name: 'z',
      matrix: [
        [1, 1, 0],
        [0, 1, 1],
      ],
    },
    {
      name: 'l',
      matrix: [
        [1, 0],
        [1, 0],
        [1, 1],
      ],
    },
    {
      name: 'j',
      matrix: [
        [0, 1],
        [0, 1],
        [1, 1],
      ],
    },
    {
      name: 't',
      matrix: [
        [1, 1, 1],
        [0, 1, 0],
      ],
    },
  ]
  return pieces[Math.floor(Math.random() * pieces.length)]
}

function onTouchStart(e: TouchEvent) {
  if (over.value) return
  e.preventDefault()
  clearTimeout(dropTo)
  dropTo = setTimeout(extraDrop, 250)
}

function getTouch(e: TouchEvent): Touch | undefined {
  const touch = e.changedTouches || e.touches
  return touch && touch.length ? touch[0] : undefined
}

function extraDrop() {
  longPress = true
  drop()
  dropTo = setTimeout(extraDrop, 100)
}

function onTouchEnd(e: TouchEvent) {
  if (over.value) return
  if (!longPress) {
    const touch = getTouch(e)
    touch && move(touch.clientX > tetris.size.x / 2 ? 1 : -1)
  }
  dropTo && clearTimeout(dropTo)
  longPress = false
}

function onPieceClick(e: TouchEvent) {
  if (over.value) return
  e.preventDefault()
  e.stopPropagation()
  rotate()
}

onBeforeUnmount(() => {
  dropTo && clearTimeout(dropTo)
  killTicker(draw)
  to && clearTimeout(to)
  gsap.killTweensOf(opacity)
})

defineExpose({
  score,
  level,
  over,
  nextPiece,
  reset,
  drop,
})
</script>

<style lang="scss">
.footer__tetris {
  opacity: 0.3;
  will-change: opacity;

  &__dom {
    position: absolute;
    bottom: 0;
    z-index: 9999;

    &__piece {
      width: v-bind(pieceWidthToPx);
      height: v-bind(pieceHeightToPx);
    }
  }
}
</style>
