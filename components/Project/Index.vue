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

    <ClientOnly>
      <button v-if="isMobileLayout" class="project__close-button" @click="closeProject">
        <SvgClose />
      </button>
    </ClientOnly>

    <div ref="contentEl" class="project__content">
      <ProjectLanding
        :data="data"
        :ready="ready"
        :animation="svgAnimation"
        @update-scroll="updateScroll" />
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
        @mouseleave="onMouseLeave"
        @next-project="goToNextProject"
        @update-scroll="updateScroll" />
      <ClientOnly>
        <div v-if="toNextProject" ref="gapNextEl" class="project__content__gap--next" />
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
import { toPx } from '~/utils'
import { Swiper, type PanParams } from '~/utils/swiper'

const props = defineProps<{
  data: Project
  list: 'selected' | 'all'
  nextProject?: Project
}>()

const store = useStore()
const { updateHeader, updateCursor, updateSection, updateInProjectScroll } = store
const { isInProject, isInProjectEntered, cursor, gridType } = storeToRefs(store)

const { disableScroll, updateScrollFixedTargetId } = useScrollStore()

const route = useRoute()
const router = useRouter()
const { addTicker, killTicker } = useRaf()
const { vh, onResize } = useResize()
const { touch, isMobileLayout } = useDevice()
const { toScale } = useCss()

const el = ref<HTMLElement>()
const contentEl = ref<HTMLElement>()
const gapNextEl = ref<HTMLElement>()

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

let _Swiper = new Swiper({ prevent: true, dragOnTarget: true })

let _panTarget: number = 0

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

function _onPanStart(): void {
  _panTarget = _scroll.target
}

function _onPanMove(params: PanParams): void {
  const { yDiff, xDiff } = params
  if (Math.abs(xDiff) > Math.abs(yDiff)) return
  _scroll.target = _clampTarget(_panTarget - yDiff * 2)
}

function _onPanEnd(): void {
  _panTarget = _scroll.target
}

function _clampTarget(value: number): number {
  return Math.max(Math.min(_scroll.bounding, value), 0)
}

function _onRaf() {
  _scroll.current += (_scroll.target - _scroll.current) * 0.1
  const x = isMobileLayout.value ? 0 : _scroll.current * -1
  const y = isMobileLayout.value ? _scroll.current * -1 : 0
  contentEl.value && gsap.set(contentEl.value, { x, y })
  if (toNextProject.value && Math.abs(_scroll.target - _scroll.current) < 0.5) {
    emit('next')
    killTicker(_onRaf)
    _scroll.current = _scroll.target
    router.push(`/${props.nextProject?.slug}`)
  }
}

async function createScroll() {
  const disablePassive = { passive: false }
  if (touch.value) {
    _Swiper.init({
      el: el.value,
      onPanStart: _onPanStart,
      onPanMove: _onPanMove,
      onPanEnd: _onPanEnd,
    })
  } else {
    contentEl.value?.addEventListener('wheel', _onWheel, disablePassive)
  }
  await nextTick()
  updateScroll()
  addTicker(_onRaf)
}

function updateScroll() {
  if (isMobileLayout.value) {
    _scroll.bounding = (contentEl.value?.clientHeight || 0) - (el.value?.clientHeight || 0)
  } else {
    _scroll.bounding = (contentEl.value?.clientWidth || 0) - (el.value?.clientWidth || 0)
  }

  _scroll.target = _clampTarget(_scroll.target)
}

function killScroll() {
  _Swiper.destroy()
  contentEl.value?.removeEventListener('wheel', _onWheel)
}

function onMouseEnter() {
  updateCursor('arrow-right')
}

function onMouseLeave() {
  updateCursor('close')
}

function onClick() {
  if (touch.value) return
  cursor.value === 'close' && closeProject()
  cursor.value === 'arrow-right' && props.nextProject && goToNextProject()
}

async function goToNextProject() {
  killScroll()
  toNextProject.value = true
  await nextTick()
  const nextProject = el.value?.querySelector('.project__next')
  if (isMobileLayout.value && nextProject && gapNextEl.value) {
    const { height } = nextProject.getBoundingClientRect()
    gsap.set(gapNextEl.value, { height: toPx(vh.value - height) })
    await nextTick()
    const nextProjectLanding = nextProject.querySelector('.project__landing')
    nextProjectLanding && gsap.to(nextProjectLanding, { y: toScale(40) })
  }
  updateScroll()
  !isMobileLayout.value && updateCursor('default')
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

  &__close-button {
    position: absolute;
    z-index: 9999;
    will-change: opacity;
    top: var(--layout-margin);
    right: var(--layout-margin);
    width: toScale(4.4rem, 37.5rem);
    height: toScale(4.4rem, 37.5rem);
    background-color: black;
    border: none;
    padding: 0;
    border-radius: 100%;

    rotate: 45deg;

    .svg__close {
      width: toScale(2.4rem, 37.5rem);
      height: auto;
      @include absolute-center;
    }
  }

  &__content {
    will-change: transform;

    @include from__tablet--landscape {
      display: inline-block;
      white-space: nowrap;
    }

    .project__landing {
      z-index: 2;
    }

    > div {
      @include from__tablet--landscape {
        white-space: normal;
        display: inline-block;
        vertical-align: top;
        width: max-content;
        height: var(--vh);
      }
    }

    &__gap {
      @include from__tablet--landscape {
        width: 25vw !important;
      }
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
