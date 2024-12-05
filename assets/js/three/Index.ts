import { Vector2, WebGLRenderer } from 'three'
import Planes from '~/assets/js/three/scenes/planes/Index'
import Noise from '~/assets/js/three/scenes/noise/Index'
import type { CreateParams } from '~/types/front/three'

type ThreeScene = Planes | Noise

export default class Three {
  debug: boolean = false
  ready: boolean = false
  disabled: boolean = false

  renderer?: WebGLRenderer | null

  planes: Planes = new Planes()
  noise: Noise = new Noise()

  scenes: Array<ThreeScene> = []

  constructor() {
    this.bind()

    this.scenes.push(this.planes, this.noise)
  }

  async create(params: CreateParams) {
    this.log(`create()`)
    const canvas: HTMLElement | null = document.querySelector('.three')
    if (canvas) {
      const alpha: boolean = true
      const antialias: boolean = false
      const premultipliedAlpha: boolean = true
      const stencil: boolean = true
      this.renderer = new WebGLRenderer({ canvas, antialias, premultipliedAlpha, alpha, stencil })
      this.renderer.autoClear = false

      this.scenes.forEach((s: ThreeScene) => s.create({ ...params, renderer: this.renderer }))

      this.ready = true
    } else {
      console.warn('Three ~ Canvas not found!')
    }
  }

  updateCamera(position: number) {
    this.scenes.forEach((s: ThreeScene) => s.updateCamera(position))
  }

  render() {
    this.scenes.forEach((s: ThreeScene) => s.render())
  }

  updateSize({ size }: { size: Vector2 }) {
    this.scenes.forEach((s: ThreeScene) => s.updateSize({ size }))

    this.renderer?.setSize(size.x, size.y)
    this.renderer?.setPixelRatio(this.getDevicePixelRatio())

    this.log(`updateSize() w: ${size.x}, h: ${size.y}`)
  }

  getDevicePixelRatio() {
    const maxPixelRatio = 2
    return Math.min(window.devicePixelRatio, maxPixelRatio)
  }

  bind() {
    this.render = this.render.bind(this)
  }

  log(msg: string) {
    if (!this.debug) return
    console.log(`Three ~ ${msg}`)
  }

  destroy() {
    this.log('destroy()')

    this.scenes.forEach((s: ThreeScene) => s.destroy())

    this.renderer = null
  }
}
