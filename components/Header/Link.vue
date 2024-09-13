<template>
  <li class="header__link">
    <CustomLink
      class="header__link__anchor"
      type="referral"
      :to="to"
      :label="label"
      data-tab-fixed />
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
import { transitionShuffleIn, transitionShuffleOut } from '~/utils/animations'

defineProps<{
  label: string
  to: string
  active: boolean
}>()
</script>

<style lang="scss">
.header__link {
  position: relative;
  &__anchor {
    color: var(--black);
    @include t-b1;
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
