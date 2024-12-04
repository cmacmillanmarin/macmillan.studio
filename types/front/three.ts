import { Mesh } from 'three'
import type { Texture, Vector2, Vector3, Vector4 } from 'three'
import type { Cursor } from '~/types/front/store'

export interface CreateParams {
  el: HTMLCanvasElement
  size: Vector2
  updateCursor?: Function
  onPreloaded?: Function
}

export interface ObjectParam {
  id: string
  size?: Vector3
  zoom?: number
  position?: Vector2
  rotate?: Vector3
  fixed?: Fixed
  parallax?: Vector2
  opacity?: number
  fade?: boolean
  textureFade?: number
  cursor?: Cursor
  color?: Vector4
  multiplyColor?: Vector4
  border?: number
  order?: number
  noPixel?: boolean
  forcePixel?: boolean
  blackAndWhite?: boolean
  img?: HTMLImageElement
  video?: HTMLVideoElement
  onClick?: Function
  onIntersect?: Function
}

export interface Fixed {
  from: number
  to: number
}

export interface Object {
  id: string
  size: Vector3
  zoom: number
  position: Vector2
  rotate: Vector3
  fixed: Fixed
  parallax: Vector2
  opacity: number
  fade: boolean
  textureFade: number | null
  cursor: Cursor
  color: Vector4 | null
  multiplyColor: Vector4 | null
  border: number
  order: number
  noPixel: boolean
  forcePixel: boolean
  blackAndWhite: boolean
  img: HTMLImageElement | null
  video: HTMLVideoElement | null
  onClick: Function | null
  onIntersect: Function | null

  mesh?: any
  meshId?: number

  inView: boolean
  firstFrame?: boolean
  wasPixelated?: boolean
  wasHovered?: boolean
  wasClickable?: boolean
  previousCursor?: Cursor
  imgAssigned?: boolean
  videoAssigned?: boolean
  inZoomTransition?: boolean
}

export interface LoadedTexture {
  id: string
  ready: boolean
  txt: Texture
}

export interface InViewParams {
  fixed: Fixed
  position: { x: number; y: number }
  size: Vector3
  opacity: number
}

export interface Plane {
  id: number
  available: boolean
  mesh: any
  img: HTMLElement | null
  video: HTMLVideoElement | null
}
