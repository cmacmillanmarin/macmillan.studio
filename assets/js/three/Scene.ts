import {
  Box3,
  Vector2,
  Vector3,
  Vector4,
  Raycaster,
  TextureLoader,
  PlaneGeometry,
  Mesh,
  ShaderMaterial,
  VideoTexture,
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  DirectionalLight,
  Object3D,
} from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

import { gsap } from 'gsap/gsap-core'
import { round, slugify, videoLoaded } from '~/utils'

import VS from '~/assets/js/three/glsl/vs.glsl'
import FS from '~/assets/js/three/glsl/vs.glsl'
import type { Cursor } from '~/types/front/store'
import type {
  CreateParams,
  Fixed,
  InViewParams,
  LoadedTexture,
  Object,
  ObjectParam,
  Plane,
} from '~/types/front/three'

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
  logoScene: Scene | null = null
  logoCamera: PerspectiveCamera | null = null
  logoLight: DirectionalLight | null = null
  logoSize: number = 160
  logoScale: number = 1
  logoTargetScale: number = 1
  logoAnimation: { value: number } = { value: 0 }
  logoMargin: number = 0

  colors: { [key: string]: Vector4 } = {
    white: new Vector4(1.0, 1.0, 1.0, 1.0),
    lime: new Vector4(197.0 / 255.0, 255.0 / 255.0, 32.0 / 255.0, 1.0),
    lightGrey: new Vector4(211.0 / 255.0, 214.0 / 255.0, 218.0 / 255.0, 1.0),
    darkGrey: new Vector4(129.0 / 255.0, 131.0 / 255.0, 136.0 / 255.0, 1.0),
  }

  maxPlanes: number = 10
  batch: Array<Plane> = []

  objects: Array<Object> = []
  intersects: Array<Object3D> = []

  frame: number = 0
  rendering: boolean = false
  needsUpdate: boolean = false

  touch: boolean = false
  touchStartX: number = 0
  touchStartY: number = 0
  touchTime: number = 0

  isMobileLayout: boolean = false

  bounding: DOMRect | null = null
  scrollBounding: number = 0
  maxPixelRatio: number = 2

  size: Vector2 = new Vector2()
  mouse: Vector2 = new Vector2(-1000, -1000)

  raycaster: Raycaster = new Raycaster()

  loader: TextureLoader = new TextureLoader()
  loaderRequests: number = 0
  loadedTextures: Array<LoadedTexture> = []
  loadedTexturesCount: number = 0
  onPreloaded: Function = () => {}

  updateCursor: Function = (value: Cursor) => {}

  _onClick: (this: Window, ev: MouseEvent) => any = () => {}
  _onMouseMovement: (this: Window, ev: MouseEvent) => any = () => {}
  _onTouchStart: (this: Window, ev: TouchEvent) => any = () => {}
  _onTouchEnd: (this: Window, ev: TouchEvent) => any = () => {}

  constructor() {
    this.bind()
  }

  async create(params: CreateParams) {
    this.log(`create()`)
    const { el, size, updateCursor, onPreloaded } = params

    this.main = document.querySelector('main')

    this.canvas = el

    this.scene = new Scene()
    this.logoScene = new Scene()

    this.camera = new PerspectiveCamera(75, size.x / size.y, 100, 1250)
    this.camera.position.z = this.z

    this.logoCamera = new PerspectiveCamera(75, size.x / size.y, 100, 1250)
    this.logoCamera.position.z = this.z

    this.renderer = new WebGLRenderer({
      canvas: this.canvas,
      alpha: true,
      antialias: false,
      premultipliedAlpha: false,
    })
    this.renderer.setClearColor(0x000000, 0)
    this.renderer.autoClear = false

    this.onPreloaded = onPreloaded || this.onPreloaded
    this.updateCursor = updateCursor || this.updateCursor

    this.updateSize({ size })
    this.addListeners()
    this.generatePlanesBatch()
    this.ready = true

    const loader = new GLTFLoader()
    loader.load('./assets/gltf/logo.gltf', async gltf => {
      this.logo = gltf.scene.children[0].children[0].children[0]
      this.logo.scale.set(1, 1, 1)
      this.logo.rotation.set(0, 0, 0)
      this.logo.position.set(0, 0, 0)
      this.updateLogoScale()

      this.logoLight = new DirectionalLight(0xffffff, 0)
      this.logoLight.position.set(1, 1, 1)

      this.logoScene?.add(this.logoLight)
      this.logoScene?.add(this.logo)
      this.onPreloaded()
    })
  }

  preload(img?: HTMLImageElement) {
    if (!img) {
      console.warn('No image to preload')
      return
    }
    const src = img.src || img.currentSrc
    const id = slugify(src)
    const exists = this.loadedTextures.find(t => t.id === id)
    if (!exists && this.loaderRequests < 2) {
      this.loaderRequests++
      this.loadedTextures.push({
        id,
        ready: false,
        txt: this.loader.load(img.src || img.currentSrc, async texture => {
          await this.renderer?.initTexture(texture)
          this.loaderRequests--
          const loadedTexture = this.loadedTextures.find(t => t.id === id)
          if (loadedTexture) {
            loadedTexture.ready = true
            this.loadedTexturesCount++
          }
        }),
      })
    }
  }

  addObject(param: ObjectParam) {
    this.log('addObject()')

    this.objects.push({
      ...param,
      border: param.border || 0,
      fade: !!param.fade,
      fixed: param.fixed || { from: 0, to: 0 },
      position: param.position || new Vector2(),
      parallax: param.parallax || new Vector2(),
      size: param.size || new Vector3(),
      rotate: param.rotate || new Vector3(),
      zoom: param.zoom || 1,
      order: param.order || 0,
      cursor: param.cursor || 'default',
      opacity: param.opacity !== undefined ? param.opacity : 1,
      textureFade: param.textureFade !== undefined ? param.textureFade : null,
      multiplyColor: param.multiplyColor || null,
      color: param.color || null,
      noPixel: !!param.noPixel,
      forcePixel: !!param.forcePixel,
      blackAndWhite: !!param.blackAndWhite,
      img: param.img || null,
      video: param.video || null,
      onClick: param.onClick || null,
      onIntersect: param.onIntersect || null,
      inView: false,
    })
  }

  getObject(id: string): Object | undefined {
    return this.objects.find(obj => obj.id === id)
  }

  updateObject(param: ObjectParam) {
    this.log(`updateObject() ${param.id}`)
    const object = this.getObject(param.id)
    if (object) {
      object.zoom = param.zoom !== undefined ? param.zoom : object.zoom
      object.border = param.border !== undefined ? param.border : object.border
      object.position = param.position || object.position
      object.parallax = param.parallax || object.parallax
      object.rotate = param.rotate || object.rotate
      object.img = param.img || object.img
      object.video = param.video || object.video
      object.size = param.size || object.size
      object.fade = param.fade !== undefined ? param.fade : object.fade
      object.fixed = param.fixed || object.fixed
      object.order = param.order !== undefined ? param.order : object.order
      object.opacity = param.opacity !== undefined ? param.opacity : object.opacity
      object.onClick = param.onClick !== undefined ? param.onClick : object.onClick
      object.multiplyColor = param.multiplyColor || object.multiplyColor
      object.color = param.color || object.color
      object.textureFade = param.textureFade !== undefined ? param.textureFade : object.textureFade
      object.cursor = param.cursor || object.cursor
      object.noPixel = param.noPixel !== undefined ? param.noPixel : object.noPixel
      object.blackAndWhite =
        param.blackAndWhite !== undefined ? param.blackAndWhite : object.blackAndWhite
      object.forcePixel = param.forcePixel !== undefined ? param.forcePixel : object.forcePixel
      object.onIntersect = param.onIntersect !== undefined ? param.onIntersect : object.onIntersect
    }
  }

  removeObject(params: { id: string }) {
    if (!this.objects) return
    const { id } = params
    const index = this.objects.findIndex(object => object.id === id)
    const object = this.objects[index]
    if (!object) return
    if (object.mesh && object.mesh.material.uniforms) {
      gsap.killTweensOf(object.mesh.material.uniforms.uFade)
      gsap.to(object.mesh.material.uniforms.uFade, {
        value: 0.0,
        duration: 0.2,
        ease: 'power1.out',
        onComplete: () => {
          const index = this.objects.findIndex(object => object.id === id)
          const object = this.objects[index]
          object.meshId && this.releasePlane(object.meshId)
          this.objects.splice(index, 1)
        },
      })
    } else if (index !== -1) {
      this.objects.splice(index, 1)
    }
  }

  updateY(y: number) {
    this.y = y
    if (this.camera) {
      this.camera.position.y = this.y * -1
      this.raycaster.setFromCamera(this.mouse, this.camera)
    }
  }

  updateObjects() {
    this.needsUpdate = false

    for (const object of this.objects) {
      object.inView = this.inView(object)
      let texture: LoadedTexture | undefined

      if (object.inView) {
        if (!object.mesh) {
          const availablePlane = this.getAvailablePlane(object.id)
          if (!availablePlane) {
            console.warn(`No available planes for ${object.id}`)
            continue
          }

          object.mesh = availablePlane.mesh
          object.meshId = availablePlane.id
          object.mesh.material.uniforms.uTextureFade.value = 0
          object.mesh.material.uniforms.uTextureLoaded.value = 0
          object.mesh.material.uniforms.uBlackAndWhite.value = object.blackAndWhite ? 1 : 0
          object.mesh.material.uniforms.uDevicePixelRatio.value = this.getDevicePixelRatio()

          object.firstFrame = true
          object.wasPixelated = false
          object.wasHovered = false
          object.wasClickable = false
          object.previousCursor = object.cursor
          object.videoAssigned = object.imgAssigned = false

          if (object.fade) this.planeIn(object.mesh.material.uniforms.uFade)
          else object.mesh.material.uniforms.uFade.value = 1
        }

        if (object.video && !object.videoAssigned) {
          object.videoAssigned = true
          object.mesh.material.uniforms.uTextureType.value = 0
          object.mesh.material.uniforms.uTextureVideo.value.image = object.video
          object.mesh.material.uniforms.uTextureSize.value.x = object.size.x
          object.mesh.material.uniforms.uTextureSize.value.y =
            (object.size.x * object.video.height) / object.video.width
          object.mesh.material.uniforms.uTextureLoaded.value =
            videoLoaded(object.video) && object.firstFrame ? 1 : 0
        } else if (object.img && !object.imgAssigned) {
          object.imgAssigned = true
          object.mesh.material.uniforms.uTextureType.value = 1
          object.mesh.material.uniforms.uTextureSize.value.x = object.img.width
          object.mesh.material.uniforms.uTextureSize.value.y = object.img.height
          if (this.imageLoaded(object.img) && object.firstFrame) {
            object.mesh.material.uniforms.uTextureLoaded.value = 1
            texture = this.loadedTextures.find(t => t.id === slugify(object.img?.currentSrc || ''))
            if (texture) object.mesh.material.uniforms.uTextureImage.value = texture.txt
          }
        }

        const { uniforms } = object.mesh.material as ShaderMaterial

        let isLoaded = 0
        if (uniforms.uTextureLoaded.value === 1) isLoaded = 1
        else if (object.video) isLoaded = videoLoaded(object.video) ? 1 : 0
        else if (object.img) {
          isLoaded = this.imageLoaded(object.img)
          if (isLoaded) {
            texture = this.loadedTextures.find(t => t.id === slugify(object.img?.currentSrc || ''))
            if (texture) uniforms.uTextureImage.value = texture.txt
          } else this.preload(object.img)
        }

        if (isLoaded && uniforms.uTextureFade.value === 0) {
          const fade = isLoaded !== uniforms.uTextureLoaded.value
          uniforms.uTextureLoaded.value = 1
          gsap.killTweensOf(uniforms.uTextureFade)
          gsap[fade ? 'to' : 'set'](uniforms.uTextureFade, { value: 1 })
        }

        this.needsUpdate = true

        const position: { x: number; y: number } = this.fromDomToCanvas({
          x: object.position.x,
          y: object.position.y + this.getFixedY(object.fixed),
        })
        object.mesh.renderOrder = object.order
        object.mesh.position.x = position.x + object.size.x * 0.5
        object.mesh.position.y = position.y - object.size.y * 0.5
        object.mesh.position.z = 0
        object.mesh.rotation.x = object.rotate.x
        object.mesh.rotation.y = object.rotate.y
        object.mesh.rotation.z = object.rotate.z
        object.mesh.scale.x = object.size.x
        object.mesh.scale.y = object.size.y
        object.mesh.scale.z = object.size.z

        uniforms.uFrame.value = this.frame
        uniforms.uColor.value = object.color || this.colors.lightGrey
        uniforms.uMultiplyColor.value = object.multiplyColor || this.colors.white
        uniforms.uOpacity.value = object.opacity !== undefined ? object.opacity : 1

        uniforms.uBorderRadius.value = object.border
        uniforms.uTime.value += 0.05
        const xPixelRatio = object.size.x / round(object.size.x / this.toScale(18))
        const yPixelRatio = object.size.y / round(object.size.y / this.toScale(18))
        uniforms.uPixelSize.value.x = object.size.x / xPixelRatio
        uniforms.uPixelSize.value.y = object.size.y / yPixelRatio
        uniforms.uParallax.value.x = object.parallax.x
        uniforms.uParallax.value.y = object.parallax.y
        uniforms.uPlaneSize.value.x = object.size.x
        uniforms.uPlaneSize.value.y = object.size.y

        if (object.video) {
          const { readyState, HAVE_CURRENT_DATA } = object.video
          uniforms.uTextureVideo.value.needsUpdate = readyState >= HAVE_CURRENT_DATA
        }

        if (object.textureFade) uniforms.uTextureFade.value = object.textureFade

        const hovered =
          this.intersects.includes(object.mesh) && (!this.touch || object.blackAndWhite)
        const clickable = hovered && !!object.onClick
        const pixelated = (clickable && !object.noPixel) || object.forcePixel
        const wasPixelated = uniforms.uPixel.value === 1
        const wasntPixelated = uniforms.uPixel.value === 0
        const pixelatedTransition = (pixelated && wasntPixelated) || (!pixelated && wasPixelated)

        object.onIntersect && object.onIntersect(hovered)

        if (hovered !== object.wasHovered && object.blackAndWhite) {
          gsap.killTweensOf(uniforms.uBlackAndWhite)
          gsap.to(uniforms.uBlackAndWhite, {
            value: hovered ? 0 : 1,
            duration: 0.4,
          })
        }

        if (pixelatedTransition || pixelated !== object.wasPixelated) {
          gsap.killTweensOf(uniforms.uPixel)
          gsap.to(uniforms.uPixel, { value: pixelated ? 1 : 0, duration: 0.4 })
        }

        if (!clickable && object.wasClickable) {
          // gsap.killTweensOf(uniforms.uZoom)
          // gsap.to(uniforms.uZoom, {
          //   value: object.zoom,
          //   duration: 0.4,
          //   onStart: () => {
          //     object.inZoomTransition = true
          //   },
          //   onComplete: () => {
          //     object.inZoomTransition = false
          //   },
          // })
          if (this.intersects.length === 0) {
            this.updateCursor('default')
            this.main?.classList.remove('__main--pointer')
            if (this.logo) {
              gsap.killTweensOf(this.logo.rotation)
              gsap.to(this.logo.rotation, { y: Math.PI, onUpdate: this.updateLogoLight.bind(this) })
            }
          }
        } else if (clickable && (!object.wasClickable || object.cursor !== object.previousCursor)) {
          // if (clickable && !object.wasClickable) {
          //   gsap.to(uniforms.uZoom, {
          //     value: object.zoom,
          //     // value: object.img ? object.zoom + 0.2 : object.zoom,
          //     duration: 1,
          //     onStart: () => {
          //       object.inZoomTransition = true
          //     },
          //     onComplete: () => {
          //       object.inZoomTransition = false
          //     },
          //   })
          // }
          this.main?.classList.add('__main--pointer')
          this.updateCursor(object.cursor)
          if (this.logo) {
            gsap.killTweensOf(this.logo.rotation)
            gsap.to(this.logo.rotation, {
              y: Math.PI * 2,
              onUpdate: this.updateLogoLight.bind(this),
            })
          }
        } else if (!clickable && !object.inZoomTransition) {
          uniforms.uZoom.value = object.zoom
        }
        object.firstFrame = false
        object.wasPixelated = pixelated
        object.wasHovered = hovered
        object.wasClickable = clickable
        object.previousCursor = object.cursor
      } else if (object.mesh && object.meshId) {
        ;(object.mesh.material as ShaderMaterial).uniforms.uFade.value = 0.0
        this.releasePlane(object.meshId)
        object.mesh = null
      }
    }
  }

  inView(params: InViewParams): boolean {
    const { position, size, opacity, fixed } = params
    const y = position.y + this.getFixedY(fixed)
    const limitTop = y - this.y >= size.y * -1
    const limitRight = position.x < this.size.x
    const limitBottom = y - this.y < this.size.y
    const limitLeft = position.x + size.x > 0

    return (
      limitTop && limitRight && limitBottom && limitLeft && size.x > 0 && size.y > 0 && opacity > 0
    )
  }

  getFixedY(fixed: Fixed): number {
    if (fixed && this.y >= fixed.from) {
      const { from, to } = fixed
      return Math.min(this.y - from, to - from)
    }
    return 0
  }

  render() {
    if (!this.renderer || !this.scene || !this.camera) return
    this.frame++
    this.renderer.clear()

    this.intersects = this.raycaster.intersectObjects(this.scene.children, false).map(i => i.object)

    this.updateObjects()

    if (this.needsUpdate) {
      this.log('render()')
      this.renderer.setViewport(0, 0, this.size.x, this.size.y)
      this.renderer.render(this.scene, this.camera)
    }

    this.logo && this.renderLogo()
  }

  renderLogo() {
    if (!this.logo || !this.logoScene || !this.logoCamera || !this.renderer) return
    let scrollTarget = this.size.y
    let scrollProgress = Math.min(1, this.y / scrollTarget)

    let scrollLeaveInit = this.scrollBounding - this.size.y
    let scrollLeaveEnd = !this.isMobileLayout
      ? this.scrollBounding - this.logoMargin * 2 - 160
      : this.scrollBounding - 16 - 56
    let scrollLeaveProgress = Math.max(
      0,
      Math.min(1, (this.y - scrollLeaveInit) / (scrollLeaveEnd - scrollLeaveInit))
    )
    let scrollLeaveGap = Math.max(0, this.y - scrollLeaveEnd)

    let scrollDistance = 0
    let scrollGap = 0
    let logoCurrentScale = 1 - (1 - this.logoTargetScale) * scrollProgress
    let logoGap = 0
    let screenGap = 0
    let xOffset = 0
    let yOffset = 0

    if (!this.isMobileLayout) {
      logoCurrentScale += (1 - this.logoTargetScale) * scrollLeaveProgress
      if (scrollLeaveProgress === 0) {
        scrollDistance = this.size.y - this.logoSize * this.logoTargetScale - this.logoMargin * 2
      } else {
        scrollDistance = this.size.y - this.logoSize * logoCurrentScale - this.logoMargin * 2
      }

      scrollGap = scrollDistance * scrollProgress - 8 + 4 * scrollProgress - 4 * scrollLeaveProgress
      logoGap = this.logoSize * logoCurrentScale * 0.5 + this.logoMargin
      screenGap = Math.max(0, this.size.x - 1800) * 0.5
      xOffset = -logoGap - screenGap
      yOffset = logoGap + scrollGap + scrollLeaveGap
    } else {
      const mobileHeaderTop = this.toScale(67) + this.logoSize * 0.5 + this.toScale(20)
      const mobileInitY = mobileHeaderTop
      const scrollDistanceX =
        this.size.x * 0.5 - this.logoSize * this.logoTargetScale * 0.5 - this.logoMargin
      const scrollGapX = scrollDistanceX * scrollProgress
      scrollDistance =
        this.size.y - mobileInitY - this.logoSize * this.logoTargetScale * 0.5 - this.logoMargin
      scrollGap = scrollDistance * scrollProgress

      const leaveGap = this.y > scrollLeaveEnd ? this.y - scrollLeaveEnd : 0

      xOffset = this.size.x * -0.5 + scrollGapX
      yOffset = mobileInitY + scrollGap + leaveGap
    }

    this.logo.scale.set(
      this.logoScale * logoCurrentScale * this.logoAnimation.value,
      this.logoScale * logoCurrentScale * this.logoAnimation.value,
      this.logoScale * logoCurrentScale * this.logoAnimation.value * 0.5
    )

    this.renderer.setViewport(
      this.size.x * 0.5 + xOffset,
      this.size.y * -0.5 + yOffset,
      this.size.x,
      this.size.y
    )
    this.renderer.render(this.logoScene, this.logoCamera)
  }

  getAvailablePlane(id: string): Plane | undefined {
    if (this.batch.length === 0) {
      this.generatePlanesBatch()
    }

    for (let i = this.batch.length - 1; i >= 0; i--) {
      const plane = this.batch[i]
      if (plane.available) {
        this.log(`Object ${id} gets available plane ${plane.id}`)
        plane.available = false
        plane.mesh.visible = true
        return plane
      }
    }

    this.log('Error! NO PLANES AVAILABLE')
  }

  releasePlane(id: number) {
    const plane = this.batch.find(p => p.id === id)
    if (plane) {
      this.log(`Plane ${id} released`)
      plane.mesh.scale.x = 0
      plane.mesh.scale.y = 0
      plane.available = true
      plane.mesh.visible = false
      plane.video = null
      plane.img = null
    }
  }

  generatePlanesBatch() {
    const video = document.createElement('video')
    const plane = new PlaneGeometry(1, 1)
    for (let id = 0; id < this.maxPlanes; id++) {
      const available: boolean = true
      const mesh = new Mesh(
        plane,
        new ShaderMaterial({
          vertexShader: VS,
          fragmentShader: FS,
          uniforms: {
            uNoise: { value: 0 },
            uFrame: { value: 0 },
            uTime: { value: 0.0 },
            uFade: { value: 0.0 },
            uZoom: { value: 1.0 },
            uPixel: { value: 0.0 },
            uBlackAndWhite: { value: 0.0 },
            uParallax: { value: new Vector2(0, 0) },
            uOpacity: { value: 1.0 },
            uBorderRadius: { value: 16.0 },
            uPixelSize: { value: new Vector2(1, 1) },
            uTextureType: { value: 0 }, // 0 Video, 1 Image
            uTextureFade: { value: 0.0 },
            uTextureLoaded: { value: 0 },
            uTextureImage: { value: null },
            uTextureVideo: { value: new VideoTexture(video) },
            uTextureSize: { value: new Vector2(1, 1) },
            uPlaneSize: { value: new Vector2(1, 1) },
            uDevicePixelRatio: { value: 1.0 },
            uColor: { value: this.colors.lightGrey },
            uMultiplyColor: { value: this.colors.lime },
          },
          wireframe: false,
          transparent: true,
          depthTest: false,
          depthWrite: false,
        })
      )
      mesh.visible = false
      this.scene?.add(mesh)
      this.batch.push({ id, available, mesh, img: null, video: null })
    }
  }

  updateSize(params: { size?: { x: number; y: number } }) {
    const { size } = params
    if (!size || !this.camera || !this.logoCamera || !this.renderer) return

    this.size.x = size.x
    this.size.y = size.y

    this.camera.aspect = size.x / size.y
    this.camera.fov = 2 * Math.atan((size.y * 0.5) / this.z) * (180 / Math.PI)
    this.camera.updateProjectionMatrix()

    this.logoCamera.aspect = size.x / size.y
    this.logoCamera.fov = 2 * Math.atan((size.y * 0.5) / this.z) * (180 / Math.PI)
    this.logoCamera.updateProjectionMatrix()
    this.logoMargin =
      parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--layout-margin')) *
      10

    this.touch = !!window.getComputedStyle(document.body, ':after').getPropertyValue('--touch')

    this.updateLogoScale()

    this.renderer.setSize(size.x, size.y)
    this.renderer.setPixelRatio(this.getDevicePixelRatio())

    this.bounding = this.renderer.domElement.getBoundingClientRect()

    this.log(`updateSize() w: ${size.x}, h: ${size.y}`)
  }

  getDevicePixelRatio(): number {
    return Math.min(window.devicePixelRatio, this.maxPixelRatio)
  }

  fromDomToCanvas(params: { x: number; y: number }): { x: number; y: number } {
    return {
      x: params.x - this.size.x * 0.5,
      y: -params.y + this.size.y * 0.5,
    }
  }

  planeIn(prop: { value: number }) {
    gsap.killTweensOf(prop)
    const duration = 1.2
    gsap.fromTo(prop, { value: 0 }, { value: 1, duration, delay: 0.1 })
  }

  updateLogoState(value: boolean) {
    if (this.logo) {
      gsap.killTweensOf(this.logo.rotation)
      gsap.killTweensOf(this.logoAnimation)
      gsap.to(this.logoAnimation, { value: value ? 1 : 0 })
      gsap.to(this.logo.rotation, {
        y: value ? Math.PI : 0,
        onUpdate: this.updateLogoLight.bind(this),
      })
    }
  }

  updateLogoScale() {
    if (this.logo) {
      this.logo.scale.set(1, 1, 1)
      const box = new Box3().setFromObject(this.logo)
      const size = box.getSize(new Vector3())
      this.logoScale = this.logoSize / size.x
    }
  }

  updateMobileLayout(value: boolean) {
    this.isMobileLayout = value
    this.logoSize = value ? 96 : 160
    this.logoTargetScale = value ? 0.416666 : 0.25
  }

  updateLogoLight() {
    if (!this.logo || !this.logoLight) return
    const maxIntensity = 0.25
    const rotation = this.logo.rotation.y % Math.PI
    const distanceToMiddlePoint = Math.abs(rotation - Math.PI * 0.5) / (Math.PI * 0.5)
    this.logoLight.intensity = maxIntensity - distanceToMiddlePoint * maxIntensity
  }

  updateScrollBounding(value: number) {
    this.scrollBounding = value
  }

  toScale(n: number): number {
    const mvw = Math.min(this.size.x, 1800) // Check layout max width
    return (n * mvw) / (this.isMobileLayout ? 375 : 1440)
  }

  imageLoaded(img: HTMLImageElement): number {
    const { currentSrc } = img
    const id = slugify(currentSrc)
    const texture = this.loadedTextures.find(t => t.id === id)
    if (texture?.ready) return 1
    return 0
  }

  onClick(e: MouseEvent) {
    for (const mesh of this.intersects) {
      const object = this.objects.find(obj => obj.mesh === mesh)
      if (object && object.onClick) {
        object.onClick()
        return
      }
    }
  }

  onMouseMovement(e: MouseEvent) {
    if (!this.bounding || this.touch) return
    this.updateRaycaster({ x: e.clientX, y: e.clientY })
  }

  updateRaycaster(params: { x: number; y: number }) {
    if (!this.camera || !this.bounding) return
    const { x, y } = params
    this.mouse.x = ((x - this.bounding.left) / (this.bounding.right - this.bounding.left)) * 2 - 1
    this.mouse.y = -((y - this.bounding.top) / (this.bounding.bottom - this.bounding.top)) * 2 + 1

    this.raycaster.setFromCamera(this.mouse, this.camera)
  }

  onTouchStart(e: TouchEvent) {
    const { clientX, clientY } = this.getTouch(e)
    this.touchStartX = clientX
    this.touchStartY = clientY
    this.touchTime = Date.now()
  }

  onTouchEnd(e: TouchEvent) {
    const { clientX, clientY } = this.getTouch(e)
    const touchDifferenceX = Math.abs(clientX - this.touchStartX)
    const touchDifferenceY = Math.abs(clientY - this.touchStartY)
    const touchTime = Date.now() - this.touchTime
    if (this.scene && touchDifferenceX < 10 && touchDifferenceY < 10 && touchTime < 200) {
      this.updateRaycaster({ x: clientX, y: clientY })
      this.intersects = this.raycaster
        .intersectObjects(this.scene.children, false)
        .map(i => i.object)
    }
  }

  getTouch(e: TouchEvent): Touch {
    const touch = e.changedTouches || e.touches
    return touch && touch.length ? touch[0] : (e as unknown as Touch)
  }

  bind() {
    this._onClick = this.onClick.bind(this)
    this._onMouseMovement = this.onMouseMovement.bind(this)
    this._onTouchStart = this.onTouchStart.bind(this)
    this._onTouchEnd = this.onTouchEnd.bind(this)
  }

  addListeners() {
    window.addEventListener('click', this._onClick)
    window.addEventListener('mousemove', this._onMouseMovement)
    window.addEventListener('touchstart', this._onTouchStart)
    window.addEventListener('touchend', this._onTouchEnd)
  }

  removeListeners() {
    window.removeEventListener('click', this._onClick)
    window.removeEventListener('mousemove', this._onMouseMovement)
    window.removeEventListener('touchstart', this._onTouchStart)
    window.removeEventListener('touchend', this._onTouchEnd)
  }

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
    this.logo = null
    this.logoScene = null
    this.logoCamera = null
    this.logoLight = null
    this.renderer = null
    this.objects = []
    for (const i in this.batch) {
      delete this.batch[i]
    }

    this.removeListeners()
  }
}
