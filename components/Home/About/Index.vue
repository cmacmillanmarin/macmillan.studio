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
            :lazy="true"
            :virtual="true"
            data-scroll-set-position
            @load="onThumbnailLoaded"
            @mouseenter="onThumbnailMouseEnter"
            @mouseleave="onThumbnailMouseLeave" />
          <p class="home__about__intro__content__thumbnail__credit">{{ data.credit }}</p>
        </div>
        <div class="home__about__intro__content__detail">
          <div
            :class="[
              'home__about__intro__content__detail__text',
              {
                'home__about__intro__content__detail__text--all':
                  isMobileLayout && allContentVisible,
              },
            ]"
            v-html="data.detail" />
          <button
            v-if="isMobileLayout && !allContentVisible"
            aria-label="Read More"
            class="home__about__intro__content__detail__read-more"
            @click="onReadMore">
            Read More
          </button>
        </div>
      </div>

      <HomeAboutClients :data="data.clients" />

      <div class="home__about__intro__collaborator">
        <Separator :left="isMobileLayout ? 8 : 5" />
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
          <button
            aria-label="Visit Gatzara Studio website"
            @click="onCollaboratorImageClick"
            @mouseenter="onCollaboratorMouseEnter"
            @mouseleave="onCollaboratorMouseLeave">
            <SvgGatzara />
          </button>
        </div>
      </div>
    </div>

    <div class="home__about__testimonials-and-gallery">
      <HomeAboutTestimonials
        :data="data.testimonials"
        @update-expanded="onTestimonialsUpdateExpanded" />
      <HomeAboutGallery ref="galleryEl" :data="data.gallery" />
    </div>

    <HomeAboutAwards :data="data.awards" />
  </div>
</template>

<script lang="ts" setup>
import { gsap } from 'gsap/gsap-core'
import { storeToRefs } from 'pinia'
import useStore from '~/store/useStore'
import useScrollStore from '~/store/useScrollStore'
import type { HomepageAbout } from '~/types/wordpress/homepage'
import CustomImage from '~/components/Global/CustomImage.vue'
import HomeAboutGallery from '~/components/Home/About/Gallery/Index.vue'
import { hexToRgb, rbgToVec4 } from '~/utils'

defineProps<{
  data: HomepageAbout
}>()

const { $three }: any = useNuxtApp()

const store = useStore()
const { updateSection, updateCursor, updateCursorPosition } = store
const { section, inReelHovered } = storeToRefs(store)

const scrollStore = useScrollStore()
const { updateScroll } = scrollStore
const { direction, scrollUpdated } = storeToRefs(scrollStore)

const { toScale } = useCss()
const { getBounding } = useVirtualScrollAndThreeTools()

const { isMobileLayout } = useDevice()

const introEl = ref<HTMLElement>()
const thumbnailImageEl = ref<typeof CustomImage>()
const galleryEl = ref<typeof HomeAboutGallery>()

const imagesFade = ref<number>(0)
const allContentVisible = ref<boolean>(false)
let _color = { vec4: rbgToVec4(hexToRgb('bdff00')), alpha: 1 }

watch(scrollUpdated, () => {
  updateImagePositions()
})

watch(section, () => {
  gsap.killTweensOf(imagesFade)
  if (section.value === 'about') {
    fadeIn({ el: introEl.value, delay: 0.2 })
    gsap.to(imagesFade, { value: 1, duration: 1, delay: 0.2, onUpdate: onImagesFadeUpdate })
  } else if (imagesFade.value === 1) {
    fadeOut({ el: introEl.value })
    gsap.to(imagesFade, { value: 0, duration: 0.6, onUpdate: onImagesFadeUpdate })
  }
})

onMounted(() => {
  $three.planes.add({
    id: 'about-thumbnail',
    position: { x: 0, y: 0 },
    size: { x: 0, y: 0, z: 1 },
    blackAndWhite: true,
    opacity: 0,
    color: rbgToVec4(hexToRgb('#000000')),
    multiplyColor: rbgToVec4(hexToRgb('#bdff00')),
  })
  updateImagePositions()
})

function updateImagePositions() {
  if (!thumbnailImageEl.value) return
  const thumbnailImageBounding = getBounding(thumbnailImageEl.value.el)
  const thumbnailImageWidth = thumbnailImageEl.value.el.clientWidth
  const thumbnailImageHeight = thumbnailImageEl.value.el.clientHeight
  $three.planes.update({
    id: 'about-thumbnail',
    position: { x: thumbnailImageBounding.left, y: thumbnailImageBounding.top },
    size: { x: thumbnailImageWidth, y: thumbnailImageHeight, z: 1 },
    border: toScale(isMobileLayout.value ? 8 : 16),
  })
}

async function onReadMore() {
  allContentVisible.value = true
  await nextTick()
  updateScroll()
}

function onImagesFadeUpdate() {
  $three.planes.update({ id: 'about-thumbnail', opacity: imagesFade.value })
}

function onIntersect(el: HTMLElement, visible: boolean) {
  if (visible) updateSection('about')
  else if (direction.value === 'up') updateSection('services')
}

function onTestimonialsUpdateExpanded() {
  galleryEl.value?.update()
}

function onThumbnailLoaded(img: HTMLImageElement) {
  $three.planes.update({ id: 'about-thumbnail', img })
  updateImagePositions()
}

function onThumbnailMouseEnter() {
  updateCursor('none')
  gsap.killTweensOf(_color)
  gsap.to(_color, {
    alpha: 0,
    duration: 0.4,
    onUpdate: () => {
      updateTint('about-thumbnail')
    },
  })
}

function onThumbnailMouseLeave() {
  updateCursor('default')
  gsap.killTweensOf(_color)
  gsap.to(_color, {
    alpha: 1,
    duration: 0.4,
    onUpdate: () => {
      updateTint('about-thumbnail')
    },
  })
}

function onCollaboratorMouseEnter(e: MouseEvent) {
  if (inReelHovered.value) return
  const { target } = e
  const svgEl = (target as HTMLElement).querySelector('.svg__gatzara')
  if (svgEl) {
    const { bottom, left, width } = svgEl.getBoundingClientRect()
    updateCursorPosition({ x: left + width * 0.5 - toScale(6), y: bottom + toScale(12) })
    shuffleIn({ el: svgEl as HTMLElement })
  }
}

function onCollaboratorMouseLeave(e: MouseEvent) {
  updateCursorPosition({ x: -1, y: -1 })
}

function onCollaboratorImageClick(e: MouseEvent) {
  if (inReelHovered.value) return
  e?.preventDefault()
  e?.stopPropagation()
  window.open('https://xaviercusso.com', '_blank')
}

function updateTint(id: string) {
  $three.planes.update({
    id,
    multiplyColor: [
      _color.vec4[0] + (1 - _color.vec4[0]) * (1 - _color.alpha),
      _color.vec4[1] + (1 - _color.vec4[1]) * (1 - _color.alpha),
      _color.vec4[2] + (1 - _color.vec4[2]) * (1 - _color.alpha),
      _color.alpha,
    ],
  })
}

onBeforeUnmount(() => {
  $three.planes.remove('about-thumbnail')
})
</script>

<style lang="scss">
.home__about {
  position: relative;
  padding: toScale(5.2rem, 37.5rem) 0 0;

  @include from__tablet--landscape {
    padding: toScale(8rem) 0 0;
  }

  &__intro {
    min-height: var(--vh);
    @include will-fade;

    &__title {
      @include t-seo;
    }

    &__hint {
      @include grid;

      &__label {
        padding-bottom: toScale(3.2rem, 37.5rem);
        @include columns(8);
        @include t-h2;

        @include from__tablet--landscape {
          padding-bottom: toScale(8rem);
          @include columns(10);
          @include gap(2, 'left');
        }

        &__indent {
          width: calc(toColumns(1) + var(--layout-gutter));
          display: inline-block;
          @include from__tablet--landscape {
            width: calc(toColumns(4) + var(--layout-gutter));
          }
        }
      }
    }

    &__content {
      @include grid;

      &__thumbnail {
        @include columns(3);

        @include from__tablet--landscape {
          @include columns(2);
          @include gap(2, 'left');
        }

        .custom-image {
          aspect-ratio: 1;
          display: block;
          margin-bottom: 1.2rem;
          opacity: 0;
          width: calc(100% + var(--layout-gutter));
          @include from__tablet--landscape {
            width: 100%;
            margin-bottom: 1.2rem;
          }
        }

        &__credit {
          white-space: nowrap;
          @include t-b1;
        }
      }

      &__detail {
        @include columns(4);
        @include gap(1, 'left');

        @include from__tablet--landscape {
          @include columns(6);
          @include gap(2, 'left');
        }

        &__text {
          display: -webkit-box;
          line-clamp: 14;
          -webkit-line-clamp: 14;
          -webkit-box-orient: vertical;
          overflow: hidden;

          &--all {
            display: block;
            line-clamp: unset;
            -webkit-box-orient: unset;
            overflow: visible;
          }

          @include from__tablet--landscape {
            display: block;
            line-clamp: unset;
            -webkit-box-orient: unset;
            overflow: visible;
            column-count: 2;
            column-gap: var(--layout-gutter);
          }

          p {
            margin-bottom: toScale(1rem, 37.5rem);
            @include t-b1;
            @include from__tablet--landscape {
              margin-bottom: toScale(1.2rem);
            }
          }
        }

        &__read-more {
          border: none;
          padding: 0;
          width: max-content;
          text-decoration: underline;
          // font-family: 'HelveticaNowDisplayBold' !important;
          margin-top: toScale(1.2rem, 37.5rem);
          @include t-black;
          @include t-b1;
        }
      }
    }

    &__collaborator {
      position: relative;
      @include grid;

      @include from__tablet--landscape {
        margin-top: toScale(18rem);
        padding-bottom: toScale(8rem);
      }

      .separator {
        margin-left: var(--layout-margin);
        width: calc(var(--layout-column-width) * 8 + var(--layout-gutter) * 7);
        @include from__tablet--landscape {
          margin-left: calc(var(--layout-column-width) * 4 + var(--layout-gutter) * 5);
          width: calc(var(--layout-column-width) * 5 + var(--layout-gutter) * 4);
        }
      }

      &__title {
        @include columns(4);

        @include from__tablet--landscape {
          @include gap(4, 'left');
          @include columns(2);
        }

        &__label {
          margin-top: 1.2rem;
          @include t-b1;
        }
      }

      &__content {
        @include columns(4);
        @include from__tablet--landscape {
          @include columns(3);
          @include gap(1, 'right');
        }

        &__label {
          margin-top: 1.2rem;
          @include t-b1;
        }
      }

      &__thumbnail {
        position: relative;
        margin-top: toScale(3.2rem);
        margin-left: calc(toColumns(4) + var(--layout-gutter));
        @include columns(4);

        @include from__tablet--landscape {
          margin-top: 0;
          margin-left: 0;
          @include columns(2);
        }

        button {
          padding: 0;
          border: none;
          margin-top: toScale(3.2rem, 37.5rem);
          @include from__tablet--landscape {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-90deg);
            transform-origin: center;
            margin-top: 0;
          }
        }

        .custom-image {
          margin-bottom: 1.2rem;
          opacity: 0;
        }

        &__credit {
          display: flex;
          align-items: center;
          padding: 0;
          border: none;
          @include t-black;
          @include t-b1;
          .svg__link-arrow {
            width: toScale(1.1rem, 37.5rem);
            transform: translateY(0.1rem);
            @include from__tablet--landscape {
              width: toScale(1.5rem);
            }
            path {
              fill: var(--black);
            }
          }
        }
      }
    }
  }

  &__testimonials-and-gallery {
    min-height: var(--vh);
  }

  &__testimonials {
    padding: toScale(4rem, 37.5rem) 0 0;
    @include from__tablet--landscape {
      padding-top: toScale(8rem);
    }
  }

  &__gallery {
    padding: toScale(6rem, 37.5rem) 0 toScale(4rem, 37.5rem);
    @include from__tablet--landscape {
      padding-top: toScale(12rem);
      padding-bottom: toScale(16rem);
    }
  }

  &__intersect {
    position: absolute;
    top: calc(var(--vh) * 0.5);
    left: 0;
    width: 100%;
    // height: 1px;
    // background-color: red;
  }
}
</style>
