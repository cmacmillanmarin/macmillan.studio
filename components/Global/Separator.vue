<template>
  <div class="separator"><div class="separator__dot"></div></div>
</template>

<style lang="scss">
.separator {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 0.2rem;
  background-color: black;

  &__dot {
    position: absolute;
    top: 0;
    left: 0;
    transform: translate(0, -100%);

    width: 1.2rem;
    height: 1.1rem;

    background-color: black;

    will-change: transform;
  }
}
</style>
