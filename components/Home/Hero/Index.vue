<template>
  <section
    id="hero-target"
    :class="['home__hero', { 'home__hero--reel': reelVideoActive }]"
    data-scroll-target-top>
    <h1 class="home__hero__title">{{ data.title }}</h1>
    <div class="home__hero__content">
      <GridRuleOfThirds v-if="gridType === 'rule-of-thirds'" />

      <div class="home__hero__content__macmillan">
        <SvgMacMillan v-if="!hideComponents" />
      </div>
      <ClientOnly>
        <Teleport to="#top-layer">
          <div
            v-if="!hideComponents"
            data-scroll
            data-scroll-continuous
            class="home__hero__content__studio">
            <div class="home__hero__content__studio__content">
              <SvgStudio />
            </div>
          </div>
        </Teleport>
      </ClientOnly>

      <div ref="hintEl" class="home__hero__content__hint">
        <p class="home__hero__content__hint__label" v-html="data.hint" />
      </div>

      <video ref="videoEl" class="home__hero__content__video" width="1920" height="1080" muted loop>
        <source src="/assets/video/short.webm" type="video/webm" />
      </video>
    </div>

    <div class="home__hero__reel-target" id="reel-target" data-scroll-target-top />
    <div class="home__hero__intersect--top" v-intersect="{ callback: onIntersectTop }" />
    <div class="home__hero__intersect--bottom" v-intersect="{ callback: onIntersectBottom }" />
  </section>
</template>

<script lang="ts" setup>
import { gsap } from 'gsap'
import { storeToRefs } from 'pinia'
import useStore from '~/store/useStore'
import useScrollStore from '~/store/useScrollStore'
import { toPx, round } from '~/utils'
import type { FirstTransition } from '~/types/front'
import type { HomepageHero } from '~/types/wordpress/homepage'

const props = defineProps<{
  data: HomepageHero
}>()

const route = useRoute()
const router = useRouter()

const { $scene }: any = useNuxtApp()

const store = useStore()
const { updateLoading, updateSection, updateInReel } = store
const { section, gridType, isInReel, isInProjectEntered } = storeToRefs(store)

const scrollStore = useScrollStore()
const { updateScroll, disableScroll, updateScrollTargetId } = scrollStore
const { current, direction } = storeToRefs(scrollStore)

const { layoutMargin, toScale } = useCss()
const { lvw, vw, vh } = useResize()

const firstTransition = reactive<FirstTransition>({ state: false, step: 1, progress: 0, steps: [] })

const hideComponents = computed<boolean>(
  () => (scrollProgress.value < 1 && videoInProject.value) || firstTransition.state
)
const reelVideoActive = computed(
  () =>
    isInReel.value &&
    ((direction.value === 'up' && section.value === 'hero') ||
      (direction.value === 'down' && section.value === 'projects-bg'))
)

const hintEl = ref<HTMLElement>()
const videoEl = ref<HTMLVideoElement>()
const videoPlaying = ref<boolean>(false)
const videoInView = ref<boolean>(false)
const videoInProject = ref<boolean>(false)

const verticalGap = computed<number>(() => lvw.value * 0.082)
const verticalGapPx = computed<string>(() => toPx(lvw.value * 0.082 * 1.5))
const titleMargin = computed<number>(() => verticalGap.value * 0.5)
const titleMarginPx = computed<string>(() => toPx(titleMargin.value))
const scrollGap = computed<number>(() => 1)
const scrollProgress = computed<number>(() =>
  Math.min(1, current.value / (vh.value * scrollGap.value))
)
const scrollThreshold = computed<number>(() => verticalGap.value * 2.5)
const componentHeight = computed<number>(() => vh.value + vh.value * scrollGap.value)

const size = computed<{ x: number; y: number; z: number }>(() => {
  const initWidth = lvw.value * 0.666666 - layoutMargin.value
  const finalWidth = vw.value
  const incrementWidth = finalWidth - initWidth

  const initHeight = vh.value * 0.666666 - verticalGap.value
  const finalHeight = vh.value
  const incrementHeight = finalHeight - initHeight

  return {
    x: round(initWidth + incrementWidth * scrollProgress.value, 2),
    y: round(initHeight + incrementHeight * scrollProgress.value, 2),
    z: 1,
  }
})

const parallaxY = computed<number>(() => {
  const videoHeight = (size.value.x * 1080) / 1920
  const parallax = (videoHeight - size.value.y) * 0.5
  return parallax / videoHeight
})

const position = computed<{ x: number; y: number }>(() => {
  const initGap = Math.min(0, lvw.value - vw.value) * -0.5
  const finalGap = 0
  const incrementGap = finalGap - initGap

  const x =
    vw.value -
    layoutMargin.value -
    size.value.x -
    incrementGap * (scrollProgress.value - 1) +
    layoutMargin.value * scrollProgress.value

  const initY = verticalGap.value
  const finalY = 0
  const incrementY = finalY - initY

  return {
    x: x,
    y: initY + incrementY * scrollProgress.value,
  }
})

watch(isInProjectEntered, () => {
  if (isInProjectEntered.value) videoInProject.value = true
  else videoInProject.value = !!route.params.slug
})

watch(videoInProject, () => {
  $scene.updateObject({ id: 'reel', onClick: videoInProject.value ? undefined : goToReel })
})

watch([section, videoInView, videoInProject], () => {
  const play = videoInView.value && !videoInProject.value
  if (!play) {
    videoPlaying.value && videoEl.value?.pause()
  } else {
    !videoPlaying.value && videoEl.value?.play()
  }
  updateScroll()
})

watch(current, () => {
  const initScale = 1
  const finalScale = 0.885
  const incrementScale = initScale - finalScale
  const scaleProgress = Math.min(1, current.value / scrollThreshold.value)
  const scale = initScale - incrementScale * scaleProgress

  videoInView.value = current.value < componentHeight.value

  const scroll = Math.min(0, scrollThreshold.value - current.value) * 0.5

  const opacity = 1 - (1 * current.value) / (vh.value * 0.4)

  const hintY = toPx(current.value * 0.2)
  const contentY = toPx(
    current.value - (verticalGap.value + titleMargin.value) * scaleProgress + scroll
  )
  const titleY = toPx(current.value + scroll)

  gsap.set('.svg__macmillan, .svg__studio', { scale })
  gsap.set('.home__hero__content__hint', { opacity, y: hintY })
  gsap.set('.home__hero__content__studio__content', { y: contentY })
  gsap.set('.home__hero__content__macmillan', { y: titleY })
})

watch([firstTransition, position, videoPlaying, videoInProject], () => {
  let _size = size.value
  let _position = position.value
  let _border = 0
  let _zoom = 1
  let _opacity = 1
  let _fixed = { from: 0, to: vh.value * scrollGap.value }
  let _parallax = { x: 0, y: 0 }

  if (firstTransition.state) {
    const from = firstTransition.steps[firstTransition.step - 1]
    const to = firstTransition.steps[firstTransition.step]

    if (from && to) {
      const progress = firstTransition.progress
      _size = {
        x: from.size.x + (to.size.x - from.size.x) * progress,
        y: from.size.y + (to.size.y - from.size.y) * progress,
        z: 1,
      }
      _position = {
        x: from.position.x + (to.position.x - from.position.x) * progress,
        y: from.position.y + (to.position.y - from.position.y) * progress,
      }
      _border = from.border + (to.border - from.border) * progress
      _zoom = from.zoom + (to.zoom - from.zoom) * progress
      if (firstTransition.step === 1) {
        _parallax.y = (parallaxY.value - parallaxY.value * firstTransition.progress) * _zoom * -2
      }
    }
  } else if (videoInProject.value) _opacity = 0

  $scene.updateObject({
    id: 'reel',
    fixed: _fixed,
    size: _size,
    position: _position,
    border: _border,
    zoom: _zoom,
    opacity: _opacity,
    parallax: _parallax,
  })
})

onMounted(() => {
  firstTransition.state = section.value === 'hero'
  firstTransition.state && updateFirstTransitionSteps()
  videoInProject.value = !firstTransition.state
  videoEl.value?.addEventListener('play', onPlay)
  videoEl.value?.addEventListener('pause', onPause)
  videoEl.value?.addEventListener('canplaythrough', onVideoReady)
  !videoInProject.value && videoEl.value?.load()
  videoInView.value = current.value < componentHeight.value && section.value === 'hero'
  $scene.addObject({
    id: 'reel',
    type: 'plane',
    video: videoEl.value,
    color: rbgToVec4(hexToRgb('#818388')),
    cursor: 'play',
  })
})

function goToReel() {
  updateInReel(true)
  disableScroll(true)
  $scene.updateObject({ id: 'reel', onClick: closeReel, noPixel: true, cursor: 'close' })
  if (route.hash === '#reel') updateScrollTargetId('reel')
  else router.push('/#reel')
  if (videoEl.value) {
    videoEl.value.src = '/assets/video/reel.mp4'
    videoEl.value.setAttribute('type', 'video/mp4')
    videoEl.value.muted = false
    videoEl.value.loop = false
    videoEl.value.play()
  }
}

function closeReel() {
  updateInReel(false)
  disableScroll(false)
  updateScrollTargetId('projects')
  $scene.updateObject({ id: 'reel', onClick: goToReel, noPixel: false, cursor: 'play' })
  if (videoEl.value) {
    videoEl.value.src = '/assets/video/short.webm'
    videoEl.value.setAttribute('type', 'video/webm')
    videoEl.value.muted = true
    videoEl.value.loop = true
    videoEl.value.play()
  }
}

function updateFirstTransitionSteps() {
  const halfWidth = vw.value * 0.5
  const halfHeight = vh.value * 0.5

  const initWidthRatio = 0.333333

  const initWidth = lvw.value * initWidthRatio
  const finalWidth = lvw.value * 0.666666 - layoutMargin.value

  const initHeight = vh.value * initWidthRatio
  const finalHeight = vh.value * 0.666666 - verticalGap.value

  const layoutGap = Math.min(0, lvw.value - vw.value) * -0.5

  const finalX = vw.value - layoutMargin.value - finalWidth - layoutGap

  firstTransition.steps = [
    {
      position: { x: halfWidth - initWidth * 0.5, y: vh.value },
      size: { x: initWidth, y: initHeight, z: 1 },
      border: toScale(16),
      zoom: 2,
    },
    {
      position: { x: halfWidth - initWidth * 0.5, y: halfHeight - initHeight * 0.5 },
      size: { x: initWidth, y: initHeight, z: 1 },
      border: toScale(16),
      zoom: 2,
    },
    {
      position: { x: finalX, y: verticalGap.value },
      size: { x: finalWidth, y: finalHeight, z: 1 },
      border: 0,
      zoom: 1,
    },
  ]
}

function onVideoReady() {
  if (firstTransition.state) {
    updateLoading(false)
    const duration = 0.8
    for (let i = 1; i < firstTransition.steps.length; i++) {
      const delay = duration * (i - 1)
      gsap.set(firstTransition, { progress: 0, delay })
      gsap.to(firstTransition, {
        progress: 1,
        duration,
        delay,
        onStart: () => {
          firstTransition.step = i
        },
        onComplete: () => {
          i === firstTransition.steps.length - 2 && fadeIn({ el: hintEl.value })
          i === firstTransition.steps.length - 1 && onFirstAnimationDone()
        },
      })
    }
  }
}

async function onFirstAnimationDone() {
  firstTransition.state = false
  await nextTick()
  updateScroll()
  disableScroll(false)
  $scene.updateObject({ id: 'reel', onClick: goToReel })
}

function onPlay() {
  videoPlaying.value = true
}

function onPause() {
  videoPlaying.value = false
}

function onIntersectTop(el: HTMLElement, visible: boolean) {
  if (visible && direction.value === 'up') updateSection('hero')
}

function onIntersectBottom(el: HTMLElement, visible: boolean) {
  if (visible && direction.value === 'up') updateSection('reel')
}

onUnmounted(() => {
  videoEl.value?.removeEventListener('play', onPlay)
  videoEl.value?.removeEventListener('pause', onPause)
  videoEl.value?.removeEventListener('canplaythrough', onVideoReady)
  $scene.removeObject('reel')
  $scene.destroy()
})
</script>

<style lang="scss">
.home__hero {
  position: relative;
  padding-bottom: calc(var(--vh) * v-bind(scrollGap));

  &--reel {
    cursor: pointer;
  }

  &__title {
    @include t-seo;
  }

  &__reel {
    position: absolute;
    top: 0;
    left: 0;
    width: 100vw;
    height: var(--vh);
    z-index: 2;
    background-color: black;
    opacity: 1;
  }

  &__content {
    position: relative;
    height: var(--vh);
    align-content: flex-start;
    @include grid('rule-of-thirds');

    &__macmillan {
      width: calc(var(--col) * 2);
      margin-left: var(--col);
      padding-right: var(--layout-margin);
      margin-bottom: v-bind(titleMarginPx);
      will-change: transform;
      svg {
        will-change: transform;
        transform-origin: top right;
      }
    }

    &__studio {
      position: relative;
      z-index: 1;
      pointer-events: none;
      width: calc(min(100vw, var(--layout-max-width)) * 0.333333);
      padding-top: v-bind(verticalGapPx);
      padding-left: var(--layout-margin);

      svg {
        width: 127.9%;
        will-change: transform;
        transform-origin: top left;
      }
      @include from__desktop--x-large {
        margin-left: calc((100vw - var(--layout-max-width)) * 0.5);
      }
    }

    &__hint {
      position: absolute;
      top: calc(var(--col) * 3 - #{toScale(16rem)} - var(--layout-margin));
      left: var(--col);
      height: var(--col);
      width: var(--col);
      display: flex;
      @include will-fade;
      p {
        color: var(--black);
        height: max-content;
        @include t-b1;
      }
    }

    &__video {
      z-index: 9;
      position: absolute;
      top: 0;
      left: 0;
      width: 20rem;
      height: max-content;
      pointer-events: none;
      opacity: 0;
    }
  }

  &__reel-target {
    position: absolute;
    top: var(--vh);
    left: 0;
    width: 100%;
  }

  &__intersect {
    position: absolute;
    left: 0;
    width: 100%;
    height: 1px;
    // border: 1px solid red;
    &--top,
    &--bottom {
      @extend .home__hero__intersect;
    }
    &--top {
      bottom: var(--vh);
    }
    &--bottom {
      bottom: 0.1rem;
    }
  }
}
</style>
