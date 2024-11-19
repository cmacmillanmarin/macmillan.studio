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
  inReel: boolean
  inProject: boolean
  inProjectEntered: boolean
  inProjectScroll: boolean
  inProjectNextProjectInView: boolean
  inProjectNextProjectTicker: NextProjectTicker
}
