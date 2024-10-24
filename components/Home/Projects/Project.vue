<template>
  <div
    ref="el"
    :class="[
      'home__projects__project',
      { 'home__projects__project--all': inAllProjectsList },
      { 'home__projects__project--all-and-selected': inAllProjectsList && data.selected },
    ]"
    data-scroll-set-position>
    <CustomImage
      v-if="data.thumbnail.image.src"
      ref="customImageEl"
      :data="data.thumbnail.image"
      class="home__projects__project__img" />

    <ClientOnly>
      <Teleport to="#top-layer">
        <transition
          mode="out-in"
          :css="false"
          @before-enter="prepareClientIn"
          @enter="transitionShuffleIn"
          @leave="transitionDone">
          <div
            v-if="data.client.name && !inTransition"
            ref="clientEl"
            :class="[
              'home__projects__project__client',
              `home__projects__project__client--${data.slug}`,
              { 'home__projects__project__client--all': inAllProjectsList },
            ]">
            <div
              class="home__projects__project__client__logo"
              :style="{ backgroundColor: projectColor }">
              <img
                v-if="data.client.logo"
                :src="data.client.logo"
                :alt="`${data.client.name} logo`"
                width="640"
                height="640" />
            </div>
            <div class="home__projects__project__client__name">{{ data.client.name }}</div>
          </div>
        </transition>
        <transition
          mode="out-in"
          :css="false"
          @before-enter="prepareCollaboratorIn"
          @enter="transitionShuffleIn"
          @leave="transitionDone">
          <div
            v-if="data.collaborator.name && !inTransition"
            ref="collaboratorEl"
            class="home__projects__project__collaborator"
            :class="[
              'home__projects__project__collaborator',
              { 'home__projects__project__collaborator--all': inAllProjectsList },
            ]">
            <div class="home__projects__project__collaborator__name">
              {{ data.freelance ? 'w/ ' : 'at ' }}
              {{ data.collaborator.name }}
            </div>
          </div>
        </transition>
      </Teleport>
    </ClientOnly>

    <CustomLink
      :to="`/${data.slug}`"
      class="home__projects__project__anchor"
      :content="true"
      :tabindex="inAllProjectsList ? -1 : undefined" />
  </div>
</template>

<script lang="ts" setup>
import { gsap } from 'gsap'
import { storeToRefs } from 'pinia'
import useStore from '~/store/useStore'
import useScrollStore from '~/store/useScrollStore'
import { slugify, hexToRgb, rbgToVec4 } from '~/utils'
import { fadeIn, fadeOut } from '~/utils/animations'
import type { Plane, ClientAndCollaborator } from '~/types/front/project'
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
const scrollStore = useScrollStore()
const { disableScroll, addRenderCallback, removeRenderCallback } = scrollStore
const { current, direction } = storeToRefs(scrollStore)
const { getBounding } = useVirtualScrollAndThreeTools()

const { toScale, getColumnWidth, layoutGutter } = useCss()
const { vw, vh } = useResize()

const inAllProjectsList = computed<boolean>(() => props.list === 'all')

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
  () =>
    ((inAllProjectsList.value && inView.value) ||
      (!inAllProjectsList.value && progress.value > 0.55 && leaveProgress.value === 0)) &&
    !isInProject.value &&
    isLoaded.value
)

const inActiveSection = computed<boolean>(
  () => section.value.includes('project') || section.value === 'reel'
)

const size = computed<{ x: number; y: number }>(() => {
  const width = getColumnWidth(inAllProjectsList.value && props.data.selected ? 3.5 : 3)
  return { x: width, y: (width * 7) / 5 }
})

let _plane: Plane = {
  fixed: { from: 0, to: 0 },
  position: { x: 0, y: 0 },
  size: { x: 0, y: 0, z: 1 },
  rotate: { x: 0, y: 0, z: 0 },
  border: 0,
  zoom: 0,
}

let _target: Plane = {
  fixed: { from: 0, to: 0 },
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

watch([isInProject, isInProjectEntered], () => {
  $scene.updateObject({ id: projectId.value, onClick: isInProject.value ? null : openProject })
  if (isInProjectEntered.value) {
    opacity.value = 0
    onOpacityUpdate()
  } else if (!isInProject.value) {
    gsap.killTweensOf(opacity)
    gsap.to(opacity, { value: 1, duration: 1, onUpdate: onOpacityUpdate })
  }
})

watch(section, () => {
  if (inAllProjectsList.value) {
    gsap.killTweensOf(opacity)
    if (inActiveSection.value) {
      gsap.to(opacity, { value: 1, duration: 1, delay: 0.2, onUpdate: onOpacityUpdate })
    } else {
      gsap.to(opacity, { value: 0, duration: 0.6, onUpdate: onOpacityUpdate })
    }
  } else $scene.updateObject({ id: projectId.value, opacity: 1 })
  inView.value = getInView()
})

watch(active, async () => {
  await nextTick()

  if (clientEl.value) {
    active.value
      ? fadeIn({ el: clientEl.value, duration: 0.4 })
      : fadeOut({ el: clientEl.value, duration: 0.1 })
  }

  if (collaboratorEl.value) {
    active.value
      ? fadeIn({ el: collaboratorEl.value, duration: 0.4 })
      : fadeOut({ el: collaboratorEl.value, duration: 0.1 })
  }

  active.value && !inAllProjectsList.value && emit('update-active', props.i)
})

watch(inTransition, async () => {
  if (active.value) return
  await nextTick()
  clientEl.value && fadeOut({ el: clientEl.value, duration: 0.1 })
  collaboratorEl.value && fadeOut({ el: collaboratorEl.value, duration: 0.1 })
})

watch(inAllProjectsList, () => {
  inTransition.value = true
})

watch(current, () => {
  progress.value = getProgress()
  leaveProgress.value = getLeaveProgress()
  inView.value = getInView()
  inAllProjectsList.value && getActiveInAllProjectsList() && emit('update-active', props.i)
})

watch(
  [() => props.top, () => props.bottom, progress, leaveProgress, isLoaded, inAllProjectsList],
  () => {
    if (!isLoaded.value || inTransition.value) return

    _plane = inAllProjectsList.value
      ? getInAllProjectsListPlane()
      : getInSelectedProjectsListPlane()

    $scene.updateObject({ id: projectId.value, ..._plane })
  }
)

onMounted(async () => {
  await nextTick()
  progress.value = getProgress()
  leaveProgress.value = getLeaveProgress()
  inView.value = getInView()
  const id = slugify(props.data.thumbnail.video.src)
  if (!!id) {
    const video = document.getElementById(slugify(id)) as HTMLVideoElement | undefined
    if (video) {
      videoEl.value = video
      onVideoLoaded()
      // if (videoEl.value.readyState > 2) onVideoLoaded()
      // else videoEl.value.addEventListener('canplay', onVideoLoaded)
    } else {
      onImageLoaded()
    }
  }
  if (inAllProjectsList.value) {
    inTransition.value = true
    _plane.position.x = vw.value * 0.5
    _plane.position.y = props.top + vh.value * 0.5
  }
  addRenderCallback(updateDom)
})

function updateDom() {
  const { client, collaborator } = getClientAndCollaborator()
  clientEl.value && gsap.set(clientEl.value, { x: client.x, y: client.y })
  collaboratorEl.value && gsap.set(collaboratorEl.value, { x: collaborator.x, y: collaborator.y })
}

function onVideoLoaded() {
  const colorRgb = hexToRgb(props.data.color)
  const secondaryColorRgb = hexToRgb(props.data.secondaryColor)
  $scene.addObject({
    id: projectId.value,
    type: 'plane',
    video: videoEl.value,
    onClick: openProject,
    color: rbgToVec4(colorRgb),
    // multiplyColor: rbgToVec4(colorRgb),
  })
  isLoaded.value = true
}

function onImageLoaded() {
  const colorRgb = hexToRgb(props.data.color)
  const secondaryColorRgb = hexToRgb(props.data.secondaryColor)
  $scene.addObject({
    id: projectId.value,
    type: 'plane',
    img: customImageEl.value?.el,
    onClick: openProject,
    color: rbgToVec4(colorRgb),
    // multiplyColor: rbgToVec4(colorRgb),
  })
  isLoaded.value = true
}

function openProject() {
  emit('update-active', props.i)
  router.push(`/${props.data.slug}`)
}

function getInView(): boolean {
  if (inAllProjectsList.value) {
    const y = Math.max(0, current.value - props.top)
    const { left } = getBounding(el.value as HTMLElement)
    return (
      left - y > size.value.x * -1 &&
      left - y < vw.value &&
      progress.value !== 1 &&
      inActiveSection.value
    )
  }
  return (
    (progress.value > 0.3 || (props.i === 0 && progress.value > 0)) &&
    leaveProgress.value !== 1 &&
    inActiveSection.value
  )
}

function getProgress(): number {
  let { top, left, bottom } = getBounding(el.value as HTMLElement)
  if (inAllProjectsList.value) {
    const scroll = left + size.value.x
    return Math.min((current.value - props.top) / scroll, 1)
  }
  top -= vh.value
  bottom -= vh.value
  return Math.min(Math.max(0, (current.value - top) / (bottom - top)), 1)
}

function getLeaveProgress(): number {
  if (inAllProjectsList.value) return 1
  let { top, bottom } = getBounding(el.value as HTMLElement)
  top -= vh.value
  bottom -= vh.value
  const leave = bottom + vh.value
  return Math.min(Math.max(0, (current.value - bottom) / (leave - bottom)), 1)
}

function getInAllProjectsListPlane(): Plane {
  const y = Math.max(0, current.value - props.top)
  const { top, left } = getBounding(el.value as HTMLElement)

  let extra = 0
  if (progress.value < 0) {
    extra = Math.abs(current.value - props.top)
  }
  return {
    fixed: { from: props.top, to: props.bottom },
    position: { x: left - y + extra, y: top },
    size: { x: size.value.x, y: size.value.y, z: 1 },
    rotate: { x: 0, y: 0, z: 0 },
    border: toScale(16),
    zoom: 1.4 - 0.4 * progress.value,
  }
}

function getInSelectedProjectsListPlane(): Plane {
  const sizeX = size.value.x * (progress.value + leaveProgress.value)
  const sizeY = size.value.y * (progress.value + leaveProgress.value)

  const leaveX = sizeX * props.sideX * leaveProgress.value
  const leaveY = sizeY * props.sideY * leaveProgress.value

  const positionX = vw.value * 0.5 - sizeX * 0.5 + leaveX
  const positionY = props.top + vh.value * 0.5 - sizeY * 0.5 + leaveY

  return {
    fixed: { from: props.top, to: props.bottom },
    position: { x: positionX, y: positionY },
    size: { x: sizeX, y: sizeY, z: 1 },
    rotate: {
      x: 33 * props.sideY * leaveProgress.value * (Math.PI / 180),
      y: 33 * props.sideX * leaveProgress.value * (Math.PI / 180),
      z: 0,
    },
    border: toScale(16) * (progress.value + leaveProgress.value),
    zoom: 1.4 - 0.4 * progress.value,
  }
}

function getClientAndCollaborator(params?: { to?: Plane }): ClientAndCollaborator {
  const margin = toScale(12)

  if (inAllProjectsList.value) {
    const source: Plane = params?.to || _plane
    let extra = 0
    if (current.value < props.top) {
      extra = Math.abs(current.value - props.top)
    } else if (current.value > props.bottom) {
      extra = Math.abs(current.value - props.bottom) * -1
    }
    return {
      client: { x: source.position.x + margin, y: source.position.y - props.top + margin + extra },
      collaborator: {
        x: source.position.x + source.size.x - margin,
        y: source.position.y - props.top + source.size.y - margin + extra,
      },
    }
  }

  const position = {
    x: size.value.x * progress.value * 0.5,
    y: size.value.y * progress.value * 0.5,
  }
  const extra = props.i === 0 ? vh.value - vh.value * progress.value : 0
  return {
    client: {
      x: -position.x + margin,
      y: -position.y + margin + extra,
    },
    collaborator: {
      x: position.x - margin,
      y: position.y - margin + extra,
    },
  }
}

function getActiveInAllProjectsList() {
  const { left } = getBounding(el.value as HTMLElement)

  const scrollPoint = current.value - props.top + vw.value * 0.5 - getColumnWidth(3.5) * 0.5
  return scrollPoint > left - layoutGutter.value && scrollPoint < left + size.value.x
}

function onOpacityUpdate() {
  $scene.updateObject({ id: projectId.value, opacity: opacity.value })
}

function transition() {
  progress.value = getProgress()
  leaveProgress.value = getLeaveProgress()
  inView.value = getInView()

  _target = inAllProjectsList.value ? getInAllProjectsListPlane() : getInSelectedProjectsListPlane()
  animate()
}

function animate() {
  disableScroll(true)
  gsap.killTweensOf([_plane.position, _plane.rotate, _plane.size, _plane])
  gsap.to(_plane.position, { x: _target.position.x, y: _target.position.y })
  gsap.to(_plane.rotate, { x: _target.rotate.x, y: _target.rotate.y })
  gsap.to(_plane.size, { x: _target.size.x, y: _target.size.y })
  gsap.to(_plane, {
    border: _target.border,
    zoom: _target.zoom,
    onUpdate: () => {
      progress.value = getProgress()
      leaveProgress.value = getLeaveProgress()
      inView.value = getInView()
      inView.value && $scene.updateObject({ id: projectId.value, ..._plane })
    },
    onComplete: () => {
      inTransition.value = false
      disableScroll(false)
    },
  })
}

function prepareClientIn(el: Element) {
  const { client } = getClientAndCollaborator({ to: _target })
  gsap.set(el, { x: client.x, y: client.y })
}

function prepareCollaboratorIn(el: Element) {
  const { collaborator } = getClientAndCollaborator({ to: _target })
  gsap.set(el, { x: collaborator.x, y: collaborator.y })
}

onBeforeUnmount(() => {
  console.log(`Pause video - ${projectId.value}`)
  videoEl.value?.pause()
  removeRenderCallback(updateDom)
  $scene.removeObject({ id: projectId.value })
})

const emit = defineEmits<{
  (e: 'update-active', value: number): void
}>()

defineExpose({
  transition,
})
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
  }

  &__vid,
  &__img {
    opacity: 0;
    pointer-events: none;
    width: toColumns(3);
    @include absolute-center;
  }

  &__client,
  &__collaborator {
    position: absolute;
    top: 50%;
    left: 50%;
    display: flex;
    align-items: center;
    column-gap: toScale(0.8rem);

    opacity: 0.000001;
    will-change: opacity, transform;

    &--all {
      top: 0;
      left: 0;
    }

    &__logo {
      width: toScale(2.4rem);
      height: toScale(2.4rem);
      border-radius: 50%;
      img {
        will-change: transform;
      }
    }

    &__name {
      text-shadow: 0 0 toScale(1.2rem) rgba(0, 0, 0, 0.8);

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
