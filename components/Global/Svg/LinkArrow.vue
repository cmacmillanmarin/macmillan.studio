<template>
  <svg class="svg__link-arrow" viewBox="0 0 13 13">
    <path d="M2.5 0h10v10h-2V3.414l-8.793 8.793-1.414-1.414L9.086 2H2.5V0Z" />
  </svg>
</template>

<style lang="scss">
.svg__link-arrow {
  display: block;
  width: toScale(0.9rem, 37.5rem);
  height: auto;
  fill: none;
  @include from__tablet--landscape {
    width: toScale(1.3rem);
  }
  path {
    fill: var(--black);
    fill-rule: evenodd;
    clip-rule: evenodd;
  }
}
</style>
