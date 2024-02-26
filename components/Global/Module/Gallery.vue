<template>
  <Carousel class="c-module-gallery" :bg="bg" :right="true">
    <div
      v-for="image in data.images"
      :class="['c-module-gallery__image', { 'c-module-gallery__image--empty': !image.src }]">
      <CustomImage
        v-if="image.src"
        :data="image"
        :size="{ d: 0.4, t: 0.4, m: 1 }"
        :lazy="true"
        :fade="true" />
    </div>
  </Carousel>
</template>

<script lang="ts" setup>
import type { GalleryModule } from '~/types/wordpress/modules'

defineProps<{
  data: GalleryModule
  bg?: boolean
}>()
</script>

<style lang="scss">
.c-module-gallery {
  padding-bottom: 3.2rem;
  @include from__desktop {
    padding-bottom: 10rem;
  }

  &__image {
    height: 20rem;
    display: inline-block;
    pointer-events: none;

    margin-right: var(--layout-gap);

    &:first-child {
      margin-left: var(--layout-gap);
      @include from__desktop {
        margin-left: calc(var(--layout-gap) * 2);
      }
    }

    &:last-child {
      margin-right: var(--layout-gap);
      @include from__desktop {
        margin-right: calc(var(--layout-gap) * 2);
      }
    }

    @include from__desktop {
      height: 30rem;
    }

    img {
      height: 100%;
      width: auto;
    }

    &--empty {
      aspect-ratio: 3/4;
      border-radius: var(--border-radius--m);
      background-color: var(--burgundy--dark);
    }
  }
}
</style>
