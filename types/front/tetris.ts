export type Matrix = Array<Array<number>>

export interface Size {
  x: number
  y: number
}

export interface Piece {
  matrix: Matrix
}

export interface Tetris {
  size: Size
  matrix: Matrix
  points: number
}
