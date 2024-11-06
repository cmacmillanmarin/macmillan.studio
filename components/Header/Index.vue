<template>
  <header ref="el" class="header">
    <GridRuleOfThirds v-if="gridType === 'rule-of-thirds'" />

    <div class="header__top" />

    <div v-show="!isMobileLayout" class="header__hint">
      <SvgPixelArrow />
      <p class="header__hint__label">Independent Tech Lead ~ Developer</p>
    </div>

    <ClientOnly>
      <nav class="header__nav--main">
        <ul class="header__nav__list">
          <HeaderLink
            label="Projects,"
            to="/#projects"
            :active="section === 'projects' && activeDots" />
          <HeaderLink
            label="Services,"
            to="/#services"
            :active="section === 'services' && activeDots" />
          <HeaderLink
            :label="`About${isMobileLayout ? ',' : ''}`"
            to="/#about"
            :active="section.includes('about') && activeDots" />
          <HeaderLink
            v-if="isMobileLayout"
            label="Contact"
            to="/#contact"
            :active="section.includes('contact') && activeDots" />
        </ul>
      </nav>
    </ClientOnly>

    <nav v-show="!isMobileLayout" class="header__nav--sub">
      <ul class="header__nav__list">
        <HeaderLink label="Contact" to="/#contact" :active="section === 'contact' && !activeDots" />
      </ul>
      <div class="header__nav__logo">
        <CustomLink
          to="/#hero"
          type="referral"
          :content="true"
          aria-label="MacMillan Studio logo"
          data-tab-fixed>
          <SvgLogo />
        </CustomLink>
      </div>
    </nav>
    <ClientOnly>
      <nav v-if="isMobileLayout" class="header__nav--scroll">
        <NuxtLink to="/#projects">
          <SvgPixelArrow />
        </NuxtLink>
      </nav>
      <transition mode="out-in" :css="false" @enter="mobileEnter" @leave="mobileLeave">
        <nav v-if="mobileButton" class="header__nav--mobile">
          <button>
            <transition
              mode="out-in"
              :css="false"
              @enter="transitionShuffleIn"
              @leave="transitionDone">
              <SvgDots v-if="mobileButtonIcon" />
            </transition>
          </button>
        </nav>
      </transition>
    </ClientOnly>

    <div class="header__bottom" />
  </header>
</template>

<script lang="ts" setup>
import { gsap } from 'gsap'
import { storeToRefs } from 'pinia'
import useStore from '~/store/useStore'
import useScrollStore from '~/store/useScrollStore'
import {
  shuffleElsIn,
  shuffleElsOut,
  transitionShuffleIn,
  transitionDone,
} from '~/utils/animations'
import { toPx, toPercentage } from '~/utils'

const { $scene }: any = useNuxtApp()

const { header, section, gridType, isInProject, isInReel } = storeToRefs(useStore())
const { current, bounding } = storeToRefs(useScrollStore())

const { vh } = useResize()
const { isMobileLayout } = useDevice()
const { layoutMargin } = useCss()

const el = ref<HTMLElement>()
const entered = ref<boolean>(false)
const mobileButton = ref<boolean>(false)
const mobileButtonIcon = ref<boolean>(false)
const activeDots = computed<boolean>(
  () => !isInProject.value && entered.value && !mobileButton.value
)

watch(header, () => {
  header.value && !entered.value && enter()
})

watch(mobileButton, () => {
  mobileButton.value ? leave() : enter()
})

watch(current, () => {
  if (!el.value) return
  const y = Math.min(0, bounding.value - vh.value - current.value)

  const threshold = vh.value - layoutMargin.value * 2
  const progress = Math.min(1, current.value / vh.value)

  mobileButton.value =
    isMobileLayout.value && current.value > vh.value * 0.5 && !isInProject.value && !isInReel.value

  gsap.set(el.value, { y: toPx(y) })
  gsap.set('.header__nav__logo', { y: toPx(threshold * progress * -1) })
  gsap.set('.header__nav__logo .custom-link', {
    y: toPercentage(100 * progress),
    scale: 1 - 0.75 * progress,
  })
})

watch([isInProject, isInReel], () => {
  if (!entered.value) return
  isInProject.value || isInReel.value ? leave() : enter()
})

function enter() {
  if (!el.value) return
  entered.value = true
  gsap.set(el.value, { pointerEvents: 'auto' })
  const links =
    el.value.querySelectorAll('.header__bottom, .header__link__anchor, .header__nav--scroll') || []
  const hints = el.value.querySelectorAll('.header__hint') || []
  shuffleElsIn({ els: hints, fast: true })
  shuffleElsIn({ els: links, fast: true })
  $scene.updateLogoState(true)
}

function leave() {
  if (!el.value) return
  gsap.set(el.value, { pointerEvents: 'none' })
  const links =
    el.value.querySelectorAll('.header__bottom, .header__link__anchor, .header__nav--scroll') || []
  const hints = el.value.querySelectorAll('.header__hint') || []
  shuffleElsOut({ els: hints, fast: true })
  shuffleElsOut({ els: links, fast: true })
  !isMobileLayout.value && $scene.updateLogoState(false)
}

function mobileEnter(el: Element, done: () => void) {
  gsap.killTweensOf(el)
  gsap.to(el, {
    scale: 1,
    delay: 1,
    duration: 0.4,
    onStart: () => {
      mobileButtonIcon.value = true
    },
    onComplete: () => {
      done()
    },
  })
}

function mobileLeave(el: Element, done: () => void) {
  gsap.killTweensOf(el)
  gsap.to(el, {
    scale: 0,
    duration: 0.3,
    onComplete: () => {
      mobileButtonIcon.value = false
      done()
    },
  })
}
</script>

<style lang="scss">
.header {
  align-items: flex-end;
  padding-bottom: var(--layout-margin);
  pointer-events: none;

  @include grid('rule-of-thirds');

  &__hint,
  &__nav {
    width: 100%;

    @include from__tablet--landscape {
      width: var(--col);
    }
  }

  &__hint {
    display: flex;
    align-items: center;
    column-gap: 0.8rem;
    padding-left: var(--layout-margin);

    @include will-fade;

    p {
      @include t-b1;
    }

    .svg__pixel-arrow {
      width: toScale(2.4rem);
    }
  }

  &__nav {
    &--main {
      @extend .header__nav;
    }

    &--sub {
      @extend .header__nav;
      display: flex;
      align-items: flex-end;
      justify-content: space-between;

      padding-right: var(--layout-margin);
    }

    &--scroll {
      display: flex;
      width: 100%;
      justify-content: center;
      padding-top: toScale(2.4rem, 37.5rem);
      @include will-fade;
      .svg__pixel-arrow {
        width: toScale(2.4rem, 37.5rem);
        display: block;
      }
    }

    &--mobile {
      z-index: 9;
      position: absolute;
      bottom: var(--layout-margin);
      left: 50%;
      transform: translate(-50%, 0) scale(0);
      will-change: transform;
      pointer-events: auto;
      button {
        background-color: var(--black);
        border-radius: 100%;
        padding: 0;
        border: none;
        width: toScale(5.6rem, 37.5rem);
        height: toScale(5.6rem, 37.5rem);
        display: flex;
        justify-content: center;
        align-items: center;
        svg {
          @include will-fade;
        }
      }
    }

    &__list {
      display: flex;
      justify-content: center;
      column-gap: toScale(0.4rem, 37.5rem);

      @include from__tablet--landscape {
        justify-content: flex-start;
        column-gap: toScale(0.8rem);
      }

      .header__link {
        &__anchor {
          @include will-fade;
        }
      }
    }

    &__logo {
      position: relative;
      will-change: transform;

      .custom-link {
        position: absolute;
        bottom: 0;
        right: 0;
        display: block;
        width: 16rem;
        height: 16rem;
        will-change: transform;
        transform-origin: top right;

        .svg__logo {
          width: 16rem;
          @include will-fade;
        }
      }
    }
  }

  &__top,
  &__bottom {
    position: absolute;
    padding: var(--layout-margin);
  }

  &__top {
    left: 0;
    bottom: 0;
    height: var(--vh);
  }

  &__bottom {
    right: 0;
    bottom: 0;
    @include will-fade;
  }
}
</style>
