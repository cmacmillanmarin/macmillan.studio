export type Matrix = Array<Array<number>>

export interface Size {
  x: number
  y: number
  piece: number
}

export interface Piece {
  matrix: Matrix
}

export interface Tetris {
  ctx: CanvasRenderingContext2D | null | undefined
  size: Size
  matrix: Matrix
  points: number
}
