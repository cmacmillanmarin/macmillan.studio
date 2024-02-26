export type Mode = 'auto' | 'native' | 'virtual' | undefined
export type Active = 'native' | 'virtual'
export type Direction = 'up' | 'down'

export interface State {
  el?: HTMLElement
  mode: Mode
  active: Active
  current: number
  currentVertical: number
  direction: Direction
  update: number
  disabled: boolean
  bounding: number
  progress: number
  target: number
  targetId: string
}

export interface Data {
  current: number
  currentVertical: number
  direction: Direction
  bounding: number
}
