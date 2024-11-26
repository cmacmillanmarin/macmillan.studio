<template>
  <div
    ref="el"
    data-scroll-sticky-state="false"
    :class="[
      'home__about__awards__award',
      { 'home__about__awards__award--hidden': hidden },
      { 'home__about__awards__award--no-bg': active === 0 },
    ]">
    <Separator :left="isMobileLayout ? 8 : 4" :start="!isMobileLayout" />

    <div
      v-if="i === of"
      class="home__about__awards__award__observer--in"
      v-intersect="{ callback: onIntersectIn }" />

    <div class="home__about__awards__award__content">
      <div class="home__about__awards__award__content__title">
        <h3 class="home__about__awards__award__content__title__label">
          {{ data.platform }}
        </h3>
      </div>
      <div class="home__about__awards__award__content__list">
        <div v-for="(item, i) in data.list" class="home__about__awards__award__content__list__item">
          <p v-if="!item.link" class="home__about__awards__award__content__list__item__label">
            {{ item.label }}
          </p>
          <a
            v-else
            :class="[
              'home__about__awards__award__content__list__item__label',
              `home__about__awards__award__content__list__item__label--${i}`,
            ]"
            :href="item.link"
            :data-link="i"
            target="_blank"
            @mouseenter="shuffle"
            :tabindex="landingTabIndex">
            {{ item.label }}
          </a>
          <p
            v-if="item.number"
            class="home__about__awards__award__content__list__item__number"
            v-text="`{${item.number}}`" />
          <div v-else-if="item.link" class="home__about__awards__award__content__list__item__link">
            <button
              class="home__about__awards__award__content__list__item__link__button"
              @mouseenter="shuffle"
              :data-link="i"
              tabindex="-1">
              {<SvgLinkArrow />}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { gsap } from 'gsap/gsap-core'
import { storeToRefs } from 'pinia'
import useStore from '~/store/useStore'
import useScrollStore from '~/store/useScrollStore'
import type { HomepageAboutAwardsAward } from '~/types/wordpress/homepage'
import { shuffleElsIn } from '~/utils/animations'

const props = defineProps<{
  i: number
  of: number
  active: number
  data: HomepageAboutAwardsAward
}>()

const { landingTabIndex } = storeToRefs(useStore())
const { direction } = storeToRefs(useScrollStore())

const { isMobileLayout } = useDevice()

const el = ref<HTMLElement>()
const sticky = ref<boolean>(false)
const hidden = computed<boolean>(() => props.active > props.i + 1)

let _observer: MutationObserver | null = null

watch(sticky, () => {
  if (sticky.value) emit('update-active', props.i)
  else if (direction.value === 'up') emit('update-active', props.i - 1)
})

onMounted(() => {
  if (!el.value) return
  _observer = new MutationObserver(mutationsList => {
    for (const mutation of mutationsList) {
      if (mutation.type === 'attributes') {
        sticky.value = el.value?.dataset.scrollStickyState === 'true'
      }
    }
  })
  _observer.observe(el.value, {
    attributes: true,
  })
})

function onIntersectIn(el: HTMLElement, visible: boolean) {
  if (props.active !== 0 && !visible && direction.value === 'down') emit('update-active', props.i)
  else if (visible && direction.value === 'up') emit('update-active', props.i - 1)
}

function shuffle(e: MouseEvent) {
  const t = e.target as HTMLElement
  const { link } = t.dataset

  const linkEl = el.value?.querySelector(
    `.home__about__awards__award__content__list__item__label--${link}`
  )
  if (linkEl) {
    gsap.set(linkEl, { opacity: 0 })
    shuffleElsIn({ els: [linkEl] })
  }
}

onBeforeUnmount(() => {
  _observer?.disconnect()
})

const emit = defineEmits<{
  (e: 'update-active', value: number): void
}>()
</script>

<style lang="scss">
.home__about__awards__award {
  position: relative;
  max-width: var(--layout-max-width);
  padding-top: toScale(3.2rem, 37.5rem);
  margin: 0 auto;

  will-change: opacity, transform;

  @include from__tablet--landscape {
    padding-top: toScale(4rem);
  }

  &--hidden {
    opacity: 0;
  }

  &--no-bg {
    .home__about__awards__award__content {
      background-color: transparent;
      &:after {
        background-color: transparent;
      }
    }
  }

  &:last-child {
    .home__about__awards__award__content {
      padding-bottom: toScale(12rem, 37.5rem);
      @include from__tablet--landscape {
        padding-bottom: toScale(18rem);
      }
    }
  }

  .separator {
    z-index: 2;
    top: toScale(3.2rem, 37.5rem);
    left: var(--layout-margin);
    width: calc(100% - var(--layout-margin) * 2);
    @include from__tablet--landscape {
      top: toScale(4rem);
      left: calc(var(--layout-column-width) * 2 + var(--layout-gutter) * 3);
      width: calc(var(--layout-column-width) * 10 + var(--layout-gutter) * 9);
    }
  }

  &__observer {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;

    &--in,
    &--out {
      @extend .home__about__awards__award__observer;
    }
    &--in {
      transform: translateY(toScale(-2.4rem));
    }
    &--out {
      transform: translateY(8.5rem);
    }
  }

  &__content {
    position: relative;
    z-index: 1;

    background-color: var(--light-grey);
    padding-top: 1.2rem;

    @include grid;

    @include from__tablet--landscape {
      padding-top: toScale(1.2rem);
    }

    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      transform: translateY(100%);
      height: toScale(3.2rem, 37.5rem);
      background-color: var(--light-grey);
      @include from__tablet--landscape {
        height: toScale(10.4rem);
      }
    }

    &__title {
      font-family: 'HelveticaNowDisplayBold' !important;
      @include columns(8, 'mobile');
      @include t-black;
      @include t-b1;

      @include from__tablet--landscape {
        font-family: inherit;

        @include gap(2, 'left', 'desktop');
        @include columns(4, 'desktop');
        @include t-b1;
      }
    }

    &__list {
      @include columns(8, 'mobile');
      @include from__tablet--landscape {
        @include columns(6, 'desktop');
      }

      &__item {
        display: flex;
        align-items: center;
        justify-content: space-between;

        padding-top: 0.2rem;
        @include from__tablet--landscape {
          padding-top: 0;
        }

        &:first-child {
          padding-top: 0.6rem;
          @include from__tablet--landscape {
            padding-top: 0;
          }
        }

        &__label {
          will-change: opacity;
          @include t-black;
          @include t-b1;
        }

        &__number,
        &__link {
          @include t-black;
          @include t-number;
          @include from__tablet--landscape {
            width: toColumns(2);
          }
        }

        &__link {
          &__button {
            display: flex;
            align-items: center;
            column-gap: 0.05rem;
            margin: 0;
            padding: 0;
            border: none;
            width: max-content;
            @include t-black;
            @include t-number;
            .svg__link-arrow {
              transform: translate(-0.05rem, 0.15rem);
            }
          }
        }
      }
    }
  }
}
</style>
