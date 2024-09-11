<template>
  <header ref="el" class="header" v-transition:in="{ callback: enter }">
    <GridRuleOfThirds v-if="gridType === 'rule-of-thirds'" />

    <div class="header__hint">
      <SvgPixelArrow />
      <p class="header__hint__label">Independent Tech Lead ~ Developer</p>
    </div>

    <nav class="header__nav header__nav--main">
      <ul class="header__nav__list">
        <li class="header__nav__list__item">
          <CustomLink
            class="header__nav__list__item__anchor"
            type="referral"
            to="/#projects"
            label="Projects,"
            data-tab-fixed />
        </li>
        <li class="header__nav__list__item">
          <CustomLink
            class="header__nav__list__item__anchor"
            type="referral"
            to="/#services"
            label="Services,"
            data-tab-fixed />
        </li>
        <li class="header__nav__list__item">
          <CustomLink
            class="header__nav__list__item__anchor"
            type="referral"
            to="/#about"
            label="About"
            data-tab-fixed />
        </li>
      </ul>
    </nav>

    <nav class="header__nav header__nav--sub">
      <ul>
        <li class="header__nav__list__item">
          <CustomLink
            class="header__nav__list__item__anchor"
            to="/#contact"
            type="referral"
            label="Contact"
            data-tab-fixed />
        </li>
      </ul>
      <div class="header__nav__logo">
        <CustomLink to="/#hero" type="referral" :content="true" data-tab-fixed>
          <SvgLogo />
        </CustomLink>
      </div>
    </nav>
  </header>
</template>

<script lang="ts" setup>
import { gsap } from 'gsap'
import { storeToRefs } from 'pinia'
import useStore from '~/store/useStore'
import useScrollStore from '~/store/useScrollStore'
import { shuffleElsIn, shuffleElsOut } from '~/utils/animations'
import { toPx, toPercentage } from '~/utils'

const { gridType, isInProject } = storeToRefs(useStore())
const { current, bounding } = storeToRefs(useScrollStore())

const { vw, vh } = useResize()
const { layoutMargin } = useCss()

const el = ref<HTMLElement>()

watch(current, () => {
  update()
})

watch(isInProject, () => {
  isInProject.value ? leave() : enter()
})

function enter() {
  if (!el.value) return
  update()
  gsap.set(el.value, { pointerEvents: 'auto' })
  const els = el.value.querySelectorAll('.header__hint ,.header__nav__list__item__anchor')
  shuffleElsIn({ els })
}

function leave() {
  if (!el.value) return
  gsap.set(el.value, { pointerEvents: 'none' })
  const els = el.value.querySelectorAll('.header__hint ,.header__nav__list__item__anchor')
  shuffleElsOut({ els })
}

function update() {
  if (!el.value) return
  const y = Math.min(0, bounding.value - vh.value - current.value)

  const threshold = vh.value - layoutMargin.value * 2
  const progress = Math.min(1, current.value / vh.value)

  const target = Math.min(vw.value, vh.value)

  const targetWidth = 160
  const targetScale = targetWidth / (target * 0.8)

  const lx = (vw.value * -0.5 + target * 0.4) * progress
  const ly = (vh.value * -0.5 + target * 0.4) * progress

  gsap.set(el.value, { y: toPx(y) })
  // gsap.set('.header__nav__logo', { y: toPx(threshold * progress * -1) })
  gsap.set('.header__nav__logo .custom-link', {
    // y: toPercentage(100 * progress),
    x: lx,
    y: ly,
    scale: targetScale + (1 - targetScale) * progress,
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
      width: toScale(2rem);
    }
  }

  &__nav {
    &--sub {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;

      padding-right: var(--layout-margin);
    }

    &__list {
      display: flex;
      column-gap: 0.8rem;

      &__item {
        &__anchor {
          color: var(--black);
          @include will-fade;
          @include t-b1;
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
        width: calc(var(--vh) * 0.8);
        height: calc(var(--vh) * 0.8);
        will-change: transform;
        transform-origin: bottom right;
        .svg__logo {
          width: 100%;
        }
      }
    }
  }
}
</style>
