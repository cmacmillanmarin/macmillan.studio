<template>
  <div ref="el" class="home__projects__project" data-scroll-set-position>
    <video
      v-if="data.thumbnail.type === 'vid' && data.thumbnail.video.src"
      ref="videoEl"
      :alt="data.thumbnail.video.alt"
      :width="data.thumbnail.video.width"
      :height="data.thumbnail.video.height"
      muted
      loop
      crossorigin="anonymous"
      class="home__projects__project__vid">
      <source :src="data.thumbnail.video.src" :type="data.thumbnail.video.mime" />
    </video>
    <CustomImage
      v-else-if="data.thumbnail.image.src"
      ref="customImageEl"
      :data="data.thumbnail.image"
      class="home__projects__project__img" />

    <ClientOnly>
      <Teleport to="#top-layer">
        <div v-if="data.client.name" ref="clientEl" class="home__projects__project__client">
          <div class="home__projects__project__client__logo"></div>
          <div class="home__projects__project__client__name">{{ data.client.name }}</div>
        </div>
        <div
          v-if="data.collaborator.name"
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
const { getColumnWidth } = useCss()
const { vw, vh, lvw } = useResize()

const store = useStore()
const { updateCursor } = store
const { isInProject, isInProjectEntered } = storeToRefs(store)
const { current, direction } = storeToRefs(useScrollStore())
const { getBounding } = useVirtualScrollAndThreeTools()

const projectId = computed<string>(() => `project-${slugify(props.data.title)}`)
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
  const width = getColumnWidth(3)
  return { x: width, y: (width * 7) / 5 }
})

watch(active, () => {
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

watch(current, () => {
  let { top, bottom } = getBounding(el.value as HTMLElement)
  top -= vh.value
  bottom -= vh.value
  const leaveBottom = bottom + vh.value
  progress.value = Math.min(Math.max(0, (current.value - top) / (bottom - top)), 1)
  leaveProgress.value = Math.min(Math.max(0, (current.value - bottom) / (leaveBottom - bottom)), 1)
})

watch([() => props.top, () => props.bottom, progress, leaveProgress, isInProjectEntered], () => {
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

  const opacity = leaveProgress.value < 1 ? 1 : 0

  const htmlx = size.value.x * progress.value * 0.5
  const htmly = size.value.y * progress.value * 0.5
  const htmlextra = props.i === 0 ? vh.value - vh.value * progress.value : 0

  clientEl.value && gsap.set(clientEl.value, { x: -htmlx + 12, y: -htmly + 12 + htmlextra })

  collaboratorEl.value &&
    gsap.set(collaboratorEl.value, { x: htmlx - 14, y: htmly - 12 + htmlextra })

  $scene.updateObject({
    id: projectId.value,
    opacity,
    rotate: { x: rotateRadX, y: rotateRadY, z: 0 },
    position: { x: isInProjectEntered.value ? -10000 : positionX, y: positionY },
    size: { x: sizeX, y: sizeY, z: 1 },
    fixed: { from: props.top, to: props.bottom },
    border: 16 * progress.value,
  })
})

watch(intersect, () => {
  updateCursor(intersect.value ? 'plus' : 'default')
})

onMounted(() => {
  !isInProjectEntered.value && videoEl.value?.play()
  $scene.addObject({
    id: projectId.value,
    type: 'plane',
    video: videoEl.value,
    img: customImageEl.value?.el,
    size: { x: 1, y: 1, z: 1 },
    position: { x: 0, y: 0 },
    fixed: { from: props.top, to: props.bottom },
    border: 16,
    onClick: openProject,
    onIntersect: onProjectIntersect,
  })
})

function openProject() {
  intersect.value = false
  router.push(`/${props.data.slug}`)
}

function onProjectIntersect(state: boolean) {
  intersect.value = !isInProject.value && state
}

onBeforeUnmount(() => {
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

  &__vid,
  &__img {
    opacity: 0;
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

  &__anchor {
    pointer-events: none;
    width: calc(var(--layout-column-width) * 3 + var(--layout-gutter) * 2);
    aspect-ratio: 5/7;
    border-radius: 1.6rem;
  }
}
</style>
