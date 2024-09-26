export interface Transition {
  el: HTMLElement
  transition: (params: { el: HTMLElement }) => void
  duration: number
}

export type GridType = 'none' | 'default' | 'rule-of-thirds' | 'golden-ratio'

export type Section =
  | 'hero'
  | 'projects-bg'
  | 'projects'
  | 'services'
  | 'about'
  | 'about-testimonials'
  | 'about-awards'
  | 'contact'

export type Cursor =
  | 'default'
  | 'play'
  | 'plus'
  | 'arrow-left'
  | 'arrow-right'
  | 'copy'
  | 'copied'
  | 'close'

export interface State {
  preloadedFonts: boolean
  preloadedTextures: boolean
  loading: boolean
  grid: GridType
  section: Section
  cursor: Cursor
  inReel: boolean
  inProject: boolean
  inProjectEntered: boolean
}
