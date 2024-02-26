<template>
  <component
    :is="componentType"
    :to="isExternalLink ? undefined : data.to"
    :href="isExternalLink ? data.to : undefined"
    :target="isExternalLink ? '_blank' : undefined"
    :rel="isExternalLink ? 'noreferrer noopener' : undefined"
    :data-tab-fixed="tabFixed ? '' : undefined"
    :aria-label="`${data.label}${data.hint ? ` ${data.hint}` : ''}`"
    :class="[
      'c-custom-button',
      { 'c-custom-button--primary': data.type === 'primary' && !blocked },
      { 'c-custom-button--secondary': data.type === 'secondary' && !blocked },
      { 'c-custom-button--tertiary': data.type === 'tertiary' && !blocked },
      { 'c-custom-button--label': data.type === 'label' },
      { 'c-custom-button--dark': dark },
      { 'c-custom-button--fit-content': fitContent },
      { 'c-custom-button--blocked': blocked },
    ]">
    <span :class="['c-custom-button__label', { 't-btn': !altFont }, altFont]">
      <slot name="icon" />
      {{ data.label }}
      <SvgLinePath
        v-if="data.type === 'label'"
        :key="`${isDesktop}`"
        :gap="4"
        class="c-custom-button__label__underline"
        :scale="true" />
    </span>

    <ClientOnly>
      <transition
        :css="false"
        @before-enter="prepareFadeIn"
        @enter="transitionFadeIn"
        @leave="transitionFadeOut">
        <span v-if="outline" class="c-custom-button__outline" />
      </transition>
    </ClientOnly>

    <transition
      :css="false"
      @before-enter="prepareFadeIn"
      @enter="transitionFadeIn"
      @leave="transitionFadeOut">
      <span v-if="data.hint && !hideHint" class="c-custom-button__hint t-b3">
        <transition
          :css="false"
          mode="in-out"
          @before-enter="prepareAbsolute"
          @enter="transitionFadeIn"
          @after-enter="restoreAbsolute">
          <span :key="hintColor" :class="hintColor || 't-white'">{{ data.hint }}</span>
        </transition>
      </span>
    </transition>
  </component>
</template>

<script lang="ts" setup>
import type { Button } from '~/types/wordpress'
import {
  prepareFadeIn,
  transitionFadeIn,
  transitionFadeOut,
  prepareAbsolute,
  restoreAbsolute,
} from '~/utils/animations'

const props = defineProps<{
  data: Button
  tabFixed?: boolean
  hideHint?: boolean
  hintColor?: string
  dark?: boolean
  fitContent?: boolean
  blocked?: boolean
  altFont?: string
  outline?: boolean
}>()

const { isDesktop } = useDevice()

const isButton = ref<boolean>(props.data.linkType === 'action')
const isExternalLink = ref<boolean>(props.data.linkType === 'external')

const componentType = computed(() => {
  if (isButton.value) return 'button'
  if (isExternalLink.value) return 'a'
  return resolveComponent('NuxtLink')
})
</script>

<style lang="scss">
.c-custom-button {
  cursor: pointer;
  position: relative;

  width: 12.4rem;
  height: 4.8rem;
  padding: 0;
  margin: 0;

  display: flex;
  justify-content: center;
  align-items: center;

  border-radius: var(--border-radius--s);

  @include from__desktop {
    height: 5.6rem;
  }

  @include from__desktop {
    width: 100%;
  }

  &--fit-content {
    width: max-content;
    padding: 0 1.2rem;
    @include from__desktop {
      padding: 0 1.6rem;
    }
  }

  &--dark {
    border: 1px solid var(--burgundy--dark) !important;
  }

  &--label {
    border: none;
  }

  &--blocked {
    cursor: default;
    border: none;
    background-color: var(--burgundy--exception);
    color: var(--white);
  }

  &--primary {
    background-color: var(--red--dark);
    color: var(--white);
    border: none;
    &:hover {
      color: var(--white);
    }
    .c-custom-button__hint {
      color: var(--white);
    }
  }

  &--secondary {
    background-color: var(--burgundy--dark);
    color: var(--white);
    &:hover {
      color: var(--white);
    }
  }

  &__label {
    position: relative;
    display: block;
    margin: 0 !important;

    .c-svg-rates {
      display: inline-block;
      font-size: 0;
      vertical-align: middle;
      transform: translateY(-0.2rem);
      // margin-right: 0.1rem;
    }

    &__underline {
      top: auto;
      bottom: -1rem;
    }
  }

  &__outline {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border: 0.1rem solid rgba(255, 255, 255, 0.5);
    border-radius: var(--border-radius--s);
    will-change: opacity;
  }

  &__hint {
    position: absolute;
    bottom: 0;
    left: 50%;
    width: 100%;
    transform: translate(-50%, calc(100% + var(--s)));
    text-align: center;
    color: var(--black);
    pointer-events: none;
    will-change: opacity;
    white-space: nowrap;
  }
}
</style>
