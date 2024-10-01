<template>
  <div
    ref="el"
    :class="[
      'home__projects__project',
      { 'home__projects__project--all': all },
      { 'home__projects__project--all-and-selected': all && data.selected },
    ]"
    data-scroll-set-position>
    <CustomImage
      v-if="data.thumbnail.image.src"
      ref="customImageEl"
      :data="data.thumbnail.image"
      class="home__projects__project__img"
      @load="onImageLoaded" />

    <ClientOnly>
      <Teleport to="#top-layer">
        <div v-if="data.client.name && !all" ref="clientEl" class="home__projects__project__client">
          <div class="home__projects__project__client__logo"></div>
          <div class="home__projects__project__client__name">{{ data.client.name }}</div>
        </div>
        <div
          v-if="data.collaborator.name && !all"
          ref="collaboratorEl"
          class="home__projects__project__collaborator">
          <div class="home__projects__project__collaborator__name">
            {{ data.freelance ? 'w/ ' : 'at ' }}
            {{ data.collaborator.name }}
          </div>
        </div>
      </Teleport>
    </ClientOnly>

    <CustomLink :to="`/${data.slug}`" class="home__projects__project__anchor" :content="true" />
  </div>
</template>

<script lang="ts" setup>
import { gsap } from 'gsap'
import { storeToRefs } from 'pinia'
import useStore from '~/store/useStore'
import useScrollStore from '~/store/useScrollStore'
import { slugify } from '~/utils'
import { fadeIn, fadeOut } from '~/utils/animations'
import type { Project } from '~/types/wordpress/project'
import CustomImage from '~/components/Global/CustomImage.vue'

const props = defineProps<{
  list: 'all' | 'selected'
  i: number
  of: number
  data: Project
  top: number
  bottom: number
  sideX: number
  sideY: number
}>()

const { $scene }: any = useNuxtApp()

const router = useRouter()

const store = useStore()
const { section, isInProject, isInProjectEntered } = storeToRefs(store)
const { current, direction } = storeToRefs(useScrollStore())
const { getBounding } = useVirtualScrollAndThreeTools()

const { toScale, getColumnWidth } = useCss()
const { vw, vh } = useResize()
const { addTicker, killTicker } = useRaf()

const all = computed<boolean>(() => props.list === 'all')

const projectId = ref<string>(slugify(props.data.title))
const projectColor = ref<string>(props.data.color)

const el = ref<HTMLElement>()
const clientEl = ref<HTMLElement>()
const collaboratorEl = ref<HTMLElement>()
const videoEl = ref<HTMLVideoElement>()
const customImageEl = ref<typeof CustomImage>()

const inView = ref<boolean>(false)
const isLoaded = ref<boolean>(false)
const inTransition = ref<boolean>(false)

const opacity = ref<number>(0)
const progress = ref<number>(0)
const leaveProgress = ref<number>(0)

// For selected projects
const active = computed<boolean>(
  () => leaveProgress.value === 0 && progress.value > 0.55 && !isInProject.value
)

const size = computed<{ x: number; y: number }>(() => {
  const width = getColumnWidth(all.value && props.data.selected ? 3.5 : 3)
  return { x: width, y: (width * 7) / 5 }
})

let _position = { x: 0, y: 0 }
let _size = { x: 0, y: 0, z: 1 }
let _rotate = { x: 0, y: 0, z: 0 }
let _border = 0
let _zoom = 1
let _target = {
  position: { x: 0, y: 0 },
  size: { x: 0, y: 0, z: 1 },
  rotate: { x: 0, y: 0, z: 0 },
  border: 0,
  zoom: 0,
}
let _animated = {
  position: { x: 0, y: 0 },
  size: { x: 0, y: 0, z: 1 },
  rotate: { x: 0, y: 0, z: 0 },
  border: 0,
  zoom: 0,
}

watch(inView, () => {
  if (videoEl.value) {
    inView.value
      ? console.log(`Play video - ${projectId.value}`)
      : console.log(`Pause video - ${projectId.value}`)
    inView.value ? videoEl.value.play() : videoEl.value.pause()
  }
})

watch(all, () => {
  inTransition.value = true
  _animated = {
    position: _position,
    size: _size,
    rotate: _rotate,
    border: _border,
    zoom: _zoom,
  }
  addTicker(raf)
})

watch([isInProject, isInProjectEntered], () => {
  if (isInProjectEntered.value) {
    opacity.value = 0
    onOpacityUpdate()
  } else if (!isInProject.value) {
    gsap.killTweensOf(opacity)
    gsap.to(opacity, { value: 1, duration: 1, onUpdate: onOpacityUpdate })
  }
})

watch(section, () => {
  if (all.value) {
    gsap.killTweensOf(opacity)
    if (section.value === 'projects') {
      gsap.to(opacity, { value: 1, duration: 1, delay: 0.2, onUpdate: onOpacityUpdate })
    } else {
      gsap.to(opacity, { value: 0, duration: 0.6, onUpdate: onOpacityUpdate })
    }
  } else $scene.updateObject({ id: projectId.value, opacity: 1 })
  if (!section.value.includes('project')) inView.value = false
})

watch([el, active], async () => {
  await nextTick()

  if (clientEl.value) {
    gsap.killTweensOf(clientEl.value)
    active.value
      ? fadeIn({ el: clientEl.value, duration: 0.4 })
      : fadeOut({ el: clientEl.value, duration: 0.1 })
  }

  if (collaboratorEl.value) {
    gsap.killTweensOf(collaboratorEl.value)
    active.value
      ? fadeIn({ el: collaboratorEl.value, duration: 0.4 })
      : fadeOut({ el: collaboratorEl.value, duration: 0.1 })
  }

  active.value && emit('update-active', props.i)
  if (
    !active.value &&
    ((direction.value === 'up' && props.i === 0) ||
      (direction.value === 'down' && props.i === props.of))
  )
    emit('update-active', -1)
})

watch([el, current, all], () => {
  progress.value = getProgress()
  leaveProgress.value = getLeaveProgress()
})

watch([() => props.top, () => props.bottom, progress, leaveProgress, isLoaded, all], () => {
  const htmlx = size.value.x * progress.value * 0.5
  const htmly = size.value.y * progress.value * 0.5
  const htmlextra = props.i === 0 ? vh.value - vh.value * progress.value : 0
  const htmlmargin = toScale(12)

  clientEl.value &&
    gsap.set(clientEl.value, { x: -htmlx + htmlmargin, y: -htmly + htmlmargin + htmlextra })

  collaboratorEl.value &&
    gsap.set(collaboratorEl.value, { x: htmlx - htmlmargin, y: htmly - htmlmargin + htmlextra })

  if (!isLoaded.value) return

  inView.value = getInView()

  _position = { x: 0, y: 0 }
  _size = { x: 0, y: 0, z: 1 }
  _rotate = { x: 0, y: 0, z: 0 }
  _border = toScale(16)
  _zoom = 1

  if (all.value) {
    const y = Math.max(0, current.value - props.top)
    const { top, left } = getBounding(el.value as HTMLElement)

    _position.x = left - y
    _position.y = top
    _size.x = size.value.x
    _size.y = size.value.y
    _zoom = 1.4 - 0.4 * progress.value
  } else {
    const sizeX = size.value.x * (progress.value + leaveProgress.value)
    const sizeY = size.value.y * (progress.value + leaveProgress.value)

    const leaveX = sizeX * props.sideX * leaveProgress.value
    const leaveY = sizeY * props.sideY * leaveProgress.value

    const positionX = vw.value * 0.5 - sizeX * 0.5 + leaveX
    const positionY = props.top + vh.value * 0.5 - sizeY * 0.5 + leaveY

    const rotateX = 33 * props.sideY * leaveProgress.value
    const rotateY = 33 * props.sideX * leaveProgress.value
    const rotateRadX = (Math.PI / 180) * rotateX
    const rotateRadY = (Math.PI / 180) * rotateY

    _position.x = positionX
    _position.y = positionY
    _size.x = sizeX
    _size.y = sizeY
    _rotate.x = rotateRadX
    _rotate.y = rotateRadY
    _border = _border * (progress.value + leaveProgress.value)
    _zoom = 1.4 - 0.4 * progress.value
  }

  if (!inTransition.value) {
    $scene.updateObject({
      id: projectId.value,
      rotate: _rotate,
      position: _position,
      size: _size,
      border: _border,
      zoom: _zoom,
      fixed: { from: props.top, to: props.bottom },
    })
  } else {
    _target = {
      position: _position,
      size: _size,
      rotate: _rotate,
      border: _border,
      zoom: _zoom,
    }
  }
})

onMounted(() => {
  const id = slugify(props.data.thumbnail.video.src)
  if (!!id) {
    const video = document.getElementById(slugify(id)) as HTMLVideoElement | undefined
    if (video) {
      videoEl.value = video
      if (videoEl.value.readyState > 2) onVideoLoaded()
      else videoEl.value.addEventListener('canplay', onVideoLoaded)
    }
  }
  if (all.value) {
    inTransition.value = true
    _animated.position.x = vw.value * 0.5
    _animated.position.y = props.top + vh.value * 0.5
    addTicker(raf)
  }
})

function onVideoLoaded() {
  $scene.addObject({
    id: projectId.value,
    type: 'plane',
    video: videoEl.value,
    onClick: openProject,
    multiplyColor: 'darkGrey',
  })
  isLoaded.value = true
}

function onImageLoaded() {
  $scene.addObject({
    id: projectId.value,
    type: 'plane',
    img: customImageEl.value?.el,
    onClick: openProject,
    multiplyColor: 'darkGrey',
    fade: true,
  })
  isLoaded.value = true
}

function openProject() {
  router.push(`/${props.data.slug}`)
}

function getInView(): boolean {
  if (all.value) {
    const y = Math.max(0, current.value - props.top)
    const { left } = getBounding(el.value as HTMLElement)
    return left - y > size.value.x * -1 && left - y < vw.value && progress.value !== 1
  }
  return progress.value > 0.3 && leaveProgress.value !== 1
}

function getProgress(): number {
  let { top, left, bottom } = getBounding(el.value as HTMLElement)
  if (all.value) {
    const scroll = left + size.value.x
    return Math.min(Math.max(0, (current.value - props.top) / scroll), 1)
  }
  top -= vh.value
  bottom -= vh.value
  return Math.min(Math.max(0, (current.value - top) / (bottom - top)), 1)
}

function getLeaveProgress(): number {
  if (all.value) return 1
  let { top, bottom } = getBounding(el.value as HTMLElement)
  top -= vh.value
  bottom -= vh.value
  const leave = bottom + vh.value
  return Math.min(Math.max(0, (current.value - bottom) / (leave - bottom)), 1)
}

function onOpacityUpdate() {
  $scene.updateObject({ id: projectId.value, opacity: opacity.value })
}

let n = 0.15
function raf() {
  if (_target.position.y === 0) return
  _animated.position.x += (_target.position.x - _animated.position.x) * n
  _animated.position.y += (_target.position.y - _animated.position.y) * n
  _animated.size.x += (_target.size.x - _animated.size.x) * n
  _animated.size.y += (_target.size.y - _animated.size.y) * n
  _animated.rotate.x += (_target.rotate.x - _animated.rotate.x) * n
  _animated.rotate.y += (_target.rotate.y - _animated.rotate.y) * n
  _animated.border += (_target.border - _animated.border) * n
  _animated.zoom += (_target.zoom - _animated.zoom) * n
  if (
    Math.abs(_target.position.x - _animated.position.x) < 0.2 &&
    Math.abs(_target.position.y - _animated.position.y) < 0.2 &&
    Math.abs(_target.size.x - _animated.size.x) < 0.2 &&
    Math.abs(_target.size.y - _animated.size.y) < 0.2 &&
    Math.abs(_target.rotate.x - _animated.rotate.x) < 0.2 &&
    Math.abs(_target.rotate.y - _animated.rotate.y) < 0.2 &&
    Math.abs(_target.border - _animated.border) < 0.2 &&
    Math.abs(_target.zoom - _animated.zoom) < 0.2
  ) {
    _animated = { position: _position, size: _size, rotate: _rotate, border: _border, zoom: _zoom }
    inTransition.value = false
    killTicker(raf)
  }
  progress.value = getProgress()
  leaveProgress.value = getLeaveProgress()
  inView.value = getInView()
  $scene.updateObject({
    id: projectId.value,
    rotate: _animated.rotate,
    position: _animated.position,
    size: _animated.size,
    border: _animated.border,
    zoom: _animated.zoom,
  })
}

onBeforeUnmount(() => {
  killTicker(raf)
  videoEl.value?.pause()
  $scene.removeObject({ id: projectId.value })
})

const emit = defineEmits<{
  (e: 'update-active', value: number): void
}>()
</script>

<style lang="scss">
.home__projects__project {
  position: relative;
  min-height: var(--vh);
  display: flex;
  justify-content: center;
  align-items: center;

  &--all {
    min-height: auto;
    padding-right: var(--layout-gutter);
  }

  &--all-and-selected {
    .home__projects__project__anchor,
    .home__projects__project__vid,
    .home__projects__project__img {
      width: toColumns(3.5);
    }
  }

  &__anchor {
    display: block;
    pointer-events: none;
    width: toColumns(3);
    aspect-ratio: 5/7;
    border-radius: 1.6rem;
    // border: 1px solid red;
  }

  &__vid,
  &__img {
    // opacity: 0;
    pointer-events: none;
    @include absolute-center;
    width: toColumns(3);
  }

  &__client,
  &__collaborator {
    position: absolute;
    top: 50%;
    left: 50%;
    display: flex;
    align-items: center;
    column-gap: 0.8rem;

    opacity: 0.000001;
    will-change: opacity, transform;

    &__logo {
      width: 2.4rem;
      height: 2.4rem;
      border-radius: 50%;
      background-color: v-bind(projectColor);
    }

    &__name {
      text-shadow: 0 0 1.2rem rgba(0, 0, 0, 0.8);

      @include t-white;
      @include t-b2;
    }
  }

  &__collaborator {
    &__name {
      transform: translate(-100%, -100%);
    }
  }
}
</style>
