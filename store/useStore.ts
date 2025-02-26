import { defineStore } from 'pinia'
import type { State, GridType, Section, Cursor } from '~/types/front/store'
import { sound } from '~/utils/sound'

let _to: any
let _toCursor: any
let _toCursorPosition: any

export default defineStore('use-store', {
  state: (): State => ({
    preloadedFonts: false,
    preloadedThree: false,
    loading: true,
    grid: 'none',
    section: 'hero',
    sectionThrottle: false,
    cursor: 'default',
    cursorColor: 'black',
    cursorPosition: { x: -1, y: -1 },
    activeProjectList: 'selected',
    header: false,
    headerLogo: false,
    headerOverlay: false,
    headerMobileButtonClicked: false,
    inReel: false,
    inReelHovered: false,
    inProject: false,
    inProjectEntered: false,
    inProjectScroll: true,
    inProjectNextProjectInView: false,
    inTetris: false,
  }),
  getters: {
    isPreloaded(): boolean {
      return this.preloadedFonts && this.preloadedThree
    },
    isLoading(): boolean {
      return this.loading
    },
    gridType(): GridType {
      return this.grid
    },
    isInReel(): boolean {
      return this.inReel
    },
    isInProject(): boolean {
      return this.inProject
    },
    isInProjectEntered(): boolean {
      return this.inProjectEntered
    },
    landingTabIndex(): number | undefined {
      return this.inProject || this.inReel || this.inTetris ? -1 : undefined
    },
  },
  actions: {
    updatePreloadedFonts(value: boolean) {
      this.preloadedFonts = value
    },
    updatePreloadedThree(value: boolean) {
      this.preloadedThree = value
    },
    updateLoading(value: boolean) {
      this.loading = value
    },
    updateGrid(state: GridType) {
      this.grid = state
    },
    updateSection(state: Section) {
      _to && clearTimeout(_to)
      if (this.sectionThrottle) {
        _to = setTimeout(() => {
          this.section = state
        }, 200)
      } else {
        this.section = state
      }
    },
    updateSectionThrottle(state: boolean) {
      this.sectionThrottle = state
    },
    updateActiveProjectList(state: 'all' | 'selected') {
      this.activeProjectList = state
    },
    updateHeader(state: boolean) {
      this.header = state
    },
    updateHeaderLogo(state: boolean) {
      this.headerLogo = state
    },
    updateHeaderOverlay(state: boolean) {
      this.headerOverlay = state
    },
    headerButtonClicked() {
      this.headerMobileButtonClicked = !this.headerMobileButtonClicked
    },
    updateCursor(state: Cursor) {
      _toCursor && clearTimeout(_toCursor)
      _toCursor = setTimeout(() => {
        this.cursor = state
      }, 0)
    },
    updateCursorColor(state: 'lime' | 'black') {
      this.cursorColor = state
    },
    updateCursorPosition(state: { x: number; y: number }) {
      _toCursorPosition && clearTimeout(_toCursorPosition)
      if (state.x === -1) {
        _toCursorPosition = setTimeout(() => {
          this.cursorPosition = state
        }, 100)
      } else {
        sound.emit('hover')
        this.cursorPosition = state
      }
    },
    updateInReel(state: boolean) {
      this.inReel = state
    },
    updateInReelHovered(state: boolean) {
      this.inReelHovered = state
    },
    updateInProject(state: boolean) {
      this.inProject = state
    },
    updateInProjectEntered(state: boolean) {
      this.inProjectEntered = state
    },
    updateInProjectScroll(state: boolean) {
      this.inProjectScroll = state
    },
    updateInProjectNextProjectInView(state: boolean) {
      this.inProjectNextProjectInView = state
    },
    // updateInProjectNextProjectTicker(params: NextProjectTicker) {
    //   this.inProjectNextProjectTicker = params
    // },
    updateInTetris(state: boolean) {
      this.inTetris = state
    },
  },
})
