<template>
  <svg class="svg__dots" viewBox="0 0 30 7">
    <path d="M12 .512V6.5h6V.512h-6ZM0 .512V6.5h6V.512H0ZM24 .512V6.5h6V.512h-6Z" />
  </svg>
</template>

<style lang="scss">
.svg__dots {
  width: toScale(3rem, 37.5rem);
  height: auto;
  display: block;
  fill: none;
  path {
    fill: var(--lime);
  }
}
</style>
