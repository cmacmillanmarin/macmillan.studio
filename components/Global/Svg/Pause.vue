<template>
  <svg class="svg__pause" viewBox="0 0 26 40">
    <path
      d="M0 24h8v-8H0v8ZM0 16h8V8H0v8ZM0 32h8v-8H0v8ZM16 32h8v-8h-8v8ZM16 16h8V8h-8v8ZM16 24h8v-8h-8v8Z" />
  </svg>
</template>

<style lang="scss">
.svg__pause {
  display: block;
  width: toScale(1.8rem, 37.5rem);
  height: auto;
  fill: none;
  @include from__tablet--landscape {
    width: toScale(2.6rem);
  }
  path {
    fill: var(--lime);
  }
}
</style>
