import { defineStore } from 'pinia'
import type { State, Transition, GridType } from '~/types/front/store'

export default defineStore('use-store', {
  state: (): State => ({
    preloaded: false,
    loading: true,
    preview: false,
    grid: 'none',
    inProject: false,
    inProjectEntered: false,
    routes: {
      entry: '',
      history: [],
      transition: false,
      transitions: [],
      to: '',
      from: '',
      fromTo: '',
      entered: '',
    },
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
    entryRoute(): string {
      return this.routes.entry
    },
    lastRoute(): string {
      return this.routes.history[this.routes.history.length - 1]
    },
    routeTo(): string {
      return this.routes.to
    },
    routeFrom(): string {
      return this.routes.from
    },
    routeFromTo(): string {
      return this.routes.fromTo
    },
    routeEntered(): string {
      return this.routes.entered
    },
    pageTransition(): boolean {
      return this.routes.transition
    },
    pageTransitions(): Array<Transition> {
      return this.routes.transitions
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
    updateInProject(state: boolean): void {
      this.inProject = state
    },
    updateInProjectEntered(state: boolean): void {
      this.inProjectEntered = state
    },
    defineEntryRoute(value: string): void {
      this.routes.entry = value
    },
    updateRouteHistory(value: string): void {
      this.routes.history.push(value)
    },
    updateRouteTo(value: string): void {
      this.routes.to = value
    },
    updateRouteFrom(value: string): void {
      this.routes.from = value
    },
    updateRouteFromTo(value: string): void {
      this.routes.fromTo = value
    },
    updateRouteEntered(value: string): void {
      this.routes.entered = value
    },
    updatePageTransition(): void {
      this.routes.transition = !this.routes.transition
    },
    cleanPageTransitions(): void {
      this.routes.transitions = []
    },
    addPageTransition(transition: Transition): void {
      this.routes.transitions.push(transition)
    },
  },
})
