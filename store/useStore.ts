import { defineStore } from 'pinia'
import type { State, GridType, Section, Cursor, NextProjectTicker } from '~/types/front/store'

let _to: any

export default defineStore('use-store', {
  state: (): State => ({
    preloadedFonts: false,
    preloadedTextures: false,
    loading: true,
    grid: 'none',
    section: 'hero',
    sectionThrottle: false,
    cursor: 'default',
    activeProjectList: 'selected',
    header: false,
    headerLogo: false,
    headerOverlay: false,
    headerMobileButtonClicked: false,
    inReel: false,
    inProject: false,
    inProjectEntered: false,
    inProjectScroll: true,
    inProjectNextProjectInView: false,
    inProjectNextProjectTicker: {
      items: [],
      current: 0,
      target: 0,
      speed: 1.25,
      direction: -1,
    },
  }),
  getters: {
    isPreloaded(): boolean {
      return this.preloadedFonts && this.preloadedTextures
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
  },
  actions: {
    updatePreloadedFonts(value: boolean) {
      this.preloadedFonts = value
    },
    updatePreloadedTextures(value: boolean) {
      this.preloadedTextures = value
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
      this.cursor = state
    },
    updateInReel(state: boolean) {
      this.inReel = state
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
    updateInProjectNextProjectTicker(params: NextProjectTicker) {
      this.inProjectNextProjectTicker = params
    },
  },
})
