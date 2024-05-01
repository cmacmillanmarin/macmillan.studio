<template>
  <header ref="el" class="header" v-transition:in="{ callback: fadeIn }">
    <GridRuleOfThirds v-if="gridType === 'rule-of-thirds'" />

    <div class="header__hint">
      <p><SvgPixelArrow /> Independent Development Studio</p>
    </div>

    <nav class="header__nav header__nav--main">
      <ul class="header__nav__list">
        <!-- <li class="header__nav__list__item">
          <CustomLink class="header__nav__list__item__anchor" label="Site in development" />
        </li> -->
        <!-- <li class="header__nav__list__item">
          <CustomLink class="header__nav__list__item__anchor" label="Projects," />
        </li>
        <li class="header__nav__list__item">
          <CustomLink class="header__nav__list__item__anchor" label="Services," />
        </li>
        <li class="header__nav__list__item">
          <CustomLink class="header__nav__list__item__anchor" label="About" />
        </li> -->
      </ul>
    </nav>

    <nav class="header__nav header__nav--sub">
      <ul>
        <li class="header__nav__list__item">
          <CustomLink
            class="header__nav__list__item__anchor"
            to="/#contact"
            type="referral"
            label="Contact" />
        </li>
      </ul>
      <div class="header__nav__logo">
        <SvgLogo />
      </div>
    </nav>
  </header>
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import useStore from '~/store/useStore'
import useScrollStore from '~/store/useScrollStore'
import { fadeIn } from '~/utils/animations'
import { toPx, toPercentage } from '~/utils'

const { gridType } = storeToRefs(useStore())
const { current, bounding } = storeToRefs(useScrollStore())

const { vh } = useResize()
const { layoutIndent } = useCss()

const el = ref<HTMLElement>()

watch(current, () => {
  const y = Math.min(0, bounding.value - vh.value - current.value)

  const threshold = vh.value - layoutIndent.value * 2
  const progress = Math.min(1, current.value / vh.value)

  gsap.set(el.value, { y: toPx(y) })
  gsap.set('.header__nav__logo', { y: toPx(threshold * progress * -1) })
  gsap.set('.header__nav__logo svg', { y: toPercentage(100 * progress), scale: 1 - 0.8 * progress })
})
</script>

<style lang="scss">
.header {
  @include will-fade;

  @include grid('rule-of-thirds');
  align-items: flex-end;

  padding-bottom: var(--layout-indent);

  &__hint,
  &__nav {
    width: var(--col);
  }

  &__hint {
    padding-left: var(--layout-indent);
    p {
      @include t-b1;
    }
    .svg__pixel-arrow {
      width: 2rem;
    }
  }

  &__nav {
    &--sub {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;

      padding-right: var(--layout-indent);
    }

    &__list {
      display: flex;
      column-gap: 0.8rem;
      &__item {
        &__anchor {
          @include t-b1;
          color: black;
        }
      }
    }

    &__logo {
      will-change: transform;
      .svg__logo {
        width: 16rem;

        will-change: transform;
        transform-origin: top right;
      }
    }
  }
}
</style>
