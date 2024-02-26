<template>
  <div class="c-module-image">
    <div
      :class="[
        'c-module-image__container',
        { 'c-module-image__container--empty': !data.image.src },
      ]">
      <CustomImage
        v-if="data.image.src"
        :data="data.image"
        :size="{ d: 0.4, t: 0.4, m: 1 }"
        :lazy="true"
        :fade="true" />
    </div>
    <p
      class="c-module-image__description t-burgundy"
      :class="[{ 't-microcopy': isDesktop }, { 't-b3': !isDesktop }]">
      {{ data.description }}
    </p>
  </div>
</template>

<script lang="ts" setup>
import type { ImageModule } from '~/types/wordpress/modules'

defineProps<{
  data: ImageModule
}>()

const { isDesktop } = useDevice()
</script>

<style lang="scss">
.c-module-image {
  &__container {
    &--empty {
      aspect-ratio: 2 / 1;
      border-radius: var(--border-radius--m);
      background-color: var(--beige);
    }
  }
  &__description {
    margin-top: 0.8rem;
  }
}
</style>
