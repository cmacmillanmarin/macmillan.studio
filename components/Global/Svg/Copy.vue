<template>
  <svg class="svg__copy" viewBox="0 0 38 38">
    <path d="M10 10h28v28H10V10Z" />
    <path d="M31 2V1H1v30h30V2Z" />
  </svg>
</template>

<style lang="scss">
.svg__copy {
  display: block;
  fill: none;
  width: 3.8rem;
  height: 3.8rem;
  path {
    fill: var(--black);
    &:last-child {
      stroke: var(--lime);
      stroke-width: 2;
    }
  }
}
</style>
