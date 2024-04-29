<template>
  <ClientOnly>
    <div class="grid__rule-of-thirds">
      <div class="grid__rule-of-thirds__col" v-for="i in 9" />
    </div>
  </ClientOnly>
</template>

<style lang="scss" scoped>
.grid__rule-of-thirds {
  position: absolute;
  pointer-events: none;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 999999;

  @include grid('rule-of-thirds');

  &__col {
    width: 33.3333%;
    height: 33.333%;
    outline: 0.1rem solid magenta;
  }
}
</style>
