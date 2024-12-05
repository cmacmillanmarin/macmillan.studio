import { Vector2, WebGLRenderer } from 'three'

import Noise from '~/assets/js/three/scenes/noise/Index'
import Planes from '~/assets/js/three/scenes/planes/Index'
import type { ConstructorParams, CreateParams } from '~/types/front/three'

type ThreeScene = Planes | Noise

export default class Three {
  debug: boolean = false
  ready: boolean = false
  disabled: boolean = false

  canvas: HTMLCanvasElement | null = null
  renderer?: WebGLRenderer | null

  planes?: Planes
  noise?: Noise

  scenes: Array<ThreeScene> = []

  onPreloaded?: Function = () => {}
  updateCursor?: Function = () => {}

  constructor(params: ConstructorParams) {
    this.bind()

    this.planes = new Planes(params)
    this.noise = new Noise()

    this.scenes.push(this.planes)
    this.scenes.push(this.noise)
  }

  async create(params: CreateParams) {
    this.log(`create()`)
    const parent: HTMLElement = document.querySelector('.__layout') || document.body
    this.canvas = document.createElement('canvas')
    this.canvas.classList.add('three')
    parent.appendChild(this.canvas)

    this.renderer = new WebGLRenderer({
      canvas: this.canvas,
      antialias: false,
      premultipliedAlpha: true,
      alpha: true,
      stencil: true,
    })
    this.renderer.setClearColor(0x000000, 0)
    this.renderer.sortObjects = true
    this.renderer.autoClear = false

    this.scenes.forEach((s: ThreeScene) =>
      s.create({
        ...params,
        parent,
        canvas: this.canvas as HTMLCanvasElement,
        renderer: this.renderer as WebGLRenderer,
      })
    )

    this.ready = true
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

  updateMobileLayout(value: boolean) {
    this.scenes.forEach((s: ThreeScene) => s.updateMobileLayout(value))
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
