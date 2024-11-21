<template>
  <svg class="svg__arrow-tetris" viewBox="0 0 56 56">
    <path
      d="M28 35h-5v5h5v-5ZM23 30h-5v5h5v-5ZM18 25h-5v5h5v-5ZM18 20h5v5h-5v-5ZM23 15h5v5h-5v-5ZM43 25h-5v5h5v-5Z" />
    <path d="M18 25h-5v5h5v-5ZM33 25h-5v5h5v-5Z" />
  </svg>
</template>

<style lang="scss">
.svg__arrow-tetris {
  display: block;
  fill: none;
  width: toScale(4.8rem, 37.5rem);
  height: toScale(4.8rem, 37.5rem);
  @include from__tablet--landscape {
    width: toScale(5.6rem);
    height: toScale(5.6rem);
  }
  path {
    fill: var(--lime);
  }
}
</style>
