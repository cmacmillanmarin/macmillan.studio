<template>
  <button
    aria-label="Sign in"
    :class="[
      'c-user-sign_in-button',
      { 'c-user-sign_in-button--secondary': type === 'secondary' },
    ]">
    <span class="c-user-sign_in-button__icon"><slot /></span>
    <span class="c-user-sign_in-button__label t-b1">{{ loading ? 'loading' : label }}</span>
  </button>
</template>

<script lang="ts" setup>
defineProps<{
  label: string
  loading?: boolean
  type: 'primary' | 'secondary'
}>()
</script>

<style lang="scss">
.c-user-sign_in-button {
  height: 4.8rem;
  border-radius: var(--border-radius--m);
  background-color: var(--burgundy--dark);
  color: var(--white);
  border: none;
  display: flex;
  align-items: center;
  line-height: 1;
  // padding: 1.8rem auto;

  &--secondary {
    background-color: var(--white);
    border: 1px solid var(--dark-grey);
    color: var(--dark-grey);
  }

  &__label {
    flex: 1;
    margin: 0 !important;
  }
}
</style>
