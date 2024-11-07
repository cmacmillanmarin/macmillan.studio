<template>
  <div ref="el" :class="['project', { 'project--entered': !transition }]" @click="onClick">
    <ClientOnly>
      <Teleport to="#top-layer">
        <transition @leave="transitionFadeOut">
          <PixelTransition v-if="transition" :color="data.color" @done="enter" />
        </transition>
      </Teleport>
      <GridRuleOfThirds v-if="gridType === 'rule-of-thirds'" />
    </ClientOnly>

    <div ref="contentEl" class="project__content">
      <ProjectLanding :data="data" :ready="ready" :animation="svgAnimation" />
      <ProjectAsset
        v-for="asset in data.assets"
        :data="asset"
        :ready="isInProjectEntered"
        :bg-color="data.secondaryColor"
        @update-scroll="updateScroll" />
      <div v-if="data.assets.length === 0" class="project__content__gap" />
      <ProjectRecognitions v-if="data.recognitions.length" :data="data.recognitions" />
      <ProjectNext
        v-if="nextProject"
        :data="nextProject"
        @mouseenter="onMouseEnter"
        @mouseleave="onMouseLeave" />
      <ClientOnly>
        <div v-if="toNextProject" class="project__content__gap--next" />
      </ClientOnly>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { gsap } from 'gsap'
import { type Project } from '~/types/wordpress/project'
import useStore from '~/store/useStore'
import useScrollStore from '~/store/useScrollStore'
import { transitionFadeOut } from '~/utils/animations'
import { storeToRefs } from 'pinia'

const props = defineProps<{
  data: Project
  list: 'selected' | 'all'
  nextProject?: Project
}>()

const route = useRoute()
const router = useRouter()
const { addTicker, killTicker } = useRaf()
const { onResize } = useResize()

const store = useStore()
const { updateHeader, updateCursor, updateSection, updateInProjectScroll } = store
const { isInProject, isInProjectEntered, cursor, gridType } = storeToRefs(store)

const { disableScroll, updateScrollFixedTargetId } = useScrollStore()

const el = ref<HTMLElement>()
const contentEl = ref<HTMLElement>()

const transition = ref<boolean>(!isInProject.value)
const svgAnimation = ref<boolean>(transition.value)
const ready = ref<boolean>(!transition.value)

const toNextProject = ref<boolean>(false)
const backgroundColor = ref<string>(props.data.color || '')
const nextProjectBackgroundColor = ref<string>(props.nextProject?.color || '')

let _scroll: any = {
  el: null,
  current: 0,
  target: 0,
  bounding: 0,
}

watch(onResize, updateScroll)

onBeforeMount(() => {
  updateCursor('default')
  updateSection('projects')
})

onMounted(() => {
  disableScroll(true)
  emit('mounted')
  !transition.value && enter()
})

function enter() {
  if (!el.value) return
  emit('entered')
  gsap.set(el.value, {
    opacity: 1,
    onComplete: () => {
      ready.value = true
      updateCursor('close')
      transition.value = false
      createScroll()
    },
  })
}

function _onWheel(e: WheelEvent) {
  e.preventDefault()
  const { deltaY } = e
  const y = deltaY
  _scroll.target = _clampTarget(_scroll.target + y)
  updateInProjectScroll(false)
}

function _clampTarget(value: number): number {
  return Math.max(Math.min(_scroll.bounding, value), 0)
}

function _onRaf() {
  _scroll.current += (_scroll.target - _scroll.current) * 0.1
  contentEl.value && gsap.set(contentEl.value, { x: _scroll.current * -1 })
  if (toNextProject.value && Math.abs(_scroll.target - _scroll.current) < 0.5) {
    emit('next')
    killTicker(_onRaf)
    _scroll.current = _scroll.target
    router.push(`/${props.nextProject?.slug}`)
  }
}

function createScroll() {
  const disablePassive = { passive: false }
  contentEl.value?.addEventListener('wheel', _onWheel, disablePassive)
  updateScroll()
  addTicker(_onRaf)
}

function updateScroll() {
  _scroll.bounding = (contentEl.value?.clientWidth || 0) - (el.value?.clientWidth || 0)
  _scroll.target = _clampTarget(_scroll.target)
}

function killScroll() {
  contentEl.value?.removeEventListener('wheel', _onWheel)
}

function onMouseEnter() {
  updateCursor('arrow-right')
}

function onMouseLeave() {
  updateCursor('close')
}

function onClick() {
  cursor.value === 'close' && closeProject()
  cursor.value === 'arrow-right' && props.nextProject && goToNextProject()
}

async function goToNextProject() {
  killScroll()
  toNextProject.value = true
  await nextTick()
  updateScroll()
  updateCursor('default')
  _scroll.target = _scroll.bounding
}

function closeProject() {
  if (transition.value) return
  router.push('/')
}

onBeforeUnmount(() => {
  if (!route.params.slug) {
    emit('closed')
    updateCursor('default')
    const toProjects = props.list === 'selected' && !props.data.selected
    const target = toProjects ? 'projects' : `${props.list}-${props.data.slug}-anchor`
    updateScrollFixedTargetId(target)
    disableScroll(false)
    updateHeader(true)
  }
  killTicker(_onRaf)
  killScroll()
})

const emit = defineEmits(['mounted', 'entered', 'next', 'closed'])
</script>

<style lang="scss">
.project {
  @include will-fade;
  background-color: v-bind(backgroundColor);

  &--entered {
    cursor: pointer;
  }

  &__content {
    will-change: transform;
    display: inline-block;
    white-space: nowrap;

    .project__landing {
      z-index: 2;
    }

    > div {
      white-space: normal;
      display: inline-block;
      vertical-align: top;
      width: max-content;
      height: var(--vh);
    }

    &__gap {
      width: 25vw !important;
      &--next {
        @extend .project__content__gap;
        background-color: v-bind(nextProjectBackgroundColor);
        @include from__desktop--x-large {
          width: calc(25vw - ((100vw - var(--layout-max-width)) * 0.5)) !important;
        }
      }
    }
  }
}
</style>
