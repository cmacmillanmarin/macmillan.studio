import type { Image } from '~/types/wordpress'

export type Size = 'normal' | 'reduced'
export type Theme = 'light' | 'dark' | 'branded'

export interface State {
  entered: boolean
  visible: boolean
  overlay: boolean
  size: Size
  theme: Theme
  image: Image
}
