<template>
  <li ref="el" class="header__link">
    <CustomLink
      class="header__link__anchor"
      type="referral"
      :to="to"
      :label="label"
      @mouseenter="!touch ? onMouseEnter() : () => {}"
      data-tab-fixed
      :tabindex="tabindex" />
    <transition
      mode="out-in"
      :css="false"
      @enter="transitionShuffleIn"
      @leave="transitionShuffleOut">
      <SvgSquare v-if="active" class="header__link__active" />
    </transition>
  </li>
</template>

<script lang="ts" setup>
import { gsap } from 'gsap/gsap-core'
import { shuffleElsIn, transitionShuffleIn, transitionShuffleOut } from '~/utils/animations'

defineProps<{
  label: string
  to: string
  active: boolean
  tabindex?: number
}>()

const { touch } = useDevice()

const el = ref<HTMLElement>()

function onMouseEnter() {
  const linkEl = el.value?.querySelector('.header__link__anchor')
  if (linkEl) {
    gsap.set(linkEl, { opacity: 0 })
    shuffleElsIn({ els: [linkEl] })
  }
}
</script>

<style lang="scss">
.header__link {
  position: relative;

  &__anchor {
    color: var(--black);
    will-change: opacity;
    font-family: 'HelveticaNowDisplayBold' !important;
    @include t-b1;
    @include from__tablet--landscape {
      font-family: 'HelveticaNowDisplayMedium' !important;
      @include t-b1;
    }
  }

  &__active {
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translate(-50%, 1.6rem);
    @include will-fade;
  }
}
</style>
