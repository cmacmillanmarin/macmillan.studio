export type Matrix = Array<Array<number>>

export interface Size {
  x: number
  y: number
  piece: number
}

export interface Piece {
  name: 'box' | 'bar' | 'el'
  matrix: Matrix
}

export interface Board {
  columns: number
  rows: number
}

export interface Position {
  x: number
  y: number
}

export interface Tetris {
  ctx: CanvasRenderingContext2D | null | undefined
  matrix: Matrix
  points: number
  size: Size
  board: Board
  active: {
    piece?: Piece
    position: Position
  }
  freezed: boolean
}
