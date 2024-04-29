export type Type = 'cube' | 'icosahedron' | 'plane'

export interface Obj {
  id: string
  type: Type
  position: { x: number; y: number }
  size: { x: number; y: number; z: number }
}
