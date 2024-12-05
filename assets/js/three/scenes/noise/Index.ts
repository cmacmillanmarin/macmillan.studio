import {
  Vector2,
  PlaneGeometry,
  Mesh,
  ShaderMaterial,
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
} from 'three'
import type { CreateParams } from '~/types/front/three'
import VS from '~/assets/js/three/scenes/noise/glsl/vs.glsl'
import FS from '~/assets/js/three/scenes/noise/glsl/fs.glsl'

export default class Noise {
  debug: boolean = false

  ready: boolean = false

  canvas: HTMLCanvasElement | null = null

  z: number = 1000
  scene: Scene | null = null
  camera: PerspectiveCamera | null = null
  renderer: WebGLRenderer | null = null

  noise: any | null = null

  size: Vector2 = new Vector2()

  isMobileLayout: boolean = false
  maxPixelRatio: number = 2

  rendering: boolean = false

  constructor() {
    this.bind()
  }

  async create(params: CreateParams) {
    this.log(`create()`)
    const { renderer, parent, size } = params

    this.canvas = document.createElement('canvas')
    this.canvas.classList.add('three--noise')
    parent.appendChild(this.canvas)

    this.renderer = renderer

    this.scene = new Scene()

    this.camera = new PerspectiveCamera(75, size.x / size.y, 100, 1250)
    this.camera.position.z = this.z

    this.createNoise()
    this.updateSize({ size })
    this.ready = true
  }

  render() {
    if (!this.noise || !this.scene || !this.renderer || !this.camera) return
    this.noise.material.uniforms.uFrame.value++
    this.noise.material.uniforms.uTime.value += 0.05

    this.renderer.setViewport(0, 0, this.size.x, this.size.y)
    this.renderer.domElement = this.canvas as HTMLCanvasElement
    this.renderer.render(this.scene, this.camera)
  }

  createNoise() {
    this.noise = new Mesh(
      new PlaneGeometry(1, 1),
      new ShaderMaterial({
        vertexShader: VS,
        fragmentShader: FS,
        uniforms: {
          uTime: { value: 0.0 },
          uFrame: { value: 0 },
          uOpacity: { value: 0.0 },
          uPlaneSize: { value: new Vector2(1, 1) },
          uDevicePixelRatio: { value: 1.0 },
        },
        wireframe: false,
        transparent: true,
      })
    )
    this.scene?.add(this.noise)
  }

  updateSize(params: { size: { x: number; y: number } }) {
    const { size } = params
    if (!size || !this.camera || !this.noise || !this.renderer) return
    this.size.x = size.x
    this.size.y = size.y

    this.camera.aspect = size.x / size.y
    this.camera.fov = 2 * Math.atan((size.y * 0.5) / this.z) * (180 / Math.PI)
    this.camera.updateProjectionMatrix()

    this.noise.scale.x = size.x
    this.noise.scale.y = size.y
    this.noise.scale.z = 1
    this.noise.material.uniforms.uPlaneSize.value.x = size.x
    this.noise.material.uniforms.uPlaneSize.value.y = size.y
    this.noise.material.uniforms.uDevicePixelRatio.value = this.getDevicePixelRatio()

    this.renderer.setSize(size.x, size.y)
    this.renderer.setPixelRatio(this.getDevicePixelRatio())

    this.log(`updateSize() w: ${size.x}, h: ${size.y}`)
  }

  getDevicePixelRatio() {
    return Math.min(window.devicePixelRatio, this.maxPixelRatio)
  }

  fromDomToCanvas(params: { x: number; y: number }): { x: number; y: number } {
    return {
      x: params.x - this.size.x * 0.5,
      y: -params.y + this.size.y * 0.5,
    }
  }

  updateOpacity(opacity: number) {
    if (this.noise) this.noise.material.uniforms.uOpacity.value = opacity
  }

  updateMobileLayout(value: boolean) {
    this.isMobileLayout = value
  }

  toScale(n: number): number {
    const mvw = Math.min(this.size.x, 1800)
    return (n * mvw) / (this.isMobileLayout ? 375 : 1440)
  }

  updateCamera(y: number) {}

  bind() {}

  log(msg: string) {
    if (!this.debug) return
    console.log(`Scene ~ ${msg}`)
  }

  destroy() {
    this.log('destroy()')

    this.ready = false
    this.canvas?.remove()
    this.canvas = null
    this.scene = null
    this.camera = null
    this.renderer = null
    this.noise = null
  }
}
