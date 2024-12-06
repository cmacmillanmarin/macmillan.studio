<template>
  <section
    id="hero-target"
    :class="['home__hero', { 'home__hero--reel': reelVideoActive }]"
    data-scroll-target-top>
    <h1 class="home__hero__title">{{ data.title }}</h1>
    <div class="home__hero__content">
      <ClientOnly>
        <GridRuleOfThirds v-if="gridType === 'rule-of-thirds'" />
        <div v-if="isMobileLayout && !hideComponents" class="home__hero__content__macmillan">
          <Ticker>
            <div v-for="i in 2" :key="i"><SvgMacMillan /></div>
          </Ticker>
        </div>

        <Teleport to="#top-layer-blend">
          <template v-if="!hideComponents">
            <div
              v-if="!isMobileLayout"
              class="home__hero__content__macmillan home__hero__content__macmillan--blend">
              <SvgMacMillan data-scroll data-scroll-continuous />
            </div>
            <div data-scroll data-scroll-continuous class="home__hero__content__studio">
              <div class="home__hero__content__studio__content">
                <SvgStudio :blend="true" />
              </div>
            </div>
          </template>
        </Teleport>

        <Teleport to="#top-layer">
          <button
            v-show="isMobileLayout"
            ref="reelButtonEl"
            class="home__hero__content__reel-button"
            @click="goToReel"
            aria-label="Play reel"
            :tabindex="landingTabIndex">
            <SvgPlay />
          </button>
        </Teleport>
      </ClientOnly>

      <div ref="hintEl" class="home__hero__content__hint">
        <p class="home__hero__content__hint__label" v-html="data.hint" />
      </div>

      <video
        ref="videoEl"
        class="home__hero__content__video"
        width="1920"
        height="1080"
        preload="true"
        autoplay
        muted
        loop
        playsinline
        @timeupdate="onVideoPlaying"
        @ended="closeReel">
        <source src="/assets/video/reel--short.webm" type="video/webm" />
      </video>
    </div>

    <HomeHeroPlayer
      v-if="isInReel"
      :ready="reelReady"
      :progress="reelProgress"
      @close="closeReel"
      @mute="muteReel"
      @toggle="toggleReel"
      @update="updateReel" />
    <HomeHeroPlayer
      v-if="isInReel"
      :blend="true"
      :ready="reelReady"
      :progress="reelProgress"
      @close="closeReel"
      @mute="muteReel"
      @toggle="toggleReel"
      @update="updateReel" />

    <div class="home__hero__reel-target" id="reel-target" data-scroll-target-top />
    <div class="home__hero__intersect--top" v-intersect="{ callback: onIntersectTop }" />
    <div class="home__hero__intersect--bottom" v-intersect="{ callback: onIntersectBottom }" />
  </section>
</template>

<script lang="ts" setup>
import { gsap } from 'gsap/gsap-core'
import { storeToRefs } from 'pinia'
import useStore from '~/store/useStore'
import useScrollStore from '~/store/useScrollStore'
import { toPx, round } from '~/utils'
import type { FirstTransition } from '~/types/front'
import type { HomepageHero } from '~/types/wordpress/homepage'
import { shuffleIn, shuffleInParam, shuffleElsOut } from '~/utils/animations'

defineProps<{
  data: HomepageHero
}>()

const route = useRoute()
const router = useRouter()

const { $three }: any = useNuxtApp()

const store = useStore()
const { updateHeader, updateLoading, updateSection, updateInReel } = store
const {
  isPreloaded,
  section,
  gridType,
  headerLogo,
  isInReel,
  isInProjectEntered,
  landingTabIndex,
} = storeToRefs(store)

const scrollStore = useScrollStore()
const { updateScroll, disableScroll, updateScrollTargetId } = scrollStore
const { current, direction, bounding } = storeToRefs(scrollStore)

const { isMobileLayout, isTabletPortrait } = useDevice()
const { layoutMargin, toScale } = useCss()
const { lvw, vw, vh } = useResize()

const firstTransition = reactive<FirstTransition>({ state: false, step: 1, progress: 0, steps: [] })

const hideComponents = computed<boolean>(
  () =>
    (scrollProgress.value < 1 && videoInProject.value) ||
    ((firstTransition.step === 1 || firstTransition.progress < 0.5) && firstTransition.state) ||
    isInReel.value
)
const reelVideoActive = computed(
  () =>
    isInReel.value &&
    ((direction.value === 'up' && section.value === 'hero') ||
      (direction.value === 'down' && section.value === 'projects-bg'))
)

const hintEl = ref<HTMLElement>()
const videoEl = ref<HTMLVideoElement>()
const reelButtonEl = ref<HTMLElement>()
const videoPlaying = ref<boolean>(false)
const videoInView = ref<boolean>(false)
const videoCanPlay = ref<boolean>(false)
const videoInProject = ref<boolean>(false)
const heroAnimation = ref<boolean>(false)
const reelFade = ref<number>(1)
const reelSmallOpacity = ref<number>(0)
const reelProgress = ref<number>(0)
const reelButtonVisible = ref<boolean>(false)
const reelReady = ref<boolean>(false)

const verticalGap = computed<number>(() => lvw.value * 0.0825)
const verticalGapPx = computed<string>(() =>
  toPx(isMobileLayout.value ? toScale(71 + 8 + 16) : verticalGap.value * 1.5)
)
const titleMargin = computed<number>(() => verticalGap.value * 0.5)
const titleMarginPx = computed<string>(() => toPx(titleMargin.value))
const scrollGap = computed<number>(() => 1)
const scrollProgress = computed<number>(() =>
  Math.min(1, current.value / (vh.value * scrollGap.value))
)
const scrollThreshold = computed<number>(() => verticalGap.value * 2.5)
const componentHeight = computed<number>(() => vh.value + vh.value * scrollGap.value)

const size = computed<{ x: number; y: number; z: number }>(() => {
  const initWidth = isMobileLayout.value
    ? lvw.value - layoutMargin.value * 2
    : lvw.value * 0.666666 - layoutMargin.value
  const finalWidth = vw.value
  const incrementWidth = finalWidth - initWidth

  const initHeight = isTabletPortrait.value
    ? vh.value - toScale(340)
    : isMobileLayout.value
    ? vh.value - toScale(244) - toScale(208)
    : vh.value * 0.666666 - verticalGap.value
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

  const initY = isTabletPortrait.value
    ? toScale(186)
    : isMobileLayout.value
    ? toScale(244)
    : verticalGap.value
  const finalY = 0
  const incrementY = finalY - initY

  return {
    x: x,
    y: initY + incrementY * scrollProgress.value,
  }
})

const isReady = computed<boolean>(() => isPreloaded.value && videoCanPlay.value)

watch(isReady, ready => {
  ready && animate()
})

watch(hideComponents, async () => {
  await nextTick()
  updateScroll()
})

watch(isInProjectEntered, () => {
  if (isInProjectEntered.value) videoInProject.value = true
  else videoInProject.value = !!route.params.slug
})

watch([headerLogo, videoInProject, isMobileLayout], () => {
  $three.planes.updateObject({
    id: 'reel',
    onClick: videoInProject.value || headerLogo.value || isMobileLayout.value ? null : goToReel,
  })
})

watch(reelButtonVisible, () => {
  if (!reelButtonEl.value) return
  gsap.set(reelButtonEl.value, { pointerEvents: reelButtonVisible.value ? 'auto' : 'none' })
  reelButtonVisible.value
    ? shuffleIn({ el: reelButtonEl.value })
    : shuffleElsOut({ els: [reelButtonEl.value] })
})

watch([section, videoInView, videoInProject], () => {
  const play = videoInView.value && !videoInProject.value
  if (!play) {
    videoPlaying.value && videoEl.value?.pause()
  } else {
    !videoPlaying.value && videoEl.value?.play()
  }
  // updateScroll()
})

watch([current, section], () => {
  const initScale = 1
  const finalScale = isMobileLayout.value ? 1 : 0.885
  const incrementScale = initScale - finalScale
  const logoScroll = current.value * 0.75
  const scaleProgress = Math.min(1, logoScroll / scrollThreshold.value)
  const scale = initScale - incrementScale * scaleProgress

  videoInView.value = true
  reelButtonVisible.value =
    isMobileLayout.value && current.value > vh.value * 0.66 && !isInReel.value

  const scroll = Math.min(0, scrollThreshold.value - logoScroll) * 0.5

  const opacity = Math.max(0, 1 - (1 * current.value) / (vh.value * 0.15))

  const hintY = toPx(current.value * 0.2)
  const contentY = toPx(
    current.value - (verticalGap.value + titleMargin.value) * scaleProgress + scroll
  )
  const titleY = toPx(current.value + scroll)

  const videoY = Math.min(current.value, vh.value * 2 - (200 * 9) / 16)

  if (isMobileLayout.value && reelButtonEl.value) {
    const offset = Math.max(0, current.value - vh.value)
    gsap.set(reelButtonEl.value, {
      y: position.value.y + size.value.y * 0.5 - toScale(56) * 0.5 - offset,
    })
  }

  videoEl.value && gsap.set(videoEl.value, { y: videoY })
  const svgs = document.querySelectorAll('.svg__macmillan, .svg__studio')
  svgs.length && gsap.set(svgs, { scale })
  hintEl.value &&
    gsap.set(hintEl.value, {
      opacity: isMobileLayout.value ? 1 : opacity,
      y: isMobileLayout.value ? contentY : hintY,
    })
  const studioContent = document.querySelector('.home__hero__content__studio__content')
  const contentMacMillan = document.querySelector('.home__hero__content__macmillan')
  studioContent && gsap.set(studioContent, { y: contentY })
  contentMacMillan && gsap.set(contentMacMillan, { y: isMobileLayout.value ? contentY : titleY })

  $three.planes.updateObject({
    id: 'reel--small',
    position: {
      x: vw.value - toScale(164) - layoutMargin.value,
      y: vh.value - toScale(82) - layoutMargin.value,
    },
    fixed: { from: 0, to: bounding.value },
    size: { x: toScale(164), y: toScale(82), z: 1 },
    border: toScale(8),
    order: 99,
  })
  const visible = section.value !== 'hero' && section.value !== 'projects-bg'
  if (visible) {
    reelSmallOpacity.value === 0 &&
      shuffleInParam({
        param: reelSmallOpacity,
        onUpdate: () => {
          $three.planes.updateObject({ id: 'reel--small', opacity: reelSmallOpacity.value })
        },
      })
  } else {
    gsap.killTweensOf(reelSmallOpacity)
    reelSmallOpacity.value = 0
    $three.planes.updateObject({ id: 'reel--small', opacity: reelSmallOpacity.value })
  }
})

watch([firstTransition, position, videoPlaying, videoInProject], () => {
  let _size = size.value
  let _position = position.value
  let _border = 0
  let _zoom = 1
  let _opacity = 1
  let _fixed = { from: 0, to: vh.value * scrollGap.value }
  let _parallax = { x: 0, y: 0 }
  let _forcePixel =
    current.value >= vh.value * scrollGap.value && isMobileLayout.value && !isInReel.value

  if (firstTransition.state) {
    const from = firstTransition.steps[firstTransition.step - 1]
    const to = firstTransition.steps[firstTransition.step]

    if (from && to) {
      const progress = firstTransition.progress
      if (progress === 0) return
      _forcePixel = !!from.forcePixel
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

  $three.planes.updateObject({
    id: 'reel',
    fixed: _fixed,
    size: _size,
    position: _position,
    border: _border,
    zoom: _zoom,
    opacity: _opacity,
    parallax: _parallax,
    forcePixel: _forcePixel,
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
  $three.planes.addObject({
    id: 'reel',
    video: videoEl.value,
    color: rbgToVec4(hexToRgb('#000000')),
    cursor: 'play',
  })
  $three.planes.addObject({
    id: 'reel--small',
    video: videoEl.value,
    color: rbgToVec4(hexToRgb('#000000')),
    onClick: goToReel,
  })
})

function goToReel() {
  reelReady.value = false
  reelProgress.value = 0
  reelButtonVisible.value = false
  updateInReel(true)
  disableScroll(true)
  $three.planes.updateObject({
    id: 'reel',
    onClick: null,
    noPixel: true,
    cursor: null,
    forcePixel: false,
  })
  gsap.killTweensOf(reelFade)
  gsap.to(reelFade, { value: 0, onUpdate: updateReelOpacity })

  if (route.hash === '#reel') updateScrollTargetId('reel')
  else router.push('/#reel')
  if (videoEl.value) {
    videoEl.value.src = '/assets/video/reel.mp4'
    videoEl.value.setAttribute('type', 'video/mp4')
    videoEl.value.muted = false
    videoEl.value.loop = false
    videoEl.value.play()
    videoEl.value.addEventListener('canplay', onReelReady)
  }
}

function onReelReady() {
  gsap.killTweensOf(reelFade)
  gsap.to(reelFade, { value: 1, onUpdate: updateReelOpacity })
  reelReady.value = true
  videoEl.value?.removeEventListener('canplay', onReelReady)
}

function updateReelOpacity() {
  $three.planes.updateObject({ id: 'reel', textureFade: reelFade.value })
}

function updateReel(progress: number) {
  if (videoEl.value) {
    videoEl.value.currentTime = videoEl.value.duration * progress
    reelProgress.value = progress
  }
}

function muteReel() {
  if (videoEl.value) {
    videoEl.value.muted = !videoEl.value.muted
  }
}

function closeReel() {
  updateInReel(false)
  disableScroll(false)
  updateScrollTargetId('projects')
  $three.planes.updateObject({
    id: 'reel',
    onClick: isMobileLayout.value ? null : goToReel,
    noPixel: false,
    cursor: 'play',
  })
  if (videoEl.value) {
    videoEl.value.src = '/assets/video/reel--short.webm'
    videoEl.value.setAttribute('type', 'video/webm')
    videoEl.value.muted = true
    videoEl.value.loop = true
    videoEl.value.play()
  }
}

function toggleReel() {
  if (videoEl.value) {
    videoEl.value.paused ? videoEl.value.play() : videoEl.value.pause()
  }
}

function animate() {
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
        onUpdate: () => {
          i === firstTransition.steps.length - 1 &&
            firstTransition.progress > 0.2 &&
            !heroAnimation.value &&
            onLastAnimationStepDone()
        },
        onComplete: () => {
          i === firstTransition.steps.length - 1 && onFirstAnimationDone()
        },
      })
    }
  }
}

function updateFirstTransitionSteps() {
  const halfWidth = vw.value * 0.5
  const halfHeight = vh.value * 0.5

  const initWidthRatio = isMobileLayout.value ? 0.5 : 0.333333

  const initWidth = lvw.value * initWidthRatio
  const finalWidth = isMobileLayout.value
    ? lvw.value - layoutMargin.value * 2
    : lvw.value * 0.666666 - layoutMargin.value

  const initHeight = isMobileLayout.value
    ? (initWidth * vh.value) / vw.value
    : vh.value * initWidthRatio
  const finalHeight = isTabletPortrait.value
    ? vh.value - toScale(340)
    : isMobileLayout.value
    ? vh.value - toScale(244) - toScale(208)
    : vh.value * 0.666666 - verticalGap.value

  const layoutGap = Math.min(0, lvw.value - vw.value) * -0.5

  const finalX = vw.value - layoutMargin.value - finalWidth - layoutGap
  const finalY = isTabletPortrait.value
    ? toScale(186)
    : isMobileLayout.value
    ? toScale(244)
    : verticalGap.value

  firstTransition.steps = [
    {
      position: { x: halfWidth - initWidth * 0.5, y: vh.value },
      size: { x: initWidth, y: initHeight, z: 1 },
      border: toScale(isMobileLayout.value ? 8 : 16),
      zoom: isMobileLayout.value ? 1 : 2,
      forcePixel: isMobileLayout.value,
    },
    {
      position: { x: halfWidth - initWidth * 0.5, y: halfHeight - initHeight * 0.5 },
      size: { x: initWidth, y: initHeight, z: 1 },
      border: toScale(isMobileLayout.value ? 8 : 16),
      zoom: isMobileLayout.value ? 1 : 2,
      forcePixel: false,
    },
    {
      position: { x: finalX, y: finalY },
      size: { x: finalWidth, y: finalHeight, z: 1 },
      border: 0,
      zoom: 1,
      forcePixel: false,
    },
  ]
}

function onVideoReady() {
  videoCanPlay.value = true
}

function onVideoPlaying() {
  if (videoEl.value && isInReel.value && videoEl.value.duration) {
    reelProgress.value = round(videoEl.value.currentTime / videoEl.value.duration, 4)
  }
}

async function onLastAnimationStepDone() {
  heroAnimation.value = true
  fadeIn({ el: hintEl.value })
  updateHeader(true)
}

async function onFirstAnimationDone() {
  firstTransition.state = false
  await nextTick()
  updateScroll()
  disableScroll(false)
  $three.planes.updateObject({ id: 'reel', onClick: isMobileLayout.value ? null : goToReel })
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
  $three.planes.removeObject('reel')
  $three.planes.destroy()
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

  &__content {
    position: relative;
    height: var(--vh);
    align-content: flex-start;
    @include grid('rule-of-thirds');

    &__macmillan {
      position: relative;
      width: 100vw;
      padding-top: var(--layout-margin);
      will-change: transform;

      &--blend {
        position: absolute;
        --col: 33.3333%;
        width: calc(var(--col) * 2);
        margin-left: var(--col);
        padding-right: var(--layout-margin);
        margin-bottom: v-bind(titleMarginPx);
        padding-top: 0;
        @include from__desktop--x-large {
          width: calc(var(--layout-max-width) * 0.666666);
          margin-left: calc(
            (100vw - var(--layout-max-width)) * 0.5 + var(--layout-max-width) * 0.333333
          );
        }
      }

      .ticker {
        > div {
          padding-right: toScale(3.2rem, 37.5rem);
          @include from__tablet {
            padding-right: toScale(4rem);
          }
        }
        svg {
          path {
            fill: var(--black);
          }
        }
      }

      svg {
        display: block;
        width: 146.65vw;
        height: auto;
        will-change: transform;
        transform-origin: top right;
        &:nth-child(2) {
          margin: 0 var(--layout-margin);
        }
        @include from__tablet {
          width: 100vw;
        }
        @include from__tablet--landscape {
          width: 100%;
        }
        path {
          fill: var(--light-grey);
        }
      }
    }

    &__studio {
      position: relative;
      z-index: 1;
      pointer-events: none;
      width: calc(100vw - var(--layout-margin) * 2);
      padding-top: v-bind(verticalGapPx);
      margin-left: var(--layout-margin);

      @include from__tablet {
        width: 65vw;
        margin-left: auto;
        margin-right: auto;
        padding-top: calc(toScale(21rem) + var(--layout-margin));
      }

      @include from__tablet--landscape {
        width: calc(min(100vw, var(--layout-max-width)) * 0.333333);
        padding-top: v-bind(verticalGapPx);
        padding-left: var(--layout-margin);
        margin-left: 0;
        margin-right: 0;
      }

      @include from__desktop--x-large {
        margin-left: calc((100vw - var(--layout-max-width)) * 0.5);
      }

      svg {
        will-change: transform;
        transform-origin: top left;
        @include from__tablet--landscape {
          width: 127.9%;
        }
        path {
          fill: var(--light-grey);
        }
      }
    }

    &__hint {
      position: absolute;
      width: calc(100vw - var(--layout-margin) * 2);
      top: toScale(18.6rem, 37.5rem);
      left: var(--layout-margin);
      padding: 0 var(--layout-gutter);
      text-align: center;
      @include will-fade;

      @include from__tablet {
        top: toScale(50rem);
      }

      @include from__tablet--landscape {
        display: flex;
        width: var(--col);
        top: calc(var(--col) * 3 - #{toScale(16rem)} - var(--layout-margin));
        left: var(--col);
        height: var(--col);
        text-align: left;
        padding: 0;
      }

      p {
        color: var(--black);
        height: max-content;
        font-family: 'HelveticaNowDisplayBold' !important;
        @include t-b1;
      }
    }

    &__reel-button {
      position: absolute;
      top: 0;
      left: 50%;
      transform: translateX(-50%);
      width: toScale(5.6rem, 37.5rem);
      height: toScale(5.6rem, 37.5rem);
      border: 0;
      padding: 0;
      background-color: black;
      border: none;
      border-radius: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      pointer-events: none;
      opacity: 0.000001;
      will-change: opacity, transform;

      .svg__play {
        transform: translateX(15%);
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
