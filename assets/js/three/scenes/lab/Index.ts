import {
  Vector2,
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  Mesh,
  BoxGeometry,
  MeshBasicMaterial,
} from 'three'
import type { ConstructorParams, CreateParams } from '~/types/front/three'
import { gsap } from 'gsap/gsap-core'

export default class {
  debug: boolean = false

  ready: boolean = false

  y: number = 0
  z: number = 1000
  scene: Scene | null = null
  camera: PerspectiveCamera | null = null
  renderer: WebGLRenderer | null = null

  cube: Mesh | null = null

  scrollBounding: number = 0

  size: Vector2 = new Vector2()
  isMobileLayout: boolean = false

  onPreloaded: Function = () => {}

  constructor(params: ConstructorParams) {
    const { onPreloaded } = params

    this.onPreloaded = onPreloaded || this.onPreloaded

    this.bind()
  }

  async create(params: CreateParams) {
    this.log(`create()`)
    const { renderer, size } = params

    this.scene = new Scene()

    this.camera = new PerspectiveCamera(75, size.x / size.y, 100, 1250)
    this.camera.position.z = this.z

    this.renderer = renderer

    const geometry = new BoxGeometry(1, 1, 1)
    const material = new MeshBasicMaterial({ color: 0xff0000, wireframe: true })
    this.cube = new Mesh(geometry, material)
    this.cube.scale.set(100, 100, 100)
    this.scene.add(this.cube)

    this.updateSize({ size })

    this.ready = true
    this.onPreloaded()
  }

  updateCamera(y: number) {
    this.y = y
  }

  render() {
    if (!this.ready || !this.scene || !this.camera || !this.renderer || !this.cube) return

    this.cube.rotation.x += 0.01
    this.cube.rotation.y += 0.01

    this.renderer.setViewport(0, 0, this.size.x, this.size.y)
    this.renderer.render(this.scene, this.camera)
  }

  updateSize(params: { size?: { x: number; y: number } }) {
    const { size } = params
    if (!size || !this.camera) return

    this.size.x = size.x
    this.size.y = size.y

    this.camera.aspect = size.x / size.y
    this.camera.fov = 2 * Math.atan((size.y * 0.5) / this.z) * (180 / Math.PI)
    this.camera.updateProjectionMatrix()

    this.log(`updateSize() w: ${size.x}, h: ${size.y}`)
  }

  updateScrollBounding(value: number) {
    this.scrollBounding = value
  }

  updateMobileLayout(value: boolean) {
    this.isMobileLayout = value
  }

  toScale(n: number): number {
    const mvw = Math.min(this.size.x, 1800) // Check layout max width
    return (n * mvw) / (this.isMobileLayout ? 375 : 1440)
  }

  bind() {}

  log(msg: string) {
    if (!this.debug) return
    console.log(`Scene ~ ${msg}`)
  }

  destroy() {
    this.log('destroy()')

    this.ready = false
    this.scene = null
    this.camera = null
  }
}
