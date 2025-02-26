import {
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
  Object3D,
  Texture,
} from 'three'
import type {
  ConstructorParams,
  CreateParams,
  Fixed,
  InViewParams,
  Object,
  ObjectParam,
  Plane,
  PlaneTexture,
} from '~/types/front/three'
import { gsap } from 'gsap/gsap-core'
import { round, slugify, videoLoaded } from '~/utils'

import VS from '~/assets/js/three/scenes/planes/glsl/vs.glsl'
import FS from '~/assets/js/three/scenes/planes/glsl/fs.glsl'

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

  isMobileLayout: boolean = false
  maxPixelRatio: number = 2

  touch: boolean = false
  touchStartX: number = 0
  touchStartY: number = 0
  touchTime: number = 0

  bounding: DOMRect | null = null
  scrollBounding: number = 0

  size: Vector2 = new Vector2()
  mouse: Vector2 = new Vector2(-1000, -1000)

  raycaster: Raycaster = new Raycaster()

  textures: Array<PlaneTexture> = []
  texturesLoader: TextureLoader = new TextureLoader()
  texturesLoaderRequests: number = 0
  texturesLoaderRequestsThreshold: number = 2
  texturesLoaderRequestQueue: Array<HTMLImageElement> = []

  rotateLogo: Function = () => {}
  updateCursor: Function = () => {}
  toScale: Function = (): number => 1
  getDevicePixelRatio: Function = (): number => 1

  _onClick: (this: Window, ev: MouseEvent) => any = () => {}
  _onTextureLoaded: (data: Texture) => void = () => {}
  _onMouseMovement: (this: Window, ev: MouseEvent) => any = () => {}
  _onTouchStart: (this: Window, ev: TouchEvent) => any = () => {}
  _onTouchEnd: (this: Window, ev: TouchEvent) => any = () => {}

  constructor(params: ConstructorParams) {
    const { updateCursor, rotateLogo, toScale, getDevicePixelRatio } = params

    this.toScale = toScale || this.toScale
    this.rotateLogo = rotateLogo || this.rotateLogo
    this.updateCursor = updateCursor || this.updateCursor
    this.getDevicePixelRatio = getDevicePixelRatio || this.getDevicePixelRatio

    this.bind()
  }

  async create(params: CreateParams) {
    this.log(`create()`)
    const { canvas, renderer, size } = params

    this.canvas = canvas
    this.renderer = renderer

    this.main = document.querySelector('main')

    this.scene = new Scene()

    this.camera = new PerspectiveCamera(75, size.x / size.y, 100, 1250)
    this.camera.position.z = this.z

    this.updateSize({ size })
    this.addListeners()
    this.generatePlanesBatch()
    this.ready = true
  }

  preload(img?: HTMLImageElement) {
    if (!img) {
      console.warn('No image to preload')
      return
    }
    this.createTexture(img)
  }

  createTexture(img: HTMLImageElement): PlaneTexture {
    const id = this.getTextureId(img)
    const texture: PlaneTexture = { id }
    this.textures.push(texture)
    this.loadTexture(img)
    return texture
  }

  loadTexture(img: HTMLImageElement) {
    if (this.texturesLoaderRequests <= this.texturesLoaderRequestsThreshold) {
      this.texturesLoaderRequests++
      this.initTexture(img, this._onTextureLoaded)
    } else {
      this.texturesLoaderRequestQueue.push(img)
    }
  }

  async initTexture(img: HTMLImageElement, cb: Function) {
    const txt = new Texture(img)
    await this.renderer?.initTexture(txt)
    txt.needsUpdate = true
    cb(txt)
  }

  async onTextureLoaded(txt: Texture) {
    const texture = this.getTexture(txt.image)
    texture.txt = txt
    this.texturesLoaderRequests--
    const queueTexture = this.texturesLoaderRequestQueue.pop()
    queueTexture && this.loadTexture(queueTexture)
  }

  getTextureId(img: HTMLImageElement): string {
    const src = img.src || img.currentSrc
    return slugify(src)
  }

  getTexture(img: HTMLImageElement): PlaneTexture {
    const id = this.getTextureId(img)
    const existingTexture = this.textures.find(t => t.id === id)
    if (existingTexture) return existingTexture
    return this.createTexture(img)
  }

  add(param: ObjectParam) {
    this.log('add()')

    this.objects.push({
      ...param,
      meshId: -1,
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

  update(param: ObjectParam) {
    this.log(`update() ${param.img}`)
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

  remove(params: { id: string }) {
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
          this.releasePlane(object.meshId)
          this.objects.splice(index, 1)
        },
      })
    } else if (index !== -1) {
      this.objects.splice(index, 1)
    }
  }

  updateCamera(y: number) {
    this.y = y
    if (this.camera) {
      this.camera.position.y = this.y * -1
      this.raycaster.setFromCamera(this.mouse, this.camera)
    }
  }

  updatePlanes() {
    this.needsUpdate = false

    for (const object of this.objects) {
      object.inView = this.inView(object)

      if (object.inView || object.wasInView) {
        if (!object.mesh) {
          const plane = this.getAvailablePlane(object.id)
          if (!plane) {
            console.warn(`No available planes for ${object.id}`)
            continue
          }
          object.firstFrame = true
          object.wasHovered = false
          object.wasPixelated = false
          object.wasClickable = false
          object.previousCursor = object.cursor
          object.videoAssigned = object.imgAssigned = false
          this.assignPlaneToObject({ plane, object })
        }

        this.needsUpdate = true

        object.img && this.processImage(object)
        object.video && this.processVideo(object)

        const fixed = this.getFixedY(object.fixed)
        const { x, y } = this.fromDomToCanvas({
          x: object.position.x,
          y: object.position.y + fixed,
        })
        const { mesh } = object
        mesh.renderOrder = object.order
        mesh.position.x = x + object.size.x * 0.5
        mesh.position.y = y - object.size.y * 0.5
        mesh.position.z = 0
        mesh.rotation.x = object.rotate.x
        mesh.rotation.y = object.rotate.y
        mesh.rotation.z = object.rotate.z
        mesh.scale.x = object.size.x
        mesh.scale.y = object.size.y
        mesh.scale.z = object.size.z

        const { uniforms } = mesh.material

        uniforms.uTime.value += 0.05
        uniforms.uFrame.value = this.frame
        uniforms.uPlaneSize.value.x = object.size.x
        uniforms.uPlaneSize.value.y = object.size.y
        uniforms.uBorderRadius.value = object.border
        uniforms.uParallax.value.x = object.parallax.x
        uniforms.uParallax.value.y = object.parallax.y
        uniforms.uColor.value = object.color || this.colors.lightGrey
        uniforms.uMultiplyColor.value = object.multiplyColor || this.colors.white
        uniforms.uOpacity.value = object.opacity !== undefined ? object.opacity : 1
        if (object.textureFade !== null && object.textureFade !== uniforms.uTextureFade.value) {
          uniforms.uTextureFade.value = object.textureFade
        }
        const xPixelRatio = object.size.x / round(object.size.x / this.toScale(18))
        const yPixelRatio = object.size.y / round(object.size.y / this.toScale(18))
        uniforms.uPixelSize.value.x = object.size.x / xPixelRatio
        uniforms.uPixelSize.value.y = object.size.y / yPixelRatio

        const { onClick, blackAndWhite, forcePixel, noPixel, cursor } = object
        const hovered = this.intersects.includes(mesh) && (!this.touch || blackAndWhite)
        const clickable = hovered && !!onClick
        const pixelated = (clickable && !noPixel) || forcePixel

        this.manageEvents({ object, hovered, clickable, pixelated })

        object.wasPixelated = pixelated
        object.wasHovered = hovered
        object.wasClickable = clickable
        object.previousCursor = cursor
        object.firstFrame = false
      } else if (object.mesh) {
        this.releasePlane(object.meshId)
        object.mesh.material.uniforms.uFade.value = 0
        object.mesh = null
      }

      object.wasInView = object.inView
    }
  }

  manageEvents(params: {
    object: Object
    hovered: boolean
    clickable: boolean
    pixelated: boolean
  }) {
    const { object, hovered, clickable, pixelated } = params
    const { mesh, onIntersect, blackAndWhite, cursor, previousCursor } = object
    const { uniforms } = mesh.material

    const wasPixelated = uniforms.uPixel.value === 1
    const wasntPixelated = uniforms.uPixel.value === 0
    const pixelatedTransition = (pixelated && wasntPixelated) || (!pixelated && wasPixelated)

    const cursorChanged = cursor !== previousCursor

    onIntersect && onIntersect(hovered)

    if (blackAndWhite && hovered !== object.wasHovered) {
      gsap.killTweensOf(uniforms.uBlackAndWhite)
      gsap.to(uniforms.uBlackAndWhite, { value: hovered ? 0 : 1, duration: 0.4 })
    }

    if (pixelatedTransition || pixelated !== object.wasPixelated) {
      gsap.killTweensOf(uniforms.uPixel)
      gsap.to(uniforms.uPixel, { value: pixelated ? 1 : 0, duration: 0.4 })
    }

    if (!clickable && object.wasClickable) {
      // this.zoomTexture({ object, value: 1 })
      if (this.intersects.length === 0) {
        this.updateCursor('default')
        this.main?.classList.remove('__main--pointer')
        this.rotateLogo(Math.PI)
      }
    } else if (clickable && (!object.wasClickable || cursorChanged)) {
      // clickable && !clickable && this.zoomTexture({ object, value: 1.2 })
      this.updateCursor(cursor)
      this.main?.classList.add('__main--pointer')
      this.rotateLogo(Math.PI * 2)
    } else if (!clickable && !object.inZoomTransition) {
      uniforms.uZoom.value = object.zoom
    }
  }

  zoomTexture(params: { object: Object; value: number }) {
    const { object, value } = params
    const { uniforms } = object.mesh.material
    gsap.killTweensOf(uniforms.uZoom)
    gsap.to(uniforms.uZoom, {
      value,
      duration: 0.4,
      onStart: () => {
        object.inZoomTransition = true
      },
      onComplete: () => {
        object.inZoomTransition = false
      },
    })
  }

  assignPlaneToObject(params: { plane: Plane; object: Object }) {
    const { plane, object } = params

    plane.object = object.id

    object.mesh = plane.mesh
    object.meshId = plane.id

    const { uniforms } = object.mesh.material

    uniforms.uTextureFade.value = 0
    uniforms.uBlackAndWhite.value = object.blackAndWhite ? 1 : 0
    uniforms.uDevicePixelRatio.value = this.getDevicePixelRatio()

    gsap.killTweensOf(uniforms.uFade)
    gsap[object.fade ? 'to' : 'set'](uniforms.uFade, { value: 1 })
  }

  processImage(object: Object) {
    const { img, imgAssigned } = object
    if (!img || imgAssigned) return

    const texture = this.getTexture(img)
    const textureLoaded = !!texture.txt

    if (textureLoaded) {
      object.imgAssigned = true

      const { uniforms } = object.mesh.material
      uniforms.uTextureType.value = 1
      uniforms.uTextureImage.value = texture.txt
      uniforms.uTextureImage.needsUpdate = true
      uniforms.uTextureSize.value.x = object.size.x
      uniforms.uTextureSize.value.y = object.size.x * (img.height / img.width)

      const fade = !object.firstFrame
      gsap.killTweensOf(uniforms.uTextureFade)
      gsap[fade ? 'to' : 'set'](uniforms.uTextureFade, { value: 1 })
    }
  }

  processVideo(object: Object) {
    const { video } = object
    if (!video) return

    const { uniforms } = object.mesh.material
    const { clientWidth, clientHeight, width, height, readyState, HAVE_CURRENT_DATA } = video

    const loaded = videoLoaded(video)

    uniforms.uTextureVideo.value.needsUpdate = readyState >= HAVE_CURRENT_DATA && loaded

    if (loaded && !object.videoAssigned) {
      object.videoAssigned = true

      const videoWidth = clientWidth || width
      const videoHeight = clientHeight || height

      uniforms.uTextureType.value = 0
      uniforms.uTextureVideo.value.image = video
      uniforms.uTextureSize.value.x = object.size.x
      uniforms.uTextureSize.value.y = (object.size.x * videoHeight) / videoWidth

      const fade = !object.firstFrame
      gsap.killTweensOf(uniforms.uTextureFade)
      gsap[fade ? 'to' : 'set'](uniforms.uTextureFade, { value: 1 })
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

    this.updatePlanes()

    if (this.needsUpdate) {
      this.log('render()')
      this.renderer.setViewport(0, 0, this.size.x, this.size.y)
      this.renderer.render(this.scene, this.camera)
    }
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
      this.log(`Plane ${plane.object} released`)
      plane.mesh.scale.x = 0
      plane.mesh.scale.y = 0
      plane.mesh.visible = false
      plane.available = true
      plane.object = ''
      plane.video = null
      plane.img = null
    }
  }

  generatePlanesBatch() {
    const video = document.createElement('video')
    const plane = new PlaneGeometry(1, 1)
    for (let id = 0; id < this.maxPlanes; id++) {
      const object: string = ''
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
      this.batch.push({ id, object, available, mesh, img: null, video: null })
    }
  }

  updateSize(params: { size?: { x: number; y: number } }) {
    const { size } = params
    if (!size || !this.camera || !this.renderer) return

    this.size.x = size.x
    this.size.y = size.y

    this.camera.aspect = size.x / size.y
    this.camera.fov = 2 * Math.atan((size.y * 0.5) / this.z) * (180 / Math.PI)
    this.camera.updateProjectionMatrix()

    this.touch = !!window.getComputedStyle(document.body, ':after').getPropertyValue('--touch')

    this.bounding = this.renderer.domElement.getBoundingClientRect()

    this.log(`updateSize() w: ${size.x}, h: ${size.y}`)
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

  updateMobileLayout(value: boolean) {
    this.isMobileLayout = value
  }

  updateScrollBounding(value: number) {
    this.scrollBounding = value
  }

  imageLoaded(img: HTMLImageElement): number {
    const texture = this.getTexture(img)
    if (texture.txt) return 1
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
    this._onTextureLoaded = this.onTextureLoaded.bind(this)
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
    this.renderer = null
    this.objects = []
    for (const i in this.batch) {
      delete this.batch[i]
    }

    this.removeListeners()
  }
}
