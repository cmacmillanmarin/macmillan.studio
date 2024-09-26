<template>
  <div class="home__about" id="about-target" data-scroll-target-top>
    <div class="home__about__intersect" v-intersect="{ callback: onIntersect }" />

    <div ref="introEl" class="home__about__intro">
      <h2 class="home__about__intro__title">{{ data.title }}</h2>
      <div class="home__about__intro__hint">
        <h3 class="home__about__intro__hint__label">
          <span class="home__about__intro__hint__label__indent" /><span v-html="data.hint" />
        </h3>
      </div>
      <div class="home__about__intro__content">
        <div class="home__about__intro__content__thumbnail">
          <CustomImage
            ref="thumbnailImageEl"
            :data="data.thumbnail"
            :size="{ d: 0.2, t: 0.4, m: 0.5 }"
            data-scroll-set-position />
          <p class="home__about__intro__content__thumbnail__credit">{{ data.credit }}</p>
        </div>
        <div class="home__about__intro__content__detail">
          <div class="home__about__intro__content__detail__text" v-html="data.detail" />
        </div>
      </div>

      <HomeAboutClients :data="data.clients" />

      <div class="home__about__intro__collaborator">
        <Separator :left="5" />
        <div class="home__about__intro__collaborator__title">
          <p class="home__about__intro__collaborator__title__label">
            {{ data.collaborator.title }}
          </p>
        </div>
        <div class="home__about__intro__collaborator__content">
          <div
            class="home__about__intro__collaborator__content__label"
            v-html="data.collaborator.description" />
        </div>
        <div class="home__about__intro__collaborator__thumbnail">
          <CustomImage
            ref="collaboratorImageEl"
            :data="data.collaborator.thumbnail"
            :size="{ d: 0.2, t: 0.4, m: 0.5 }"
            data-scroll-set-position />
          <p class="home__about__intro__collaborator__thumbnail__credit">
            {{ data.collaborator.credit }}
          </p>
        </div>
      </div>
    </div>

    <div class="home__about__testimonials-and-gallery">
      <HomeAboutTestimonials :data="data.testimonials" />
      <HomeAboutGallery :data="data.gallery" />
    </div>

    <HomeAboutAwards :data="data.awards" />
  </div>
</template>

<script lang="ts" setup>
import { gsap } from 'gsap'
import { storeToRefs } from 'pinia'
import useStore from '~/store/useStore'
import useScrollStore from '~/store/useScrollStore'
import type { HomepageAbout } from '~/types/wordpress/homepage'
import CustomImage from '~/components/Global/CustomImage.vue'

defineProps<{
  data: HomepageAbout
}>()

const { $scene }: any = useNuxtApp()

const store = useStore()
const { updateSection } = store
const { isInProjectEntered, section } = storeToRefs(store)
const { direction, scrollUpdated } = storeToRefs(useScrollStore())

const { toScale } = useCss()
const { getBounding } = useVirtualScrollAndThreeTools()

const introEl = ref<HTMLElement>()
const thumbnailImageEl = ref<typeof CustomImage>()
const collaboratorImageEl = ref<typeof CustomImage>()

const imagesFade = ref<number>(0)

watch(scrollUpdated, () => {
  if (!thumbnailImageEl.value || !collaboratorImageEl.value) return
  const thumbnailImageBounding = getBounding(thumbnailImageEl.value.el)
  const thumbnailImageWidth = thumbnailImageEl.value.el.clientWidth
  const thumbnailImageHeight = thumbnailImageEl.value.el.clientHeight
  $scene.updateObject({
    id: 'about-thumbnail',
    position: { x: thumbnailImageBounding.left, y: thumbnailImageBounding.top },
    size: { x: thumbnailImageWidth, y: thumbnailImageHeight, z: 1 },
    border: toScale(16),
  })
  const collaboratorImageBounding = getBounding(collaboratorImageEl.value.el)
  const collaboratorImageWidth = collaboratorImageEl.value.el.clientWidth
  const collaboratorImageHeight = collaboratorImageEl.value.el.clientHeight
  $scene.updateObject({
    id: 'about-collaborator-thumbnail',
    position: { x: collaboratorImageBounding.left, y: collaboratorImageBounding.top },
    size: { x: collaboratorImageWidth, y: collaboratorImageHeight, z: 1 },
    border: toScale(16),
  })
})

watch(section, () => {
  gsap.killTweensOf(imagesFade)
  if (section.value === 'about') {
    fadeIn({ el: introEl.value, delay: 0.2 })
    gsap.to(imagesFade, { value: 1, duration: 1, delay: 0.2, onUpdate: onImagesFadeUpdate })
  } else {
    fadeOut({ el: introEl.value })
    gsap.to(imagesFade, { value: 0, duration: 0.6, onUpdate: onImagesFadeUpdate })
  }
})

function onImagesFadeUpdate() {
  $scene.updateObject({ id: 'about-thumbnail', opacity: imagesFade.value })
  $scene.updateObject({ id: 'about-collaborator-thumbnail', opacity: imagesFade.value })
}

onMounted(() => {
  if (!thumbnailImageEl.value || !collaboratorImageEl.value) return
  $scene.preload(thumbnailImageEl.value.el)
  $scene.preload(collaboratorImageEl.value.el)
  $scene.addObject({
    id: 'about-thumbnail',
    type: 'plane',
    img: thumbnailImageEl.value.el,
    position: { x: 0, y: 0 },
    size: { x: 0, y: 0, z: 1 },
  })
  $scene.addObject({
    id: 'about-collaborator-thumbnail',
    type: 'plane',
    img: collaboratorImageEl.value.el,
    position: { x: 0, y: 0 },
    size: { x: 0, y: 0, z: 1 },
  })
})

function onIntersect(el: HTMLElement, visible: boolean) {
  if (visible) updateSection('about')
  else if (direction.value === 'up') updateSection('services')
}
</script>

<style lang="scss">
.home__about {
  position: relative;
  padding: toScale(8rem) 0 0;

  &__intro {
    min-height: var(--vh);
    @include will-fade;

    &__title {
      @include t-seo;
    }

    &__hint {
      @include grid;

      &__label {
        padding-bottom: toScale(8rem);

        @include t-h2;
        @include columns(10, 'desktop');
        @include gap(2, 'left', 'desktop');

        &__indent {
          --width: calc(
            min(100vw, var(--layout-max-width)) - var(--layout-margin) * 2 - var(--layout-gutter) *
              11
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

        .custom-image {
          aspect-ratio: 1;
          display: block;
          margin-bottom: toScale(1.2rem);
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
      margin-top: toScale(18rem);
      padding-bottom: toScale(8rem);
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
          margin-top: toScale(1.2rem);
          @include t-b1;
        }
      }

      &__content {
        @include columns(3, 'desktop');
        @include gap(1, 'right', 'desktop');
        &__label {
          margin-top: toScale(1.2rem);
          @include t-b1;
        }
      }

      &__thumbnail {
        @include columns(2, 'desktop');

        .custom-image {
          margin-bottom: toScale(1.2rem);
          opacity: 0;
        }

        &__credit {
          @include t-b1;
        }
      }
    }
  }

  &__testimonials-and-gallery {
    min-height: var(--vh);
  }

  &__testimonials {
    padding-top: toScale(8rem);
  }

  &__gallery {
    padding-top: toScale(12rem);
    padding-bottom: toScale(12rem);
  }

  &__intersect {
    position: absolute;
    top: calc(var(--vh) * 0.5);
    left: 0;
    width: 100%;
    height: 1px;
    // background-color: red;
  }
}
</style>
