import {
  Box3,
  Vector2,
  Vector3,
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  DirectionalLight,
  Object3D,
} from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import type { ConstructorParams, CreateParams } from '~/types/front/three'
import { gsap } from 'gsap/gsap-core'

export default class {
  debug: boolean = false

  ready: boolean = false
  active: boolean = false

  main: HTMLElement | null = null
  canvas: HTMLCanvasElement | null = null

  y: number = 0
  z: number = 1000
  scene: Scene | null = null
  camera: PerspectiveCamera | null = null
  renderer: WebGLRenderer | null = null

  logo: Object3D | null = null
  light: DirectionalLight | null = null

  logoSize: number = 160
  scale: number = 1
  targetScale: number = 1

  animation: { value: number } = { value: 0 }
  margin: number = 0

  intersects: Array<Object3D> = []

  size: Vector2 = new Vector2()
  isMobileLayout: boolean = false

  scrollBounding: number = 0

  onPreloaded: Function = () => {}

  constructor(params: ConstructorParams) {
    const { onPreloaded } = params

    this.onPreloaded = onPreloaded || this.onPreloaded

    this.bind()
  }

  async create(params: CreateParams) {
    this.log(`create()`)
    const { renderer, canvas, size } = params

    this.canvas = canvas

    this.scene = new Scene()

    this.camera = new PerspectiveCamera(75, size.x / size.y, 100, 1250)
    this.camera.position.z = this.z

    this.renderer = renderer

    this.updateSize({ size })

    const loader = new GLTFLoader()
    loader.load('./assets/gltf/logo.gltf', async gltf => {
      this.logo = gltf.scene.children[0].children[0].children[0]
      this.logo.scale.set(1, 1, 1)
      this.logo.rotation.set(0, 0, 0)
      this.logo.position.set(0, 0, 0)
      this.updateScale()

      this.light = new DirectionalLight(0xffffff, 0)
      this.light.position.set(1, 1, 1)

      this.scene?.add(this.light)
      this.scene?.add(this.logo)
      this.ready = true
      this.onPreloaded()
    })
  }

  updateCamera(y: number) {
    this.y = y
  }

  rotate(y: number) {
    if (this.logo) {
      gsap.killTweensOf(this.logo.rotation)
      gsap.to(this.logo.rotation, { y, onUpdate: this.updateLight.bind(this) })
    }
  }

  render() {
    if (!this.logo || !this.scene || !this.camera || !this.renderer) return
    let scrollTarget = this.size.y
    let scrollProgress = Math.min(1, this.y / scrollTarget)

    let scrollLeaveInit = this.scrollBounding - this.size.y
    let scrollLeaveEnd = !this.isMobileLayout
      ? this.scrollBounding - this.margin * 2 - 160
      : this.scrollBounding - 16 - 56
    let scrollLeaveProgress = Math.max(
      0,
      Math.min(1, (this.y - scrollLeaveInit) / (scrollLeaveEnd - scrollLeaveInit))
    )
    let scrollLeaveGap = Math.max(0, this.y - scrollLeaveEnd)

    let scrollDistance = 0
    let scrollGap = 0
    let logoCurrentScale = 1 - (1 - this.targetScale) * scrollProgress
    let logoGap = 0
    let screenGap = 0
    let xOffset = 0
    let yOffset = 0

    if (!this.isMobileLayout) {
      logoCurrentScale += (1 - this.targetScale) * scrollLeaveProgress
      if (scrollLeaveProgress === 0) {
        scrollDistance = this.size.y - this.logoSize * this.targetScale - this.margin * 2
      } else {
        scrollDistance = this.size.y - this.logoSize * logoCurrentScale - this.margin * 2
      }

      scrollGap = scrollDistance * scrollProgress - 8 + 4 * scrollProgress - 4 * scrollLeaveProgress
      logoGap = this.logoSize * logoCurrentScale * 0.5 + this.margin
      screenGap = Math.max(0, this.size.x - 1800) * 0.5
      xOffset = -logoGap - screenGap
      yOffset = logoGap + scrollGap + scrollLeaveGap
    } else {
      const mobileHeaderTop = this.toScale(67) + this.logoSize * 0.5 + this.toScale(20)
      const mobileInitY = mobileHeaderTop
      const scrollDistanceX =
        this.size.x * 0.5 - this.logoSize * this.targetScale * 0.5 - this.margin
      const scrollGapX = scrollDistanceX * scrollProgress
      scrollDistance =
        this.size.y - mobileInitY - this.logoSize * this.targetScale * 0.5 - this.margin
      scrollGap = scrollDistance * scrollProgress

      const leaveGap = this.y > scrollLeaveEnd ? this.y - scrollLeaveEnd : 0

      xOffset = this.size.x * -0.5 + scrollGapX
      yOffset = mobileInitY + scrollGap + leaveGap
    }

    this.logo.scale.set(
      this.scale * logoCurrentScale * this.animation.value,
      this.scale * logoCurrentScale * this.animation.value,
      this.scale * logoCurrentScale * this.animation.value * 0.5
    )

    this.renderer.setViewport(
      this.size.x * 0.5 + xOffset,
      this.size.y * -0.5 + yOffset,
      this.size.x,
      this.size.y
    )
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

    this.margin =
      parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--layout-margin')) *
      10

    this.updateScale()

    this.log(`updateSize() w: ${size.x}, h: ${size.y}`)
  }

  updateState(value: boolean) {
    if (this.logo) {
      gsap.killTweensOf(this.logo.rotation)
      gsap.killTweensOf(this.animation)
      gsap.to(this.animation, { value: value ? 1 : 0 })
      gsap.to(this.logo.rotation, {
        y: value ? Math.PI * 2 : 0,
        onUpdate: this.updateLight.bind(this),
        onComplete: () => {
          if (this.logo) this.logo.rotation.y = Math.PI
        },
      })
    }
  }

  updateScale() {
    if (this.logo) {
      this.logo.scale.set(1, 1, 1)
      const box = new Box3().setFromObject(this.logo)
      const size = box.getSize(new Vector3())
      this.scale = this.logoSize / size.x
    }
  }

  updateScrollBounding(value: number) {
    this.scrollBounding = value
  }

  updateMobileLayout(value: boolean) {
    this.isMobileLayout = value
    this.logoSize = value ? 96 : 160
    this.targetScale = value ? 0.416666 : 0.25
  }

  updateLight() {
    if (!this.logo || !this.light) return
    const maxIntensity = 0.25
    const rotation = this.logo.rotation.y % Math.PI
    const distanceToMiddlePoint = Math.abs(rotation - Math.PI * 0.5) / (Math.PI * 0.5)
    this.light.intensity = maxIntensity - distanceToMiddlePoint * maxIntensity
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
    this.logo = null
    this.light = null
  }
}
