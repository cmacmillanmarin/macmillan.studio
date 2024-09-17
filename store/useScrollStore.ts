import { defineStore } from 'pinia'
import { round } from '~/utils/index'
import type { State, Mode, Active, Direction, Data } from '~/types/front/store/scroll'

export default defineStore('use-scroll-store', {
  state: (): State => ({
    el: undefined,
    mode: undefined,
    active: 'native',
    current: 0,
    currentVertical: 0,
    direction: 'down',
    update: 0,
    speed: 0,
    disabled: false,
    bounding: 0,
    progress: 0,
    target: -1,
    targetId: '',
    inTarget: true,
  }),
  getters: {
    isVirtualScroll(): boolean {
      return this.active === 'virtual'
    },
    scrollEl(): HTMLElement | undefined {
      return this.el
    },
    scrollMode(): undefined | Mode {
      return this.mode
    },
    scrollPosition(): number {
      return this.current
    },
    scrollPositionVertical(): number {
      return this.currentVertical
    },
    scrollDirection(): Direction {
      return this.direction
    },
    scrollSpeed(): number {
      return this.speed
    },
    scrollBounding(): number {
      return this.bounding
    },
    scrollProgress(): number {
      return this.progress
    },
    scrollTarget(): number {
      return this.target
    },
    scrollTargetId(): string {
      return this.targetId
    },
    scrollDisabled(): boolean {
      return this.disabled
    },
    scrollUpdate(): number {
      return this.update
    },
  },
  actions: {
    updateEl(el?: HTMLElement) {
      this.el = el
    },
    updateScroll() {
      this.update++
    },
    disableScroll(value: boolean) {
      this.disabled = value
    },
    updateActiveMode(value: Active) {
      this.active = value
    },
    updateScrollMode(value: Mode) {
      this.mode = value
    },
    updateScrollData(data: Data) {
      this.current = data.current
      this.currentVertical = data.currentVertical
      this.direction = data.direction
      this.bounding = data.bounding
      this.speed = data.speed
      this.progress = round(data.current / data.bounding, 2)
      this.inTarget = data.inTarget
    },
    async updateScrollTarget(value: number): Promise<void> {
      this.target = value
      await nextTick()
      this.target = -1
    },
    async updateScrollTargetId(value?: string): Promise<void> {
      if (value) {
        this.targetId = value
        await nextTick()
        this.targetId = ''
      }
    },
  },
})
