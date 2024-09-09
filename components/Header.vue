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
        <CustomLink
          class="header__nav__list__item__anchor"
          to="/#hero"
          type="referral"
          :content="true"
          data-tab-fixed>
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

const { vh } = useResize()
const { layoutMargin } = useCss()

const el = ref<HTMLElement>()

watch(current, () => {
  if (!el.value) return
  const y = Math.min(0, bounding.value - vh.value - current.value)

  const threshold = vh.value - layoutMargin.value * 2
  const progress = Math.min(1, current.value / vh.value)

  gsap.set(el.value, { y: toPx(y) })
  gsap.set('.header__nav__logo', { y: toPx(threshold * progress * -1) })
  gsap.set('.header__nav__logo svg', { y: toPercentage(100 * progress), scale: 1 - 0.8 * progress })
})

watch(isInProject, () => {
  isInProject.value ? leave() : enter()
})

function enter() {
  if (!el.value) return
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

      .svg__logo {
        position: absolute;
        bottom: 0;
        right: 0;
        width: 16rem;

        will-change: transform;
        transform-origin: top right;
      }
    }
  }
}
</style>
