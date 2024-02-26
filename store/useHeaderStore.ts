import { defineStore } from 'pinia'
import { type Image, parseImage } from '~/types/wordpress'
import type { State, Size, Theme } from '~/types/front/store/header'

export default defineStore('use-header-store', {
  state: (): State => ({
    entered: false,
    visible: true,
    overlay: false,
    size: 'normal',
    theme: 'light',
    image: parseImage(),
  }),
  getters: {
    headerVisibility(): boolean {
      return this.visible
    },
    headerSize(): Size {
      return this.size
    },
    headerTheme(): Theme {
      return this.theme
    },
    headerEntered(): boolean {
      return this.entered
    },
    headerOverlay(): boolean {
      return this.overlay
    },
    headerImage(): Image {
      return this.image
    },
  },
  actions: {
    setEntered(): void {
      this.entered = true
    },
    updateSize(value: Size): void {
      this.size = value
    },
    updateTheme(theme: Theme) {
      this.theme = theme
    },
    updateVisibility(value: boolean): void {
      this.visible = value
    },
    updateOverlay(value: boolean): void {
      this.overlay = value
    },
    updateImage(value?: Image): void {
      this.image = value || parseImage()
    },
  },
})
