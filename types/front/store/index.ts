export type GridType = 'none' | 'default' | 'rule-of-thirds' | 'golden-ratio'

export type Section =
  | 'hero'
  | 'reel'
  | 'projects-bg'
  | 'projects'
  | 'services'
  | 'about'
  | 'about-testimonials'
  | 'about-awards'
  | 'contact'

export type Cursor =
  | 'none'
  | 'default'
  | 'play'
  | 'pause'
  | 'plus'
  | 'arrow-left'
  | 'arrow-right'
  | 'copy'
  | 'copied'
  | 'close'
  | 'loading'
  | 'drag'
  | 'drag-vertical'

export interface NextProjectTickerItem {
  init: number
  width: number
  position: number
  reset: number
  x: number
}

export interface NextProjectTicker {
  items: Array<NextProjectTickerItem>
  current: number
  direction: number
  target: number
  speed: number
}

export interface State {
  preloadedFonts: boolean
  preloadedTextures: boolean
  loading: boolean
  grid: GridType
  section: Section
  sectionThrottle: boolean
  activeProjectList: 'all' | 'selected'
  header: boolean
  headerLogo: boolean
  headerOverlay: boolean
  headerMobileButtonClicked: boolean
  cursor: Cursor
  cursorColor: 'lime' | 'black'
  cursorPosition: { x: number; y: number }
  inReel: boolean
  inProject: boolean
  inProjectEntered: boolean
  inProjectScroll: boolean
  inProjectNextProjectInView: boolean
  inProjectNextProjectTicker: NextProjectTicker
  inTetris: boolean
}
