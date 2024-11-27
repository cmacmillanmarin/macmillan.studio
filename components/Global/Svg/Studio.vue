<template>
  <svg class="svg__studio" viewBox="0 0 593 123" v-transition:in="{ callback: shuffleIn }">
    <path class="svg__studio__path" d="M464.001 120h-18V0h18v120Z" />
    <path
      class="svg__studio__path"
      d="M371.112.384064c37.464 0 59.304 22.848036 59.304 59.808036S408.576 120 371.112 120H328.44V.384064h42.672ZM346.416 104.208h24.528c26.376 0 40.656-16.1279 40.656-44.0159s-14.28-44.016-40.656-44.016h-24.528v88.0319Z" />
    <path
      class="svg__studio__path"
      d="M263.293 122.52c-30.072 0-48.384-16.8-48.384-47.2079V.384064h17.976V75.1441c0 21.504 11.256 31.2479 30.408 31.2479s30.408-9.7439 30.408-31.2479V.384064h17.976V75.3121c0 30.4079-18.144 47.2079-48.384 47.2079Z" />
    <path
      class="svg__studio__path"
      d="M106.635.384064h97.608V16.5121h-39.648V120h-18.312V16.5121h-39.648V.384064Z" />
    <path
      class="svg__studio__path"
      d="M17.9688 0h62v17h-62V0ZM17.9688 50h62v17h-62V50ZM17.9688 103h62v17h-62v-17ZM79.9688 103V67h17v36h-17ZM.96875 50V16H17.9688v34H.96875ZM79.9688 34V17h17v17h-17ZM.96875 103V86H17.9688v17H.96875Z" />
    <path
      class="svg__studio__path"
      d="M481.001 86V34h16v52h-16ZM497.001 34V17h17v17h-17ZM497.001 103V86h17v17h-17ZM514.001 120v-17h46v17h-46ZM593.001 86V34h-16v52h16ZM577.001 34V17h-17v17h17ZM577.001 103V86h-17v17h17ZM560.001 17V0h-46v17h46Z" />
  </svg>
</template>

<script lang="ts" setup>
import { shuffleIn } from '~/utils/animations'
</script>

<style lang="scss">
.svg__studio {
  fill: none;
  &__path {
    fill: black;
    @include will-fade;
  }
}
</style>
