<template>
  <svg class="svg__tick" viewBox="0 0 32 32">
    <path d="M8 24h8v8H8zM16 16h8v8h-8zM0 16h8v8H0zM16 8h8v8h-8zM24 0h8v8h-8z" />
  </svg>
</template>

<style lang="scss">
.svg__tick {
  display: block;
  fill: none;
  width: 3.2rem;
  height: 3.2rem;
  path {
    fill: var(--black);
  }
}
</style>
