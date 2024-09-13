<template>
  <div class="home__about" id="about-target" data-scroll-target-top>
    <div class="home__about__intersect" v-intersect="{ callback: onIntersect }" />
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
        <div class="home__about__content__detail__text" v-html="data.detail" />
      </div>
    </div>

    <HomeAboutClients :data="data.clients" />

    <div class="home__about__collaborator">
      <Separator />
      <div class="home__about__collaborator__title">
        <p class="home__about__collaborator__title__label">{{ data.collaborator.title }}</p>
      </div>
      <div class="home__about__collaborator__content">
        <div
          class="home__about__collaborator__content__label"
          v-html="data.collaborator.description" />
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
import useScrollStore from '~/store/useScrollStore'
import type { HomepageAbout } from '~/types/wordpress/homepage'

defineProps<{
  data: HomepageAbout
}>()

const { $scene }: any = useNuxtApp()
const { onResize } = useResize()

const store = useStore()
const { updateSection } = store
const { isInProjectEntered } = storeToRefs(store)
const { direction } = storeToRefs(useScrollStore())

const imgEl = ref<HTMLImageElement>()
const loaded = ref<boolean>(false)

watch([loaded, onResize, isInProjectEntered], () => {
  if (!imgEl.value) return
  const { positionLeft, positionTop } = imgEl.value.dataset
  const width = imgEl.value.clientWidth
  const height = imgEl.value.clientHeight
  $scene.updateObject({
    id: 'about-thumbnail',
    position: {
      x: isInProjectEntered.value ? -10000 : parseFloat(positionLeft || '0'),
      y: parseFloat(positionTop || '0'),
    },
    size: { x: width, y: height, z: 1 },
  })
})

onMounted(() => {
  $scene.addObject({
    id: 'about-thumbnail',
    type: 'plane',
    img: imgEl.value,
    position: { x: 0, y: 0 },
    size: { x: 0, y: 0, z: 1 },
    border: 16,
  })
})

function onLoaded() {
  loaded.value = true
}

function onIntersect(el: HTMLElement, visible: boolean) {
  if (visible) updateSection('about')
  else if (direction.value === 'up') updateSection('services')
}
</script>

<style lang="scss">
.home__about {
  position: relative;
  padding: 8rem 0 0;

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

  &__intersect {
    position: absolute;
    top: calc(var(--vh) * 0.5);
    left: 0;
    width: 100%;
    height: 1px;
  }
}
</style>
