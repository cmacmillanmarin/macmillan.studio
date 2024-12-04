export interface ImageDimensions {
  d: number
  t: number
  m: number
}

export interface ImageSize {
  src: string
  width: number
}

export type InputValue = string | number
export type InputType = 'text' | 'number' | 'email' | 'phone' | 'password'
export interface InputEmit {
  key: string
  value: string | number
  valid: boolean
}
export interface Input {
  name: string
  type: InputType
  required?: boolean
  placeholder?: string
  max?: number
  min?: number
  value?: InputValue
  width?: number
  exception?: boolean
}

export interface Button {
  label: string
  style: 'primary' | 'secondary' | 'tertiary'
  type: 'internal-link' | 'external-link' | 'action'
  to?: string
}

export type TickerItems = Array<TickerItem>
export interface TickerItem {
  el: HTMLElement
  width: number
  position: number
  init: number
  reset: number
  x: number
}

export interface FirstTransition {
  state: boolean
  step: number
  progress: number
  steps: Array<{
    zoom: number
    border: number
    position: { x: number; y: number }
    size: { x: number; y: number; z: number }
    forcePixel?: boolean
  }>
}

export type HeaderLinks = Array<HeaderLink>

export interface HeaderLink {
  label: string
  slug: string
}
