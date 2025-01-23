<template>
  <div ref="el" :class="['project', { 'project--entered': !transition }]" @click="onClick">
    <ClientOnly>
      <Teleport to=".__layout">
        <transition @leave="transitionFadeOut">
          <PixelTransition v-if="transition" :color="data.color" @done="enter" />
        </transition>
      </Teleport>
      <GridRuleOfThirds v-if="gridType === 'rule-of-thirds'" />
    </ClientOnly>

    <div ref="contentEl" class="project__content">
      <ClientOnly>
        <figure v-if="!isMobileLayout" class="project__content__title">
          <SvgProject
            :project="data.slug"
            :animation="svgAnimation"
            :color="data.color"
            :next="false"
            @update-scroll="updateScroll" />
        </figure>
      </ClientOnly>
      <ProjectLanding
        :data="data"
        :ready="ready"
        :animation="svgAnimation"
        :scroll-on-top="scrollOnTop"
        @update-scroll="updateScroll" />
      <ProjectAsset
        v-for="(asset, i) in data.assets"
        :data="asset"
        :first="i === 0"
        :ready="isInProjectEntered"
        :bg-color="data.secondaryColor"
        @update-scroll="updateScroll" />
      <div v-if="data.assets.length === 0" class="project__content__gap" />
      <ClientOnly>
        <div
          v-if="isMobileLayout && data.assets.length === 1 && !data.recognitions.length"
          class="project__content__gap--small" />
      </ClientOnly>
      <ProjectRecognitions v-if="data.recognitions.length" :data="data.recognitions" />
      <ProjectNext
        v-if="nextProject"
        :data="nextProject"
        @next-project="goToNextProject"
        @update-scroll="updateScroll"
        @in-view="onNextProjectInViewUpdated" />
      <ClientOnly>
        <div v-if="toNextProject" ref="gapNextEl" class="project__content__gap--next" />
      </ClientOnly>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { gsap } from 'gsap/gsap-core'
import { type Project } from '~/types/wordpress/project'
import useStore from '~/store/useStore'
import useScrollStore from '~/store/useScrollStore'
import { transitionFadeOut } from '~/utils/animations'
import { storeToRefs } from 'pinia'
import { toPx, getKeyboardFocusableElements } from '~/utils'
import { Swiper, type PanParams } from '~/utils/swiper'
import type { Head } from '~/types/wordpress'

const props = defineProps<{
  data: Project
  list: 'selected' | 'all'
  nextProject?: Project
}>()

const { head }: { head: Head } = props.data
const headTitle: string = head.title || props.data.title
const headDescription: string = head.description || props.data.description

useHead({
  title: headTitle,
  meta: [
    { name: 'description', content: headDescription },
    { name: 'theme-color', content: props.data.color },
    { name: 'og:title', content: headTitle },
    { name: 'og:description', content: headDescription },
    { name: 'og:image', content: !!head.og_image ? head.og_image : undefined },
    { name: 'twitter:title', content: headTitle },
    { name: 'twitter:description', content: headDescription },
    { name: 'twitter:image', content: !!head.tw_image ? head.tw_image : undefined },
  ],
})

const store = useStore()
const {
  updateHeader,
  updateCursor,
  updateSection,
  updateInProjectScroll,
  updateInProjectNextProjectInView,
} = store
const { isInProject, isInProjectEntered, cursor, gridType, headerMobileButtonClicked } =
  storeToRefs(store)

const scrollStore = useScrollStore()
const { disableScroll, updateScrollFixedTargetId } = scrollStore

const route = useRoute()
const router = useRouter()
const { addTicker, killTicker } = useRaf()
const { vw, vh, onResize } = useResize()
const { touch, isMobileLayout } = useDevice()
const { x: mouseX } = useMouse()

const el = ref<HTMLElement>()
const contentEl = ref<HTMLElement>()
const gapNextEl = ref<HTMLElement>()

const transition = ref<boolean>(!isInProject.value)
const svgAnimation = ref<boolean>(transition.value)
const ready = ref<boolean>(!transition.value)

const scrollOnTop = ref<boolean>(true)
const nextProjectInView = ref<boolean>(false)

const toNextProject = ref<boolean>(false)
const backgroundColor = ref<string>(props.data.color || '')
const nextProjectBackgroundColor = ref<string>(props.nextProject?.color || '')

let _scroll: any = {
  el: null,
  current: 0,
  target: 0,
  bounding: 0,
}

let _Swiper = new Swiper({ prevent: false, dragOnTarget: true })

let _panTarget: number = 0

watch(ready, async () => {
  await nextTick()
  getKeyboardFocusableElements(el.value).forEach(el => {
    el.addEventListener('focus', onElementFocus)
  })
})

watch(onResize, updateScroll)

watch(headerMobileButtonClicked, () => {
  if (props.nextProject && nextProjectInView.value) goToNextProject()
  else closeProject()
})

watch(nextProjectInView, () => {
  updateInProjectNextProjectInView(nextProjectInView.value)
})

onBeforeMount(() => {
  updateCursor('default')
  updateSection('projects')
  updateInProjectNextProjectInView(false)
})

onMounted(async () => {
  disableScroll(true)
  emit('mounted')
  !transition.value && enter()
  if (ready.value) {
    await nextTick()
    getKeyboardFocusableElements(el.value).forEach(el => {
      el.addEventListener('focus', onElementFocus)
    })
  }
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
  const { yDiff, xDiff, inertia } = params
  if (Math.abs(xDiff) > Math.abs(yDiff)) return
  _scroll.target = _clampTarget(_panTarget - yDiff * (1 + inertia))
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
  scrollOnTop.value = _scroll.target === 0

  if (toNextProject.value && Math.abs(_scroll.target - _scroll.current) < 0.5) {
    _scroll.current = _scroll.target
    emit('next')
    killTicker(_onRaf)
    router.push(`/${props.nextProject?.slug}`)
  }

  if (!toNextProject.value && !!props.nextProject) {
    const mouseOnNextScrolling =
      _scroll.bounding - vw.value * 0.75 - _scroll.current + (vw.value - mouseX.value) < 0
    if (mouseOnNextScrolling && cursor.value === 'close') updateCursor('arrow-right')
    else if (!mouseOnNextScrolling && cursor.value === 'arrow-right') updateCursor('close')
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

function onElementFocus(e: Event) {
  const target = (e.target || e.currentTarget) as HTMLElement | undefined
  const tabFixed = !!(target?.dataset.tabFixed === '')
  if (!target || tabFixed) return
  const { left, width } = target.getBoundingClientRect()
  _scroll.target = _clampTarget(_scroll.target + left - vw.value * 0.5 + width * 0.5)
  updateCursor('default')
}

function onClick() {
  if (touch.value) return
  cursor.value === 'close' && closeProject()
  cursor.value === 'arrow-right' && props.nextProject && goToNextProject()
}

function onNextProjectInViewUpdated(value: boolean) {
  nextProjectInView.value = value
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
  killTicker(_onRaf)
  killScroll()
  getKeyboardFocusableElements(el.value).forEach(el => {
    el.removeEventListener('focus', onElementFocus)
  })
  if (!route.params.slug) {
    emit('closed')
    updateCursor('default')
    const toProjects = props.list === 'selected' && !props.data.selected
    const target = toProjects ? 'projects' : `${props.list}-${props.data.slug}-anchor`
    updateScrollFixedTargetId(target)
    disableScroll(false)
    updateHeader(!isMobileLayout.value)
  }
  window.localStorage.removeItem(`project-ticker-${props.data.slug}`)
  window.localStorage.removeItem(`project-ticker-${props.data.slug}-first-line`)
  window.localStorage.removeItem(`project-ticker-${props.data.slug}-second-line`)
})

const emit = defineEmits(['mounted', 'entered', 'next', 'closed'])
</script>

<style lang="scss">
.project {
  @include will-fade;

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

    .svg__aspa {
      @include absolute-center;
    }
  }

  &__content {
    background-color: v-bind(backgroundColor);
    will-change: transform;

    @include from__tablet--landscape {
      display: inline-block;
      white-space: nowrap;
    }

    .project__landing {
      z-index: 2;
    }

    &__title {
      position: absolute;
      bottom: var(--layout-margin);
      left: var(--layout-margin);
      z-index: 9;
      mix-blend-mode: difference;
      @include from__desktop--x-large {
        padding-left: calc((100vw - var(--layout-max-width)) * 0.5);
      }
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

      &--small {
        @extend .project__content__gap;
        height: var(--layout-margin);
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
  &__arrow {
    position: absolute;
    z-index: 9999;
    bottom: var(--layout-margin);
    left: 50%;
    width: max-content;
    transform: translate(-50%);
    padding: 0;
    border: none;
    @include will-fade;
    .svg__pixel-arrow {
      width: toScale(2.4rem, 37.5rem);
      height: auto;
    }
  }
}
</style>
