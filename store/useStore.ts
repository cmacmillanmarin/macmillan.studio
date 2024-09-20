import { defineStore } from 'pinia'
import type { State, Transition, GridType, Section, Cursor } from '~/types/front/store'

let _to: any

export default defineStore('use-store', {
  state: (): State => ({
    preloaded: false,
    loading: true,
    preview: false,
    grid: 'none',
    section: 'hero',
    cursor: 'default',
    inReel: false,
    inProject: false,
    inProjectEntered: false,
  }),
  getters: {
    isPreloaded(): boolean {
      return this.preloaded
    },
    isLoading(): boolean {
      return this.loading
    },
    isPreview(): boolean {
      return this.preview
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
    updatePreloaded(value: boolean) {
      this.preloaded = value
    },
    updateLoading(value: boolean) {
      this.loading = value
    },
    updatePreview(state: boolean) {
      this.preview = state
    },
    updateGrid(state: GridType) {
      this.grid = state
    },
    updateSection(state: Section) {
      _to && clearTimeout(_to)
      _to = setTimeout(() => {
        this.section = state
      }, 100)
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
