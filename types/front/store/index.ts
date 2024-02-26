export interface Transition {
  el: HTMLElement
  transition: (params: { el: HTMLElement }) => void
  duration: number
}

export interface Routes {
  entry: string
  history: Array<string>
  transition: boolean
  transitions: Array<Transition>
  to: string
  from: string
  fromTo: string
  entered: string
}

export type GridType = 'default' | 'golden' | 'none'

export interface State {
  preloaded: boolean
  loading: boolean
  preview: boolean
  grid: GridType
  routes: Routes
}
