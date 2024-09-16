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

export type Cursor = 'default' | 'video' | 'close' | 'pointer'

export interface State {
  preloaded: boolean
  loading: boolean
  preview: boolean
  grid: GridType
  section: Section
  cursor: Cursor
  inProject: boolean
  inProjectEntered: boolean
}
