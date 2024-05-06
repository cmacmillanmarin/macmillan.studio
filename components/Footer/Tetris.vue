<template>
  <canvas ref="el" class="footer__tetris" v-intersect="{ callback: onIntersect }" />
</template>

<script lang="ts" setup>
import type { Tetris, Matrix, Piece, Position } from '~/types/front/tetris'

const { maxWidth } = useCss()
const { vw, vh, onResize } = useResize()
const { addTicker, killTicker } = useRaf()
const { keyPressed } = useKeyboard()

const el = ref<HTMLCanvasElement>()
const ready = ref<boolean>(false)
const inView = ref<boolean>(false)

let to: any
let logo: HTMLImageElement
const tetris: Tetris = {
  ctx: null,
  board: { columns: 0, rows: 0 },
  size: { x: 0, y: 0, piece: 0 },
  matrix: [],
  active: {
    piece: undefined,
    position: { x: 0, y: 0 },
  },
  points: 0,
  over: false,
}

watch(keyPressed, () => {
  if (keyPressed.value === ' ') rotate()
  else if (keyPressed.value === 'ArrowDown') drop()
  else if (keyPressed.value === 'ArrowLeft') move(-1)
  else if (keyPressed.value === 'ArrowRight') move(1)
})

watch(onResize, () => {
  reset()
})

watch([ready, inView], () => {
  if (ready.value && inView.value) {
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
    update()
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
  tetris.ctx?.drawImage(logo, position.x, position.y, tetris.size.piece, tetris.size.piece)
}

function reset() {
  if (!el.value) return

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

function rotate() {
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
  }
}

function move(dir: number) {
  if (!tetris.active.piece) return

  if (!checkCollisionX({ matrix: tetris.active.piece.matrix, dir })) {
    tetris.active.position.x += dir
    update()
  }
}

function drop() {
  to && clearTimeout(to)
  to = setTimeout(drop, 1000)

  if (!tetris.active.piece) {
    tetris.active.piece = getPiece() as Piece
    tetris.active.position = {
      x: Math.floor(tetris.board.columns / 2) - 1,
      y: tetris.board.rows - 4 + tetris.active.piece.matrix.length,
    }
    if (checkCollisionY({ matrix: tetris.active.piece.matrix })) {
      reset()
      drop()
    }
  }

  if (!checkCollisionY({ matrix: tetris.active.piece.matrix, dir: 1 })) {
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
    tetris.matrix.forEach((row, y) => {
      if (checkEntireLine(row)) {
        tetris.matrix.splice(y, 1)
        tetris.matrix.unshift(new Array(tetris.board.columns).fill(0))
      }
    })
    drop()
  }
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

function checkCollisionY(params: { matrix: Matrix; dir?: number }): boolean {
  const { matrix, dir } = params
  for (let y = 0; y < matrix.length; y++) {
    const column: Array<number> = matrix[y]
    for (let x = 0; x < column.length; x++) {
      const value: number = matrix[y][x]
      if (value === 1) {
        const board: Position = {
          x: tetris.active.position.x + x,
          y: tetris.matrix.length - tetris.active.position.y + y + (dir || 0),
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
      name: 'box',
      matrix: [
        [1, 1],
        [1, 1],
      ],
    },
    {
      name: 'el',
      matrix: [
        [1, 0],
        [1, 0],
        [1, 1],
      ],
    },
    {
      name: 'bar',
      matrix: [[1], [1], [1], [1]],
    },
    {
      name: 'el',
      matrix: [
        [1, 1, 1],
        [0, 1, 0],
      ],
    },
    {
      name: 'el',
      matrix: [
        [1, 1, 0],
        [0, 1, 1],
      ],
    },
    {
      name: 'el',
      matrix: [
        [1, 0],
        [1, 1],
        [0, 1],
      ],
    },
  ]
  return pieces[Math.floor(Math.random() * pieces.length)]
}

onBeforeUnmount(() => {
  killTicker(draw)
  to && clearTimeout(to)
})
</script>
