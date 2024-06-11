<template>
  <section class="home__hero" id="hero-target" data-scroll-target-top>
    <h1 class="home__hero__title">{{ data.title }}</h1>
    <div class="home__hero__content" v-transition:in="{ callback: enter }">
      <GridRuleOfThirds v-if="gridType === 'rule-of-thirds'" />

      <div class="home__hero__content__macmillan">
        <SvgMacMillan />
      </div>
      <ClientOnly>
        <Teleport to="#top-layer">
          <div class="home__hero__content__studio">
            <SvgStudio />
          </div>
        </Teleport>
      </ClientOnly>

      <div class="home__hero__content__hint">
        <p>{{ data.hint }}</p>
      </div>

      <video ref="videoEl" class="home__hero__content__video" width="1920" height="1080" muted loop>
        <source src="/assets/video/short.webm" type="video/webm" />
      </video>
    </div>
    <div class="home__hero__bg" />
    <div class="home__hero__reel-target" id="reel-target" data-scroll-target-top />
  </section>
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import useStore from '~/store/useStore'
import useScrollStore from '~/store/useScrollStore'
import { toPx, round } from '~/utils'
import { fadeIn } from '~/utils/animations'
import type { Hero } from '~/types/data'

defineProps<{
  data: Hero
}>()

const { $scene }: any = useNuxtApp()

const { gridType } = storeToRefs(useStore())
const { current } = storeToRefs(useScrollStore())

const { layoutIndent } = useCss()
const { lvw, vw, vh } = useResize()

const videoEl = ref<HTMLVideoElement>()
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
  const initWidth = lvw.value * 0.666666 - layoutIndent.value
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
    layoutIndent.value -
    size.value.x -
    incrementGap * (scrollProgress.value - 1) +
    layoutIndent.value * scrollProgress.value

  const initY = verticalGap.value
  const finalY = 0
  const incrementY = finalY - initY

  return {
    x: x,
    y: initY + incrementY * scrollProgress.value,
  }
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
  gsap.set('.home__hero__content__studio', {
    y: toPx(current.value - (verticalGap.value + titleMargin.value) * scaleProgress + scroll),
  })
  gsap.set('.home__hero__content__macmillan', {
    y: toPx(current.value + scroll),
  })
  // gsap.set('.home__hero__bg', { opacity: scrollProgress.value === 1 ? 1 : 0 })
})

watch(position, () => {
  if (videoPlaying.value) {
    $scene.updateObject({
      id: 'reel',
      fixed: {
        from: 0,
        to: vh.value * scrollGap.value,
      },
      size: size.value,
      position: position.value,
    })
  }
})

function enter(params: { el: HTMLElement }) {
  fadeIn({ el: params.el })
}

function onPlay() {
  $scene.addObject({
    id: 'reel',
    type: 'plane',
    fixed: {
      from: 0,
      to: vh.value * scrollGap.value,
    },
    video: videoEl.value,
    position: position.value,
    size: size.value,
  })
  videoPlaying.value = true
}

onMounted(() => {
  videoEl.value?.addEventListener('play', onPlay)
  videoEl.value?.play()
})

onUnmounted(() => {
  $scene.removeObject('reel')
  $scene.destroy()
})
</script>

<style lang="scss">
.home__hero {
  position: relative;
  background-color: var(--lime);
  padding-bottom: calc(var(--vh) * v-bind(scrollGap));

  &__title {
    @include t-seo;
  }

  &__content {
    @include will-fade;

    position: relative;
    height: var(--vh);

    @include grid('rule-of-thirds');
    align-content: flex-start;

    &__macmillan {
      width: calc(var(--col) * 2);
      margin-left: var(--col);
      padding-right: var(--layout-indent);
      margin-bottom: v-bind(titleMarginPx);
      will-change: transform;
      svg {
        will-change: transform;
        transform-origin: top right;
      }
    }

    &__studio {
      pointer-events: auto;
      width: calc(min(100vw, var(--layout-max-width)) * 0.333333);
      padding-top: v-bind(verticalGapPx);
      padding-left: var(--layout-indent);
      @include from__desktop--x-large {
        margin-left: calc((100vw - var(--layout-max-width)) * 0.5);
      }
      svg {
        width: 127.9%;
        will-change: transform;
        transform-origin: top left;
      }
    }

    &__hint {
      position: absolute;
      top: calc(var(--col) * 3 - #{toScale(16rem)} - var(--layout-indent));
      left: var(--col);
      height: var(--col);
      width: var(--col);
      display: flex;
      will-change: opacity;
      p {
        @include t-b1;
        color: var(--black);
        padding-right: 24%;
        height: max-content;
      }
    }

    &__video {
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

  &__bg {
    @include will-fade;
    @include absolute-fill;
    background-color: var(--light-grey);
  }
}
</style>
