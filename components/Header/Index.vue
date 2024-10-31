<template>
  <header ref="el" class="header">
    <GridRuleOfThirds v-if="gridType === 'rule-of-thirds'" />

    <div class="header__top" />

    <div class="header__hint">
      <SvgPixelArrow />
      <p class="header__hint__label">Independent Tech Lead ~ Developer</p>
    </div>

    <nav class="header__nav--main">
      <ul class="header__nav__list">
        <HeaderLink
          label="Projects,"
          to="/#projects"
          :active="section === 'projects' && !isInProject && entered" />
        <HeaderLink
          label="Services,"
          to="/#services"
          :active="section === 'services' && !isInProject && entered" />
        <HeaderLink
          label="About"
          to="/#about"
          :active="section.includes('about') && !isInProject && entered" />
      </ul>
    </nav>

    <nav class="header__nav--sub">
      <ul class="header__nav__list">
        <HeaderLink
          label="Contact"
          to="/#contact"
          :active="section === 'contact' && !isInProject && entered" />
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

    <div class="header__bottom" />
  </header>
</template>

<script lang="ts" setup>
import { gsap } from 'gsap'
import { storeToRefs } from 'pinia'
import useStore from '~/store/useStore'
import useScrollStore from '~/store/useScrollStore'
import { shuffleElsIn, shuffleElsOut } from '~/utils/animations'
import { toPx, toPercentage } from '~/utils'

const { $scene }: any = useNuxtApp()

const { section, gridType, isInProject, isInReel } = storeToRefs(useStore())
const { current, bounding, disabled } = storeToRefs(useScrollStore())

const { vh } = useResize()
const { layoutMargin } = useCss()

const el = ref<HTMLElement>()
const entered = ref<boolean>(false)

watch(disabled, () => {
  !disabled.value && !entered.value && enter()
})

watch(current, () => {
  if (!el.value) return
  const y = Math.min(0, bounding.value - vh.value - current.value)

  const threshold = vh.value - layoutMargin.value * 2
  const progress = Math.min(1, current.value / vh.value)

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
  const links = el.value.querySelectorAll('.header__bottom, .header__link__anchor') || []
  const hints = el.value.querySelectorAll('.header__hint') || []
  shuffleElsIn({ els: hints, fast: true })
  shuffleElsIn({ els: links, fast: true })
  $scene.updateLogoState(true)
}

function leave() {
  if (!el.value) return
  gsap.set(el.value, { pointerEvents: 'none' })
  const links = el.value.querySelectorAll('.header__bottom, .header__link__anchor') || []
  const hints = el.value.querySelectorAll('.header__hint') || []
  shuffleElsOut({ els: hints, fast: true })
  shuffleElsOut({ els: links, fast: true })
  $scene.updateLogoState(false)
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
    width: var(--col);
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

    &__list {
      display: flex;
      column-gap: 0.8rem;

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
