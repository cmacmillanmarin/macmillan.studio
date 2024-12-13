import { Vector2, WebGLRenderer } from 'three'

import Logo from '~/assets/js/three/scenes/logo/Index'
import Noise from '~/assets/js/three/scenes/noise/Index'
import Planes from '~/assets/js/three/scenes/planes/Index'
import Lab from '~/assets/js/three/scenes/lab/Index'
import type { ConstructorParams, CreateParams } from '~/types/front/three'

type ThreeScene = Planes | Noise | Logo | Lab

export default class Three {
  debug: boolean = false
  ready: boolean = false

  canvas: HTMLCanvasElement | null = null
  renderer?: WebGLRenderer | null

  logo?: Logo
  planes?: Planes
  noise?: Noise
  lab?: Lab

  size: Vector2 = new Vector2()
  isMobileLayout: boolean = false

  scenes: Array<ThreeScene> = []

  onPreloaded: Function = () => {}
  updateCursor: Function = () => {}

  constructor(params: ConstructorParams) {
    this.bind()

    this.onPreloaded = params.onPreloaded || this.onPreloaded

    const utils = {
      toScale: this.toScale.bind(this),
      getDevicePixelRatio: this.getDevicePixelRatio.bind(this),
    }

    this.logo = new Logo({
      ...params,
      ...utils,
    })
    this.planes = new Planes({
      ...params,
      ...utils,
      rotateLogo: this.logo.rotate.bind(this.logo),
    })
    this.noise = new Noise({ ...utils })
  }

  async create(params: CreateParams) {
    this.log(`create()`)

    const { lab, size } = params

    if (!lab) {
      this.planes && this.scenes.push(this.planes)
      this.logo && this.scenes.push(this.logo)
      this.noise && this.scenes.push(this.noise)
    } else {
      this.lab = new Lab({ ...params, onPreloaded: this.onPreloaded })
      this.scenes.push(this.lab)
    }

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

    this.updateSize({ size })
    this.ready = true
  }

  updateCamera(position: number) {
    this.scenes.forEach((s: ThreeScene) => s.updateCamera(position))
  }

  render() {
    this.renderer?.clear()
    this.scenes.forEach((s: ThreeScene) => s.render())
  }

  updateSize({ size }: { size: Vector2 }) {
    this.renderer?.setSize(size.x, size.y)
    this.renderer?.setPixelRatio(this.getDevicePixelRatio())

    this.size.x = size.x
    this.size.y = size.y

    this.scenes.forEach((s: ThreeScene) => s.updateSize({ size }))

    this.log(`updateSize() w: ${size.x}, h: ${size.y}`)
  }

  getDevicePixelRatio(): number {
    const maxPixelRatio = 2
    return Math.min(window.devicePixelRatio, maxPixelRatio)
  }

  updateMobileLayout(value: boolean) {
    this.isMobileLayout = value
    this.scenes.forEach((s: ThreeScene) => s.updateMobileLayout(value))
  }

  updateScrollBounding(value: number) {
    this.logo?.updateScrollBounding(value)
    this.planes?.updateScrollBounding(value)
  }

  toScale(n: number): number {
    const mvw = Math.min(this.size.x, 1800) // Check layout max width
    return (n * mvw) / (this.isMobileLayout ? 375 : 1440)
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
