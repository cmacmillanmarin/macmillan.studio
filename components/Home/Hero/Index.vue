<template>
  <section
    id="hero-target"
    :class="['home__hero', { 'home__hero--reel': reelVideoActive }]"
    data-scroll-target-top>
    <h1 class="home__hero__title">{{ data.title }}</h1>
    <div class="home__hero__content" v-transition:in="{ callback: enter }">
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

      <div class="home__hero__content__hint">
        <p class="home__hero__content__hint__label" v-html="data.hint" />
      </div>

      <video ref="videoEl" class="home__hero__content__video" width="1920" height="1080" muted loop>
        <source ref="sourceEl" src="/assets/video/short.webm" type="video/webm" />
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
import { fadeIn } from '~/utils/animations'
import type { HomepageHero } from '~/types/wordpress/homepage'

defineProps<{
  data: HomepageHero
}>()

const route = useRoute()
const router = useRouter()

const { $scene }: any = useNuxtApp()

const store = useStore()
const { updateSection, updateInReel } = store
const { section, gridType, isInReel, isInProjectEntered } = storeToRefs(store)

const scrollStore = useScrollStore()
const { updateScroll, disableScroll, updateScrollTargetId } = scrollStore
const { current, direction } = storeToRefs(scrollStore)

const { layoutMargin } = useCss()
const { lvw, vw, vh } = useResize()

const hideComponents = computed<boolean>(() => scrollProgress.value < 1 && isInProjectEntered.value)
const reelVideoActive = computed(
  () =>
    isInReel.value &&
    ((direction.value === 'up' && section.value === 'hero') ||
      (direction.value === 'down' && section.value === 'projects-bg'))
)

const videoEl = ref<HTMLVideoElement>()
const sourceEl = ref<HTMLSourceElement>()
const videoPlaying = ref<boolean>(false)

const verticalGap = computed<number>(() => lvw.value * 0.082)
const verticalGapPx = computed<string>(() => toPx(lvw.value * 0.082 * 1.5))
const titleMargin = computed<number>(() => verticalGap.value * 0.5)
const titleMarginPx = computed<string>(() => toPx(titleMargin.value))
const scrollGap = computed<number>(() => 1)
const scrollProgress = computed<number>(() =>
  Math.min(1, current.value / (vh.value * scrollGap.value))
)
const scrollThreshold = computed<number>(() => verticalGap.value * 2.5)

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

watch(isInProjectEntered, v => {
  v ? videoEl.value?.pause() : videoEl.value?.play()
  updateScroll()
})

watch(current, () => {
  const initScale = 1
  const finalScale = 0.885
  const incrementScale = initScale - finalScale
  const scaleProgress = Math.min(1, current.value / scrollThreshold.value)
  const scale = initScale - incrementScale * scaleProgress

  const scroll = Math.min(0, scrollThreshold.value - current.value) * 0.5

  const opacity = 1 - (1 * current.value) / (vh.value * 0.4)

  gsap.set('.svg__macmillan, .svg__studio', { scale })
  gsap.set('.home__hero__content__hint', { opacity, y: toPx(current.value * 0.2) })
  gsap.set('.home__hero__content__studio__content', {
    y: toPx(current.value - (verticalGap.value + titleMargin.value) * scaleProgress + scroll),
  })
  gsap.set('.home__hero__content__macmillan', {
    y: toPx(current.value + scroll),
  })
})

watch([position, videoPlaying], () => {
  $scene.updateObject({
    id: 'reel',
    fixed: {
      from: 0,
      to: vh.value * scrollGap.value,
    },
    size: size.value,
    position: {
      x: videoPlaying.value ? position.value.x : -10000,
      y: videoPlaying.value ? position.value.y : 0,
    },
  })
})

onMounted(() => {
  videoEl.value?.addEventListener('play', onPlay)
  videoEl.value?.addEventListener('pause', onPause)
  !isInProjectEntered.value && videoEl.value?.play()
  $scene.addObject({
    id: 'reel',
    type: 'plane',
    fade: true,
    fixed: {
      from: 0,
      to: vh.value * scrollGap.value,
    },
    video: videoEl.value,
    position: { x: 0, y: 0 },
    size: { x: 0, y: 0, z: 0 },
    cursor: 'play',
    onClick: goToReel,
    multiplyColor: 'lightGrey',
  })
})

function enter(params: { el: HTMLElement }) {
  fadeIn({ el: params.el })
}

function goToReel() {
  updateInReel(true)
  disableScroll(true)
  $scene.updateObject({ id: 'reel', onClick: closeReel, cursor: 'close' })
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
  $scene.updateObject({ id: 'reel', onClick: goToReel, cursor: 'play' })
  if (videoEl.value) {
    videoEl.value.src = '/assets/video/short.webm'
    videoEl.value.setAttribute('type', 'video/webm')
    videoEl.value.muted = true
    videoEl.value.loop = true
    videoEl.value.play()
  }
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
    @include will-fade;

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
      will-change: opacity;
      p {
        color: var(--black);
        // padding-right: 24%;
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
