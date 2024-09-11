<template>
  <div class="separator">
    <SvgSquare />
  </div>
</template>

<style lang="scss">
.separator {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 0.2rem;
  background-color: black;

  .svg__square {
    position: absolute;
    top: 0.1rem;
    left: calc(var(--layout-column-width) * 4 + var(--layout-gutter) * 4);
    transform: translate(0, -100%);

    width: 1.2rem;

    background-color: black;

    will-change: transform;
  }
}
</style>
