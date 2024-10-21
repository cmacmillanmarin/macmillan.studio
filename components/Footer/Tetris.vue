<template>
  <canvas ref="el" class="footer__tetris" v-intersect="{ callback: onIntersect }" />
</template>

<script lang="ts" setup>
import { gsap } from 'gsap'
import type { Tetris, Matrix, Piece, Position } from '~/types/front/tetris'

const props = defineProps<{
  active: boolean
}>()

const { maxWidth } = useCss()
const { vw, vh, onResize } = useResize()
const { addTicker, killTicker } = useRaf()
const { keyPressed } = useKeyboard()

const el = ref<HTMLCanvasElement>()
const score = ref<number>(0)
const level = ref<number>(0)
const nextPiece = ref<Piece>(getPiece())
const over = ref<boolean>(false)
const ready = ref<boolean>(false)

const inView = ref<boolean>(false)
const opacity = ref<number>(1)

let to: any
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

watch(onResize, () => {
  reset()
})

watch([ready, inView, over, () => props.active], () => {
  if (ready.value && inView.value && props.active && !over.value) {
    addTicker(draw)
    drop()
  } else {
    killTicker(draw)
    to && clearTimeout(to)
  }
})

onMounted(() => {
  reset()

  tetris.ctx = el.value?.getContext('2d')

  logo = new Image()
  logo.src = '/assets/img/logo.svg'
  logo.onload = () => {
    ready.value = true
    tetris.matrix = []
    for (let row = 1; row <= tetris.board.rows; row++) {
      tetris.matrix.push(new Array(tetris.board.columns).fill(0))
    }
    tetris.matrix.forEach((row, r) => {
      row.forEach((column, c) => {
        const rows = tetris.matrix.length
        if (r + 5 === rows) {
          const pieces = [5]
          tetris.matrix[r][c] = pieces.includes(c) ? 1 : 0
        } else if (r + 4 === rows) {
          const pieces = [5, 6, 11]
          tetris.matrix[r][c] = pieces.includes(c) ? 1 : 0
        } else if (r + 3 === rows) {
          const pieces = [0, 6, 11]
          tetris.matrix[r][c] = pieces.includes(c) ? 1 : 0
        } else if (r + 2 === rows) {
          const pieces = [0, 3, 4, 9, 11]
          tetris.matrix[r][c] = pieces.includes(c) ? 1 : 0
        } else if (r + 1 === rows) {
          const pieces = [0, 1, 3, 4, 8, 9, 10, 11]
          tetris.matrix[r][c] = pieces.includes(c) ? 1 : 0
        }
      })
    })
    draw()
  }
})

function onIntersect(el: HTMLElement, visible: boolean) {
  inView.value = visible
}

function draw() {
  // Clear
  tetris.ctx?.clearRect(0, 0, tetris.size.x, tetris.size.y)

  // Draw Pieces
  tetris.matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        if (tetris.ctx) tetris.ctx.globalAlpha = value === 3 ? opacity.value : 1
        drawLogo({
          x: tetris.size.piece * x,
          y: tetris.size.y - tetris.size.piece * (tetris.board.rows - y),
        })
      }
    })
  })

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
        tetris.size.piece * column,
        tetris.size.y - tetris.size.piece * row,
        tetris.size.piece,
        tetris.size.piece
      )
    }
  }
}

function drawLogo(position: Position) {
  const gap = 0.6
  tetris.ctx?.drawImage(
    tint(logo, 26, 26, 26),
    position.x + gap * 0.5,
    position.y + gap * 0.5,
    tetris.size.piece - gap,
    tetris.size.piece - gap
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
  level.value = 0
  over.value = false

  tetris.size.x = Math.min(vw.value, maxWidth.value)
  tetris.size.y = vh.value

  for (let i = 12; i >= 0; i--) {
    if (tetris.size.x / i > 80) {
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

  el.value.width = tetris.size.x
  el.value.height = tetris.size.y
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
  to = setTimeout(drop, 1000)

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
    linesOut > 0 && console.log(linesOut, tetris.linesInLevel)
    if (tetris.linesInLevel >= 10) {
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

onBeforeUnmount(() => {
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
