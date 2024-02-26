export interface ImageDimensions {
  d: number
  t: number
  m: number
}

export interface ImageSize {
  src: string
  width: number
}

export type Color = 'burgundy' | 'red' | 'beige' | 'bone' | 'white'
export type LogoColor = 'burgundy' | 'burgundy--dark' | 'branded'

export type InputValue = string | number
export type InputType = 'text' | 'number' | 'email' | 'phone' | 'currency' | 'percentage' | 'zip'
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
