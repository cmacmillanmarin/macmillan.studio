<template>
  <svg class="svg__pause" viewBox="0 0 26 40">
    <path
      d="M0 24h8v-8H0v8ZM0 16h8V8H0v8ZM0 32h8v-8H0v8ZM16 32h8v-8h-8v8ZM16 16h8V8h-8v8ZM16 24h8v-8h-8v8Z" />
  </svg>
</template>

<style lang="scss">
.svg__pause {
  display: block;
  width: toScale(2.6rem);
  height: toScale(4rem);
  fill: none;
  path {
    fill: var(--lime);
  }
}
</style>
