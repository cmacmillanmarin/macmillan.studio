<template>
  <header ref="el" class="header">
    <GridRuleOfThirds v-if="gridType === 'rule-of-thirds'" />

    <div class="header__top" />

    <div v-show="!isMobileLayout" class="header__hint">
      <button
        ref="scrollDownButtonEl"
        @click="scrollDown"
        @mouseenter="onScrollDownMouseEnter"
        @mouseleave="onScrollDownMouseLeave"
        data-tab-fixed
        :tabindex="landingTabIndex"
        aria-label="Scroll down"
        class="header__hint__button">
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
          <button aria-label="Mobile button" @click="onMobileButtonClick">
            <transition
              mode="out-in"
              :css="false"
              :appear="true"
              @enter="transitionShuffleIn"
              @leave="transitionDone">
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

const { $three }: any = useNuxtApp()

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
const scrollDownButtonEl = ref<HTMLElement>()
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
  $three.logo.updateState(logoVisible.value)
})

watch([current, header, headerOverlay, isInProject, isInReel, mobileButton], async () => {
  current.value === 0 && !isInProject.value && onScrollDownMouseEnter()
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

// The header docks to the bottom of the viewport, so its offsets depend on the viewport
// size and on the scroll bounding as much as on the scroll position. In-app browsers
// (Instagram, Facebook) resize the webview once their chrome settles, right after load:
// watching `current` alone left the logo and the nav links placed with the stale height
// until the first scroll moved them.
watch([current, vh, vw, bounding], updateLayout)

// Scrolling back into the first half of the hero re-opens the header. This has to stay on
// the scroll path alone: it is the same gate the hero opens when its intro ends, so running
// it from a viewport measurement would shuffle the links and the logo in ahead of time.
watch(current, () => {
  if (current.value <= vh.value * 0.5) updateHeader(true)
})

function updateLayout(): void {
  // bounding is 0 until the virtual scroller has measured the page; running before that
  // would resolve `y` to -vh and push the header a full viewport up.
  if (!el.value || bounding.value === 0) return
  const y = Math.min(0, bounding.value - vh.value - current.value)

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
      // The centering is declared rather than inherited from the CSS translateX(-50%):
      // gsap only recovers that percentage when it can match half the element's offsetWidth,
      // and the button is display:none (v-show) until the logo shows, so it would otherwise
      // cache xPercent 0 and leave the hit area half a logo off the 3D one.
      xPercent: -50,
      x: toPx(x * progress),
      y: toPx(y * progress + leaveDistance * leaveProgress),
    })
  }
}

function enterLinks() {
  if (!el.value) return
  entered.value = true
  gsap.set(el.value, { pointerEvents: 'auto' })
  const links =
    el.value.querySelectorAll('.header__bottom, .header__link__anchor, .header__nav--scroll') || []
  const hints = el.value.querySelectorAll('.header__hint__label, .header__hint__button') || []
  shuffleElsIn({ els: hints, fast: true })
  shuffleElsIn({ els: links, fast: true })
}

function leaveLinks() {
  if (!el.value) return
  gsap.set(el.value, { pointerEvents: 'none' })
  const links =
    el.value.querySelectorAll('.header__bottom, .header__link__anchor, .header__nav--scroll') || []
  const hints = el.value.querySelectorAll('.header__hint__label, .header__hint__button') || []
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
  $three.logo.rotate(Math.PI * 2)
  updateHeaderLogo(true)
  updateCursor('none')
}

function onMouseLeave() {
  $three.logo.rotate(Math.PI)
  updateHeaderLogo(false)
  updateCursor('default')
}

function onScrollDownMouseEnter(e?: MouseEvent) {
  if (!scrollDownButtonEl.value) return
  !!e && updateCursor('none')
  gsap.set(scrollDownButtonEl.value, { opacity: 0 })
  shuffleIn({ el: scrollDownButtonEl.value })
}

function onScrollDownMouseLeave() {
  updateCursor('default')
}

function onMobileButtonClick(e: MouseEvent | TouchEvent) {
  e.preventDefault()
  e.stopPropagation()
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
    // column-gap: 0.8rem;
    transform: translate(toScale(-0.4rem), toScale(0.2rem));
    padding-left: var(--layout-margin);

    p {
      // @include t-b1--bold;
      @include t-b1;
    }

    &__button {
      display: block;
      padding: toScale(0.8rem);
      border: none;
      width: max-content;
      @include will-fade;
      .svg__pixel-arrow {
        width: toScale(2.4rem);
        transform: translateY(toScale(0.05rem));
      }
    }
    &__label {
      @include will-fade;
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
