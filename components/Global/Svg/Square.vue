<template>
  <svg class="svg__square" view-box="0 0 100 100">
    <rect x="0" y="0" width="100" height="100" />
  </svg>
</template>

<style lang="scss">
.svg__square {
  display: block;
  width: toScale(1.2rem);
  height: toScale(1.2rem);
  rect {
    fill: var(--black);
  }
}
</style>
