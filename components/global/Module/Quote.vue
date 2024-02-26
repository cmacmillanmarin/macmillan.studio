<template>
  <div class="c-module-quote">
    <p class="c-module-quote__label t-quote t-burgundy">
      <span class="c-module-quote__label__mark">“</span>{{ data.label }}”
    </p>
  </div>
</template>

<script lang="ts" setup>
import type { QuoteModule } from '~/types/wordpress/modules'

defineProps<{
  data: QuoteModule
}>()
</script>

<style lang="scss">
.c-module-quote {
  padding-left: 0.8rem;
  padding-bottom: 1.2rem;
  @include from__desktop {
    padding-left: 0rem;
    padding-bottom: 3.2rem;
  }
  &__label {
    position: relative;
    &__mark {
      position: absolute;
      top: 0;
      left: 0;
      display: block;
      transform: translateX(-110%);
      @include from__desktop {
        transform: translateX(-120%);
      }
    }
  }
}
</style>
