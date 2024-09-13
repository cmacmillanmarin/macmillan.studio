import { defineStore } from 'pinia'
import type { State, Transition, GridType, Section } from '~/types/front/store'

export default defineStore('use-store', {
  state: (): State => ({
    preloaded: false,
    loading: true,
    preview: false,
    grid: 'none',
    section: 'hero',
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
    isInProject(): boolean {
      return this.inProject
    },
    isInProjectEntered(): boolean {
      return this.inProjectEntered
    },
  },
  actions: {
    updatePreloaded(value: boolean): void {
      this.preloaded = value
    },
    updateLoading(value: boolean): void {
      this.loading = value
    },
    updatePreview(state: boolean): void {
      this.preview = state
    },
    updateGrid(state: GridType): void {
      this.grid = state
    },
    updateSection(state: Section): void {
      this.section = state
    },
    updateInProject(state: boolean): void {
      this.inProject = state
    },
    updateInProjectEntered(state: boolean): void {
      this.inProjectEntered = state
    },
  },
})
