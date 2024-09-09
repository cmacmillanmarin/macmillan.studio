<template>
  <div class="home__about" id="about-target" data-scroll-target-top>
    <h2 class="home__about__title">{{ data.title }}</h2>
    <div class="home__about__hint">
      <h3 class="home__about__hint__label">
        <span class="home__about__hint__label__indent" /><span v-html="data.hint" />
      </h3>
    </div>
    <div class="home__about__content">
      <div class="home__about__content__thumbnail">
        <img
          ref="imgEl"
          src="/assets/img/thumbnail.jpg"
          alt="thumbnail"
          width="2560"
          height="2560"
          loading="lazy"
          @load="onLoaded"
          data-scroll-set-position
          class="home__about__content__thumbnail__image" />
        <p class="home__about__content__thumbnail__credit">{{ data.credit }}</p>
      </div>
      <div class="home__about__content__detail">
        <p class="home__about__content__detail__text">{{ data.detail }}</p>
      </div>
    </div>

    <HomeAboutClients :data="data.clients" />

    <div class="home__about__collaborator">
      <Separator />
      <div class="home__about__collaborator__title">
        <p class="home__about__collaborator__title__label">{{ data.collaborator.title }}</p>
      </div>
      <div class="home__about__collaborator__content">
        <p class="home__about__collaborator__content__label">{{ data.collaborator.description }}</p>
      </div>
      <div class="home__about__collaborator__thumbnail">
        <div class="home__about__collaborator__thumbnail__image" />
        <p class="home__about__collaborator__thumbnail__credit">{{ data.collaborator.credit }}</p>
      </div>
    </div>

    <HomeAboutTestimonials :data="data.testimonials" />
  </div>
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import useStore from '~/store/useStore'
import type { HomepageAbout } from '~/types/wordpress/homepage'

defineProps<{
  data: HomepageAbout
}>()

const { $scene }: any = useNuxtApp()
const { onResize } = useResize()
const { isInProjectEntered } = storeToRefs(useStore())

const imgEl = ref<HTMLImageElement>()

watch([onResize, isInProjectEntered], () => {
  if (!imgEl.value) return
  const bounding = imgEl.value?.getBoundingClientRect()
  $scene.updateObject({
    id: 'about-thumbnail',
    position: {
      x: isInProjectEntered.value ? -10000 : parseFloat(imgEl.value?.dataset.positionLeft || '0'),
      y: parseFloat(imgEl.value?.dataset.positionTop || '0'),
    },
    size: { x: bounding.width, y: bounding.height, z: 1 },
  })
})

onMounted(() => {
  imgEl.value?.complete && onLoaded()
})

function onLoaded() {
  if (!imgEl.value) return
  const bounding = imgEl.value?.getBoundingClientRect()
  $scene.addObject({
    id: 'about-thumbnail',
    type: 'plane',
    // img: imgEl.value,
    position: { x: bounding.left, y: bounding.top },
    size: { x: bounding.width, y: bounding.height, z: 1 },
    border: 16,
  })
}
</script>

<style lang="scss">
.home__about {
  padding: 8rem 0 0;
  background-color: var(--lime);

  &__title {
    @include t-seo;
  }

  &__hint {
    @include grid;

    &__label {
      padding-bottom: 8rem;

      @include t-h2;
      @include columns(10, 'desktop');
      @include gap(2, 'left', 'desktop');

      &__indent {
        --width: calc(
          min(100vw, var(--layout-max-width)) - var(--layout-margin) * 2 - var(--layout-gutter) * 11
        );
        --column-width: calc(var(--width) / 12);
        width: calc(var(--column-width) * 4 + var(--layout-gutter) * 4);
        display: inline-block;
      }
    }
  }

  &__content {
    @include grid;

    &__thumbnail {
      @include columns(2, 'desktop');
      @include gap(2, 'left', 'desktop');
      &__image {
        aspect-ratio: 1;
        display: block;
        // background-color: black;
        // border-radius: 1.6rem;
        margin-bottom: 1.2rem;
        opacity: 0;
      }
      &__credit {
        @include t-b1;
      }
    }

    &__detail {
      @include columns(6, 'desktop');
      @include gap(2, 'left', 'desktop');
      &__text {
        column-count: 2;
        column-gap: var(--layout-gutter);
        @include t-b1;
      }
    }
  }

  &__collaborator {
    margin-top: 18rem;
    padding-bottom: 12rem;
    position: relative;
    @include grid;
    .separator {
      margin-left: calc(var(--layout-column-width) * 4 + var(--layout-gutter) * 5);
      width: calc(var(--layout-column-width) * 5 + var(--layout-gutter) * 4);
    }
    &__title {
      @include gap(4, 'left', 'desktop');
      @include columns(2, 'desktop');
      &__label {
        margin-top: 1.2rem;
        @include t-b1;
      }
    }
    &__content {
      @include columns(3, 'desktop');
      @include gap(1, 'right', 'desktop');
      &__label {
        margin-top: 1.2rem;
        @include t-b1;
      }
    }
    &__thumbnail {
      @include columns(2, 'desktop');
      &__image {
        aspect-ratio: 1;
        background-color: black;
        border-radius: 1.6rem;
        margin-bottom: 1.2rem;
      }
      &__credit {
        @include t-b1;
      }
    }
  }
}
</style>
