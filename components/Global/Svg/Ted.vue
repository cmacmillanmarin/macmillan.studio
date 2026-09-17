<template>
  <svg class="svg__ted" viewBox="125 367 750 278">
    <path
      class="svg__ted__path"
      d="M198.971 438.541h-73.325v-70.639h227.868v70.639h-73.341v206.057h-81.202zm170.168-70.639h228.519v70.639H452.913v34.066h144.745v66.456H452.913v34.896h144.745v70.639H369.139zm383.241 0H614.943v276.696h121.16c94.337 0 138.251-54.005 138.251-138.755 0-69.809-31.706-137.941-121.974-137.941m-21.143 206.057h-32.52l-.83-134.605h26.84c60.19 0 65.886 48.194 65.886 65.642 0 25.765-7.341 68.962-59.376 68.962Z" />
  </svg>
</template>

<style lang="scss">
.svg__ted {
  fill: none;
  display: block;
  width: toScale(7rem, 37.5rem);
  @include from__tablet--landscape {
    width: toScale(14rem);
  }
  &__path {
    fill: black;
  }
}
</style>
