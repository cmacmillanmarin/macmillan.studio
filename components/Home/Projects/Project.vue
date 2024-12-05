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
      v-if="data.thumbnail.image && imageReady"
      ref="customImageEl"
      :data="data.thumbnail.image"
      class="home__projects__project__img"
      @load="onImageLoaded" />

    <ClientOnly>
      <Teleport to="#top-layer">
        <transition
          mode="out-in"
          :css="false"
          @before-enter="prepareClientIn"
          @enter="transitionShuffleIn"
          @leave="transitionDone">
          <div
            v-if="clientNameVisible"
            ref="logoEl"
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
          </div>
        </transition>
      </Teleport>
      <Teleport to="#top-layer">
        <transition
          mode="out-in"
          :css="false"
          @before-enter="prepareClientIn"
          @enter="transitionShuffleIn"
          @leave="transitionDone">
          <div
            v-if="clientNameVisible"
            ref="clientEl"
            :class="[
              'home__projects__project__client',
              `home__projects__project__client--${data.slug}`,
              { 'home__projects__project__client--all': inAllProjectsList },
            ]">
            <div
              class="home__projects__project__client__name"
              :style="{ color: projectThumbnailCopyColor }">
              {{ data.client.name }}
            </div>
          </div>
        </transition>
        <transition
          mode="out-in"
          :css="false"
          @before-enter="prepareCollaboratorIn"
          @enter="transitionShuffleIn"
          @leave="transitionDone">
          <div
            v-if="collaboratorNameVisible"
            ref="collaboratorEl"
            class="home__projects__project__collaborator"
            :class="[
              'home__projects__project__collaborator',
              { 'home__projects__project__collaborator--all': inAllProjectsList },
            ]">
            <div
              class="home__projects__project__collaborator__name"
              :style="{ color: projectThumbnailCopyColor }">
              {{ data.freelance ? 'w/ ' : 'at ' }}
              {{ data.collaborator.name }}
            </div>
          </div>
        </transition>
      </Teleport>
    </ClientOnly>

    <CustomLink
      :to="`/${data.slug}`"
      :id="targetify(`selected-${data.slug}-anchor`)"
      :aria-label="`Go to ${data.title} project`"
      :content="true"
      :tabindex="inAllProjectsList ? -1 : landingTabIndex"
      class="home__projects__project__anchor" />
  </div>
</template>

<script lang="ts" setup>
import { gsap } from 'gsap/gsap-core'
import { storeToRefs } from 'pinia'
import useStore from '~/store/useStore'
import useScrollStore from '~/store/useScrollStore'
import { slugify, hexToRgb, rbgToVec4, sleep } from '~/utils'
import { fadeIn, fadeOut } from '~/utils/animations'
import type { Plane, ClientAndCollaborator } from '~/types/front/project'
import type { FileVideo } from '~/types/wordpress'
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
  active: boolean
}>()

const { $scene }: any = useNuxtApp()

const route = useRoute()
const router = useRouter()

const store = useStore()
const { headerOverlay, section, isInProjectEntered, landingTabIndex } = storeToRefs(store)
const scrollStore = useScrollStore()
const { disableScroll, addRenderCallback, removeRenderCallback } = scrollStore
const { current } = storeToRefs(scrollStore)
const { getBounding } = useVirtualScrollAndThreeTools()

const { vw, vh } = useResize()
const { isMobileLayout } = useDevice()
const { toScale, getColumnWidth, layoutGutter } = useCss()

const inProject = ref<boolean>(false)
const inAllProjectsList = computed<boolean>(() => props.list === 'all')
const infoVisible = computed<boolean>(
  () =>
    !inTransition.value &&
    !inProject.value &&
    !isInProjectEntered.value &&
    ((inAllProjectsList.value && section.value === 'projects') ||
      (!inAllProjectsList.value && active.value))
)
const clientNameVisible = computed<boolean>(() => !!props.data.client.name && infoVisible.value)
const collaboratorNameVisible = computed<boolean>(
  () => !!props.data.collaborator.name && infoVisible.value
)

const projectId = ref<string>(slugify(props.data.title))
const projectColor = ref<string>(props.data.color)
const projectThumbnailCopyColor = ref<string>(props.data.tertiaryColor)
const projectVideo = computed<{ id: string; video?: FileVideo }>(() => {
  const src = `/assets/video/${props.data.slug}`
  return {
    id: slugify(src),
    video: props.data.thumbnail.video,
  }
})

const el = ref<HTMLElement>()
const logoEl = ref<HTMLElement>()
const clientEl = ref<HTMLElement>()
const collaboratorEl = ref<HTMLElement>()
const videoEl = ref<HTMLVideoElement>()
const customImageEl = ref<typeof CustomImage>()

const inView = ref<boolean>(false)
const isLoaded = ref<boolean>(false)
const inTransition = ref<boolean>(false)
const inTransitionReady = ref<boolean>(true)
const imageReady = ref<boolean>(true)
const opacity = ref<number>(1)
const progress = ref<number>(0)
const leaveProgress = ref<number>(0)

// For selected projects
const active = computed<boolean>(
  () =>
    ((inAllProjectsList.value && inView.value) ||
      (!inAllProjectsList.value && progress.value >= 0.55 && leaveProgress.value === 0)) &&
    !inProject.value &&
    isLoaded.value
)

const inActiveSection = computed<boolean>(
  () => section.value.includes('project') || section.value === 'reel'
)

const borderRadius = computed<number>(() => (isMobileLayout.value ? 8 : 16))

const size = computed<{ x: number; y: number }>(() => {
  let columns = isMobileLayout.value ? 5 : 3
  if (inAllProjectsList.value && props.data.selected) columns = isMobileLayout.value ? 6 : 3.5
  const width = getColumnWidth(columns)
  return { x: width, y: (width * 7) / 5 }
})

let _plane: Plane = {
  fixed: { from: 0, to: 0 },
  position: { x: 0, y: 0 },
  size: { x: 0, y: 0, z: 1 },
  rotate: { x: 0, y: 0, z: 0 },
  border: 0,
  zoom: 0,
  order: 0,
}

let _target: Plane = {
  fixed: { from: 0, to: 0 },
  position: { x: 0, y: 0 },
  size: { x: 0, y: 0, z: 1 },
  rotate: { x: 0, y: 0, z: 0 },
  border: 0,
  zoom: 0,
  order: 0,
}

watch(isInProjectEntered, () => {
  if (isInProjectEntered.value) inProject.value = true
  else inProject.value = !!route.params.slug
})

let playPromise: Promise<void> | undefined = undefined
watch([inView, inTransition, videoEl], () => {
  if (inTransition.value) return
  if (videoEl.value) {
    if (inView.value) {
      playPromise = videoEl.value.play()
      // console.log(`Play video - ${projectId.value}`)
    } else {
      if (playPromise) {
        playPromise.then(() => {
          videoEl.value?.pause()
          // console.log(`Pause video - ${projectId.value}`)
        })
      }
    }
  }
})

watch([() => props.active, inProject, headerOverlay], () => {
  const hidden = inProject.value || headerOverlay.value
  const clickable = props.active && !hidden
  $scene.updateObject({
    id: projectId.value,
    onClick: clickable ? openProject : null,
  })
  gsap.killTweensOf(opacity)
  if (hidden) {
    opacity.value = 0
    onOpacityUpdate()
  } else {
    gsap.to(opacity, { value: 1, onUpdate: onOpacityUpdate })
  }
})

watch(section, () => {
  if (inAllProjectsList.value) {
    if (inActiveSection.value && opacity.value === 0) {
      gsap.killTweensOf(opacity)
      gsap.to(opacity, { value: 1, duration: 1.2, onUpdate: onOpacityUpdate })
    } else if (!inActiveSection.value && opacity.value === 1) {
      gsap.killTweensOf(opacity)
      gsap.to(opacity, { value: 0, duration: 0.6, onUpdate: onOpacityUpdate })
    }
  } else if (opacity.value !== 1) {
    opacity.value = 1
    $scene.updateObject({ id: projectId.value, opacity: 1 })
  }
  inView.value = getInView()
})

watch(active, async () => {
  await nextTick()

  if (logoEl.value) {
    active.value
      ? fadeIn({ el: logoEl.value, duration: 0.4 })
      : fadeOut({ el: logoEl.value, duration: 0.1 })
  }

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
  logoEl.value && fadeOut({ el: logoEl.value, duration: 0.1 })
  clientEl.value && fadeOut({ el: clientEl.value, duration: 0.1 })
  collaboratorEl.value && fadeOut({ el: collaboratorEl.value, duration: 0.1 })
})

watch([inTransitionReady, active], async () => {
  const { type } = props.data.thumbnail
  if (type === 'vid' && inTransitionReady.value && active.value && !videoEl.value) {
    emit('request-video', projectVideo.value)
    await nextTick()
    const video = document.getElementById(projectVideo.value.id) as HTMLVideoElement | undefined
    if (video) {
      videoEl.value = video
      $scene.updateObject({ id: projectId.value, video: videoEl.value })
    }
  }
  if (!imageReady.value) imageReady.value = inTransitionReady.value && active.value
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

onBeforeMount(() => {
  if (inAllProjectsList.value) {
    inTransition.value = true
    inTransitionReady.value = false
    imageReady.value = false
  }
})

onMounted(async () => {
  const { type } = props.data.thumbnail
  if (type === 'vid' && !inTransition.value) {
    emit('request-video', projectVideo.value)
  }
  await nextTick()
  const video = document.getElementById(projectVideo.value.id) as HTMLVideoElement | undefined
  if (video) videoEl.value = video

  progress.value = getProgress()
  leaveProgress.value = getLeaveProgress()
  inView.value = getInView()

  createPlane()

  if (inAllProjectsList.value) {
    _plane.position.x = vw.value * 0.5
    _plane.position.y = props.top + vh.value * 0.5
  }

  addRenderCallback(updateDom)
})

function updateDom() {
  const { client, collaborator } = getClientAndCollaborator()
  logoEl.value && gsap.set(logoEl.value, { x: client.x, y: client.y })
  clientEl.value && gsap.set(clientEl.value, { x: client.x, y: client.y })
  collaboratorEl.value && gsap.set(collaboratorEl.value, { x: collaborator.x, y: collaborator.y })
}

function onImageLoaded() {
  $scene.updateObject({ id: projectId.value, img: customImageEl.value?.el })
  // customImageEl.value?.el && $scene.preload(customImageEl.value.el)
}

async function createPlane() {
  const hidden = inProject.value || headerOverlay.value
  const clickable = props.active && !hidden
  $scene.addObject({
    id: projectId.value,
    video: videoEl.value,
    onClick: clickable ? openProject : null,
    cursor: 'plus',
    color: rbgToVec4(hexToRgb(props.data.color)),
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
  let { bottom } = getBounding(el.value as HTMLElement)
  bottom -= vh.value - 1
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
    border: toScale(borderRadius.value),
    order: props.of - props.i,
    zoom: 1,
    forcePixel: false,
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
    order: props.of - props.i,
    border: toScale(borderRadius.value) * (progress.value + leaveProgress.value),
    zoom: 1.4 - 0.4 * progress.value,
    forcePixel: isMobileLayout.value && leaveProgress.value !== 0,
  }
}

function getClientAndCollaborator(params?: { to?: Plane }): ClientAndCollaborator {
  const margin = toScale(isMobileLayout.value ? 8 : 12)

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
      inView.value && $scene.updateObject({ id: projectId.value, ..._plane, forcePixel: false })
    },
    onComplete: () => {
      inTransition.value = false
      setTransitionReady()
      disableScroll(false)
    },
  })
}

async function setTransitionReady() {
  await sleep(400)
  inTransitionReady.value = true
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
  if (playPromise) {
    playPromise.then(() => {
      videoEl.value?.pause()
      // console.log(`Pause video - ${projectId.value}`)
    })
  }
  removeRenderCallback(updateDom)
  $scene.removeObject({ id: projectId.value })
})

const emit = defineEmits<{
  (e: 'update-active', value: number): void
  (e: 'request-video', value: { id: string; video?: FileVideo }): void
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
      width: toColumns(6);
      @include from__tablet--landscape {
        width: toColumns(3.5);
      }
    }
  }

  &__anchor {
    display: block;
    pointer-events: none;
    width: toColumns(5);
    aspect-ratio: 5/7;
    border-radius: 0.8rem;
    @include from__tablet--landscape {
      border-radius: 1.6rem;
      width: toColumns(3);
    }
  }

  &__vid,
  &__img {
    opacity: 0;
    pointer-events: none;
    width: toColumns(5);
    @include absolute-center;
    @include from__tablet--landscape {
      border-radius: 1.6rem;
      width: toColumns(3);
    }
  }

  &__client,
  &__collaborator {
    position: absolute;
    top: 50%;
    left: 50%;

    column-gap: toScale(0.6rem, 37.5rem);
    opacity: 0.000001;
    will-change: opacity, transform;

    @include from__tablet--landscape {
      column-gap: toScale(0.8rem);
    }

    &--all {
      top: 0;
      left: 0;
    }

    &__logo {
      width: toScale(2.4rem, 37.5rem);
      height: toScale(2.4rem, 37.5rem);
      border-radius: 50%;
      @include from__tablet--landscape {
        width: toScale(2.4rem);
        height: toScale(2.4rem);
      }
      img {
        will-change: transform;
      }
    }

    &__name {
      color: var(--dark-grey);
      @include t-b2;
    }
  }

  &__client__name {
    transform: translate(toScale(3rem, 37.5rem), toScale(0.3rem, 37.5rem));
    @include from__tablet--landscape {
      transform: translate(toScale(3rem), toScale(0.3rem));
    }
  }

  &__collaborator {
    &__name {
      transform: translate(-100%, -100%);
    }
  }
}
</style>
