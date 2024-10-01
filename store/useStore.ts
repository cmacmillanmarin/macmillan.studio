import { defineStore } from 'pinia'
import type { State, Transition, GridType, Section, Cursor } from '~/types/front/store'

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
    inReel: false,
    inProject: false,
    inProjectEntered: false,
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
  },
})
