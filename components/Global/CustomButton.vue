<template>
  <component
    :is="componentType"
    :to="isExternalLink ? undefined : button.to"
    :href="isExternalLink ? button.to : undefined"
    :target="isExternalLink ? '_blank' : undefined"
    :rel="isExternalLink ? 'noreferrer noopener' : undefined"
    :data-tab-fixed="tabFixed ? '' : undefined"
    :aria-label="button.label"
    :class="[
      'custom-button',
      { 'custom-button--primary': button.style === 'primary' && !blocked },
      { 'custom-button--secondary': button.style === 'secondary' && !blocked },
      { 'custom-button--fit-content': fitContent },
      { 'custom-button--blocked': blocked },
    ]">
    <span class="custom-button__label">
      <slot name="icon" />
      {{ button.label }}
    </span>
  </component>
</template>

<script lang="ts" setup>
import type { Button } from '~/types/front'

const props = defineProps<{
  button: Button
  tabFixed?: boolean
  fitContent?: boolean
  blocked?: boolean
}>()

const isButton = ref<boolean>(props.button.type === 'action')
const isExternalLink = ref<boolean>(props.button.type === 'external-link')

const componentType = computed(() => {
  if (isButton.value) return 'button'
  if (isExternalLink.value) return 'a'
  return resolveComponent('NuxtLink')
})
</script>

<style lang="scss">
.custom-button {
  cursor: pointer;
  position: relative;

  width: 12.4rem;
  height: 4.8rem;
  padding: 0;
  margin: 0;

  display: flex;
  justify-content: center;
  align-items: center;

  border-radius: 0.8rem;

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
    background-color: var(--light-blue);
    color: var(--blue);

    border: none;
  }

  &--secondary {
    background-color: var(--purple);
    color: var(--white);
    &:hover {
      color: var(--white);
    }
  }

  &__label {
    position: relative;
    display: block;
    margin: 0 !important;
    @include t-b1;
  }

  &__hint {
    position: absolute;
    bottom: 0;
    left: 50%;
    width: max-content;
    transform: translate(-50%, calc(100% + 0.8rem));
    @include t-b3;
  }
}
</style>
