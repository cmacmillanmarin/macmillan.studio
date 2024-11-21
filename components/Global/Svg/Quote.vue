<template>
  <svg class="svg__quote" viewBox="0 0 57 51">
    <path
      class="svg__quote__path"
      d="M.78 50.09V25.27C.78 8.95 8.43 1.64 22.03 1.13l3.74-.17v12.07l-3.57.17c-5.27.34-7.65 4.08-7.65 11.22v2.04h11.22v23.63H.78Zm55.59-37.06-3.57.17c-5.27.34-7.65 4.08-7.65 11.22v2.04h11.22v23.63H31.38V25.27c0-16.32 7.65-23.63 21.25-24.14l3.74-.17v12.07Z" />
  </svg>
</template>

<style lang="scss">
.svg__quote {
  fill: none;
  width: toScale(3.6rem, 37.5rem);
  height: auto;
  display: block;
  @include from__tablet--landscape {
    width: toScale(5.7rem);
  }
  &__path {
    fill: black;
  }
}
</style>
