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
import type { Project } from '~/types/wordpress/project'
import { slugify } from '~/utils'
import { fadeIn, fadeOut } from '~/utils/animations'
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

const router = useRouter()

const { $scene }: any = useNuxtApp()
const { toScale, getColumnWidth } = useCss()
const { vw, vh } = useResize()

const store = useStore()
const { updateCursor } = store
const { section, isInProject, isInProjectEntered } = storeToRefs(store)
const { current, direction } = storeToRefs(useScrollStore())
const { getBounding } = useVirtualScrollAndThreeTools()

const all = computed<boolean>(() => props.list === 'all')

const projectId = ref<string>(`${props.list}-${slugify(props.data.title)}`)
const projectColor = ref<string>(props.data.color)

const el = ref<HTMLElement>()

const clientEl = ref<HTMLElement>()
const collaboratorEl = ref<HTMLElement>()
const videoEl = ref<HTMLVideoElement>()
const customImageEl = ref<typeof CustomImage>()

const progress = ref<number>(0)
const leaveProgress = ref<number>(0)
const intersect = ref<boolean>(false)
const active = computed<boolean>(
  () => leaveProgress.value === 0 && progress.value > 0.55 && !isInProject.value
)

const size = computed<{ x: number; y: number }>(() => {
  const width = getColumnWidth(all.value && props.data.selected ? 4 : 3)
  return { x: width, y: (width * 7) / 5 }
})

const inView = ref<boolean>(false)

const inTarget = computed<boolean>(
  () =>
    (!all.value && progress.value > 0.3 && leaveProgress.value !== 1) ||
    (all.value && progress.value !== 0 && progress.value !== 1)
)

const loaded = ref<boolean>(false)

watch(inView, () => {
  if (videoEl.value) {
    inView.value ? videoEl.value.play() : videoEl.value.pause()
  }
})

watch(section, () => {
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

watch([el, current], () => {
  let { top, left, bottom } = getBounding(el.value as HTMLElement)
  if (all.value) {
    const scroll = left + size.value.x
    progress.value = Math.min(Math.max(0, (current.value - props.top) / scroll), 1)
    leaveProgress.value = 1
  } else {
    top -= vh.value
    bottom -= vh.value
    const leave = bottom + vh.value
    progress.value = Math.min(Math.max(0, (current.value - top) / (bottom - top)), 1)
    leaveProgress.value = Math.min(Math.max(0, (current.value - bottom) / (leave - bottom)), 1)
  }
})

watch([() => props.top, () => props.bottom, progress, leaveProgress, loaded], () => {
  const htmlx = size.value.x * progress.value * 0.5
  const htmly = size.value.y * progress.value * 0.5
  const htmlextra = props.i === 0 ? vh.value - vh.value * progress.value : 0
  const htmlmargin = toScale(12)

  clientEl.value &&
    gsap.set(clientEl.value, { x: -htmlx + htmlmargin, y: -htmly + htmlmargin + htmlextra })

  collaboratorEl.value &&
    gsap.set(collaboratorEl.value, { x: htmlx - htmlmargin, y: htmly - htmlmargin + htmlextra })

  if (!loaded.value) return

  const _position = { x: 0, y: 0 }
  const _size = { x: 0, y: 0, z: 1 }
  const _rotate = { x: 0, y: 0, z: 0 }
  let _border = toScale(16)
  let _zoom = 1

  if (all.value) {
    const y = Math.max(0, current.value - props.top)
    const { top, left } = getBounding(el.value as HTMLElement)
    inView.value = left - y > size.value.x * -1 && progress.value !== 1
    _position.x = left - y
    _position.y = top
    _size.x = size.value.x
    _size.y = size.value.y
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
    inView.value = progress.value > 0.3 && leaveProgress.value !== 1
    _position.x = positionX
    _position.y = positionY
    _size.x = sizeX
    _size.y = sizeY
    _rotate.x = rotateRadX
    _rotate.y = rotateRadY
    _border = _border * (progress.value + leaveProgress.value)
    _zoom = 1.4 - 0.4 * progress.value
  }

  $scene.updateObject({
    id: projectId.value,
    rotate: _rotate,
    position: _position,
    size: _size,
    border: _border,
    zoom: _zoom,
    fixed: { from: props.top, to: props.bottom },
  })
})

watch(intersect, () => {
  updateCursor(intersect.value ? 'plus' : 'default')
})

watch(section, () => {
  if (section.value !== 'projects') intersect.value = false
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
})

function onVideoLoaded() {
  $scene.addObject({
    id: projectId.value,
    type: 'plane',
    video: videoEl.value,
    onClick: openProject,
    onIntersect: onProjectIntersect,
    multiplyColor: 'darkGrey',
  })
  loaded.value = true
}

function onImageLoaded() {
  $scene.addObject({
    id: projectId.value,
    type: 'plane',
    img: customImageEl.value?.el,
    onClick: openProject,
    onIntersect: onProjectIntersect,
    multiplyColor: 'darkGrey',
    fade: true,
  })
  loaded.value = true
}

function openProject() {
  intersect.value = false
  router.push(`/${props.data.slug}`)
}

function onProjectIntersect(state: boolean) {
  intersect.value = section.value.includes('project') && !isInProject.value && state
}

onBeforeUnmount(() => {
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
      width: toColumns(4);
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
