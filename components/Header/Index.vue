<template>
  <header ref="el" class="header">
    <GridRuleOfThirds v-if="gridType === 'rule-of-thirds'" />

    <div class="header__top" />

    <div v-show="!isMobileLayout" class="header__hint">
      <button
        @click="scrollDown"
        data-tab-fixed
        :tabindex="landingTabIndex"
        aria-label="Scroll down">
        <SvgPixelArrow />
      </button>
      <p class="header__hint__label">Independent Tech Lead—Developer</p>
    </div>

    <ClientOnly>
      <nav class="header__nav--main">
        <ul class="header__nav__list">
          <HeaderLink
            v-for="({ label, slug }, i) in links"
            :to="`/#${slug}`"
            :label="`${label}${i === links.length - 1 ? '' : ','}`"
            :active="section === slug && activeDots"
            :tabindex="landingTabIndex" />
        </ul>
      </nav>
    </ClientOnly>

    <nav v-show="!isMobileLayout" class="header__nav--sub">
      <ul class="header__nav__list">
        <HeaderLink
          label="Contact"
          to="/#contact"
          :active="section === 'contact' && !activeDots"
          :tabindex="landingTabIndex" />
      </ul>
      <div v-show="logoVisible" class="header__nav__logo">
        <CustomLink
          to="/#hero"
          type="referral"
          :content="true"
          aria-label="MacMillan Studio logo"
          data-tab-fixed
          :tabindex="landingTabIndex"
          @mouseenter="onMouseEnter"
          @mouseleave="onMouseLeave" />
      </div>
    </nav>

    <ClientOnly>
      <nav v-if="isMobileLayout" class="header__nav--scroll">
        <button @click="scrollDown" :tabindex="landingTabIndex">
          <SvgPixelArrow />
        </button>
      </nav>

      <nav
        v-if="isMobileLayout"
        v-show="!isInProject && logoVisible"
        ref="logoMobileEl"
        class="header__nav__logo--mobile">
        <button @click="scrollUp" :tabindex="landingTabIndex" aria-label="Scroll up" />
      </nav>

      <transition mode="out-in" :css="false" @enter="mobileButtonEnter" @leave="mobileButtonLeave">
        <nav v-if="mobileButton" class="header__nav--mobile">
          <button aria-label="Mobile button">
            <transition
              mode="out-in"
              :css="false"
              :appear="true"
              @enter="transitionShuffleIn"
              @leave="transitionDone"
              @click="onMobileButtonClick"
              :tabindex="landingTabIndex">
              <SvgDots v-if="mobileButtonIcon && !headerOverlay && !isInProject && !isInReel" />
              <SvgAspa v-else-if="!inProjectNextProjectInView" />
              <SvgPixelArrow v-else />
            </transition>
          </button>
        </nav>
      </transition>
      <HeaderMobileOverlay v-if="headerOverlay" :data="links" @close="toggleMobileOverlay" />
    </ClientOnly>

    <div class="header__bottom" />
  </header>
</template>

<script lang="ts" setup>
import { gsap } from 'gsap/gsap-core'
import { storeToRefs } from 'pinia'
import useStore from '~/store/useStore'
import useScrollStore from '~/store/useScrollStore'
import {
  shuffleElsIn,
  shuffleElsOut,
  transitionShuffleIn,
  transitionDone,
} from '~/utils/animations'
import { type HeaderLinks } from '~/types/front'
import { toPx, toPercentage } from '~/utils'

const { $scene }: any = useNuxtApp()

const store = useStore()
const { updateHeader, updateHeaderLogo, updateCursor, headerButtonClicked, updateHeaderOverlay } =
  store
const {
  header,
  headerOverlay,
  section,
  gridType,
  isInProject,
  isInReel,
  inProjectNextProjectInView,
  landingTabIndex,
} = storeToRefs(store)

const scrollStore = useScrollStore()
const { updateScrollTarget } = scrollStore
const { current, bounding } = storeToRefs(scrollStore)

const { vw, vh } = useResize()
const { isMobileLayout } = useDevice()
const { layoutMargin, toScale } = useCss()

const links = computed<HeaderLinks>(() => {
  const links = [
    { label: 'Projects', slug: 'projects' },
    { label: 'Services', slug: 'services' },
    { label: 'About', slug: 'about' },
  ]
  isMobileLayout.value && links.push({ label: 'Contact', slug: 'contact' })
  return links
})

const el = ref<HTMLElement>()
const logoMobileEl = ref<HTMLElement>()
const entered = ref<boolean>(false)
const logoVisible = ref<boolean>(false)
const linksVisible = ref<boolean>(false)
const mobileButton = ref<boolean>(false)
const mobileButtonIcon = ref<boolean>(false)
const activeDots = computed<boolean>(
  () => !isInProject.value && entered.value && !mobileButton.value
)

watch(linksVisible, () => {
  linksVisible.value ? enterLinks() : leaveLinks()
})

watch(logoVisible, () => {
  $scene.updateLogoState(logoVisible.value)
})

watch([current, header, headerOverlay, isInProject, isInReel, mobileButton], async () => {
  mobileButton.value = isMobileLayout.value && (current.value > vh.value * 0.5 || isInProject.value)
  isMobileLayout.value && (await nextTick())
  logoVisible.value = !isInProject.value && !isInReel.value && !headerOverlay.value
  linksVisible.value =
    header.value &&
    !isInProject.value &&
    !isInReel.value &&
    !mobileButton.value &&
    !headerOverlay.value
})

watch(current, () => {
  if (!el.value) return
  const y = Math.min(0, bounding.value - vh.value - current.value)

  if (current.value <= vh.value * 0.5) updateHeader(true)

  const threshold = vh.value - layoutMargin.value * 2
  const enterProgress = Math.min(1, current.value / vh.value)

  const leaveInit = bounding.value - vh.value
  const leaveEnd = !isMobileLayout.value
    ? bounding.value - layoutMargin.value * 2 - 160
    : bounding.value - layoutMargin.value - 56
  const leaveDistance = leaveEnd - leaveInit
  const leaveProgress = Math.max(
    0,
    Math.min(1, (current.value - leaveInit) / (leaveEnd - leaveInit))
  )

  const progress = enterProgress

  gsap.set(el.value, { y: toPx(y) })
  gsap.set('.header__nav__logo', {
    y: toPx(threshold * progress * -1 + leaveDistance * leaveProgress),
  })
  gsap.set('.header__nav__logo .custom-link', {
    y: toPercentage(100 * progress),
    scale: 1 - 0.75 * progress + 0.75 * leaveProgress,
  })

  if (logoMobileEl.value) {
    const scale = 1 - (1 - 0.416666) * progress
    const x = vw.value * 0.5 - 96 * 0.5 - layoutMargin.value
    const y = (vh.value - layoutMargin.value * 2 - toScale(75) - 96) * -1
    gsap.set(logoMobileEl.value, {
      scale,
      x: toPx(x * progress),
      y: toPx(y * progress + leaveDistance * leaveProgress),
    })
  }
})

function enterLinks() {
  if (!el.value) return
  entered.value = true
  gsap.set(el.value, { pointerEvents: 'auto' })
  const links =
    el.value.querySelectorAll('.header__bottom, .header__link__anchor, .header__nav--scroll') || []
  const hints = el.value.querySelectorAll('.header__hint') || []
  shuffleElsIn({ els: hints, fast: true })
  shuffleElsIn({ els: links, fast: true })
}

function leaveLinks() {
  if (!el.value) return
  gsap.set(el.value, { pointerEvents: 'none' })
  const links =
    el.value.querySelectorAll('.header__bottom, .header__link__anchor, .header__nav--scroll') || []
  const hints = el.value.querySelectorAll('.header__hint') || []
  shuffleElsOut({ els: hints, fast: true })
  shuffleElsOut({ els: links, fast: true })
}

function mobileButtonEnter(el: Element, done: () => void) {
  gsap.killTweensOf(el)
  gsap.to(el, {
    scale: 1,
    delay: logoVisible.value ? 1 : 0,
    duration: 0.4,
    onStart: () => {
      mobileButtonIcon.value = true
    },
    onComplete: () => {
      done()
    },
  })
}

function mobileButtonLeave(el: Element, done: () => void) {
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

function onMouseEnter() {
  updateHeaderLogo(true)
  updateCursor('none')
}

function onMouseLeave() {
  updateHeaderLogo(false)
  updateCursor('default')
}

function onMobileButtonClick() {
  if (!isInProject.value && !isInReel.value) toggleMobileOverlay()
  else headerButtonClicked()
}

function toggleMobileOverlay() {
  updateHeaderOverlay(!headerOverlay.value)
  if (headerOverlay.value && current.value > bounding.value - vh.value) {
    updateScrollTarget(bounding.value - vh.value)
  }
}

function scrollUp(e: MouseEvent | TouchEvent) {
  e.preventDefault()
  e.stopPropagation()
  updateScrollTarget(0)
}

function scrollDown() {
  updateScrollTarget(vh.value * 2)
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

    button {
      display: block;
      padding: 0;
      border: none;
      width: max-content;
      .svg__pixel-arrow {
        width: toScale(2.4rem);
      }
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
      padding-top: toScale(2rem, 37.5rem);
      @include will-fade;
      button {
        display: block;
        padding: 0;
        border: none;
        width: max-content;
        .svg__pixel-arrow {
          width: toScale(2.4rem, 37.5rem);
          display: block;
        }
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
        .svg__pixel-arrow {
          transform: translateY(10%);
          path {
            fill: var(--lime);
          }
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

      &--mobile {
        position: absolute;
        left: 50%;
        bottom: calc(var(--layout-margin) + toScale(7.5rem, 37.5rem));
        width: 9.6rem;
        height: 9.85rem;

        transform: translateX(-50%);
        transform-origin: top right;
        will-change: transform;
        // border: 1px solid red;

        button {
          display: block;
          width: 100%;
          height: 100%;
          padding: 0;
          border: none;
          pointer-events: auto;
        }
      }

      .custom-link {
        position: absolute;
        bottom: -0.3rem;
        right: 0;
        display: block;
        width: 16.1rem;
        height: 16.3rem;
        will-change: transform;
        transform-origin: top right;
        // border: 1px solid red;
      }
    }
  }

  &__top,
  &__bottom {
    pointer-events: none;
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
