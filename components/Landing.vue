<template>
  <section class="landing">
    <div class="landing__content" v-transition:in="{ callback: enter }">
      <GridRuleOfThirds v-if="gridType === 'rule-of-thirds'" />

      <div class="landing__content__macmillan">
        <SvgMacMillan />
      </div>
      <div class="landing__content__studio">
        <SvgStudio />
      </div>
      <div class="landing__content__hint">
        <p>Delivering unique digital experiences implemented from the ground up.</p>
      </div>

      <video
        ref="videoEl"
        class="landing__content__video"
        width="1920"
        height="1080"
        muted
        autoplay
        loop>
        <source src="/assets/video/short.webm" type="video/webm" />
      </video>
    </div>
  </section>
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import useStore from '~/store/useStore'
import useScrollStore from '~/store/useScrollStore'
import { toPx } from '~/utils'
import { fadeIn } from '~/utils/animations'

const { $scene }: any = useNuxtApp()

const { gridType } = storeToRefs(useStore())
const { current } = storeToRefs(useScrollStore())

const { layoutIndent } = useCss()
const { lvw, vw, vh } = useResize()

const videoEl = ref<HTMLVideoElement>()

const verticalGap = computed<number>(() => lvw.value * 0.082)
const titleMargin = computed<number>(() => verticalGap.value * 0.5)
const titleMarginPx = computed<string>(() => toPx(titleMargin.value))
const scrollGap = computed<number>(() => 1)
const scrollProgress = computed<number>(() =>
  Math.min(1, current.value / (vh.value * scrollGap.value))
)

const size = computed<{ x: number; y: number; z: number }>(() => {
  const initWidth = lvw.value * 0.666666 - layoutIndent.value
  const finalWidth = lvw.value - layoutIndent.value * 2
  const incrementWidth = finalWidth - initWidth

  const initHeight = vh.value * 0.666666 - verticalGap.value
  const finalHeight = vh.value - layoutIndent.value * 2
  const incrementHeight = finalHeight - initHeight

  return {
    x: initWidth + incrementWidth * scrollProgress.value,
    y: initHeight + incrementHeight * scrollProgress.value,
    z: 1,
  }
})

const position = computed<{ x: number; y: number }>(() => {
  const gap = Math.min(0, lvw.value - vw.value) * -0.5

  const initY = verticalGap.value
  const finalY = layoutIndent.value
  const incrementY = finalY - initY

  const scroll = Math.min(0, vh.value * scrollGap.value - current.value)

  return {
    x: vw.value - layoutIndent.value - size.value.x - gap,
    y: initY + incrementY * scrollProgress.value + scroll,
  }
})

watch(current, () => {
  const threshold = verticalGap.value * 2.5

  const initScale = 1
  const finalScale = 0.885
  const incrementScale = initScale - finalScale
  const scaleProgress = Math.min(1, current.value / threshold)
  const scale = initScale - incrementScale * scaleProgress

  const scroll = Math.min(0, threshold - current.value) * 0.5

  const opacity = 1 - (1 * current.value) / (vh.value * 0.4)

  gsap.set('.svg__macmillan, .svg__studio', { scale })
  gsap.set('.landing__content__hint', { opacity, y: toPx(current.value * 0.2) })
  gsap.set('.landing__content__studio', {
    y: toPx(current.value - (verticalGap.value + titleMargin.value) * scaleProgress + scroll),
  })
  gsap.set('.landing__content__macmillan', {
    y: toPx(current.value + scroll),
  })
})

watch(position, () => {
  $scene.updateObject({
    id: 'landing-reel',
    size: size.value,
    position: position.value,
  })
})

function enter(params: { el: HTMLElement }) {
  fadeIn({ el: params.el })
  $scene.addObject({
    id: 'landing-reel',
    type: 'plane',
    video: videoEl.value,
    position: position.value,
    size: size.value,
  })
}

onUnmounted(() => {
  $scene.removeObject('landing-reel')
})
</script>

<style lang="scss">
.landing {
  background-color: var(--lime);
  padding-bottom: calc(var(--vh) * v-bind(scrollGap));

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
      width: var(--col);
      margin-right: calc(var(--col) * 2);
      padding-left: var(--layout-indent);
      svg {
        width: 127.77%;
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
      //   align-items: center;
      will-change: opacity;
      p {
        @include t-b1;
        color: var(--black);
        padding-right: 30%;
        height: max-content;
      }
    }

    &__video {
      position: absolute;
      top: 0;
      left: 0;
      width: 20rem;
      opacity: 0;
      pointer-events: none;
    }
  }
}
</style>
