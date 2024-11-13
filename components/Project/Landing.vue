<template>
  <div
    :class="[
      'project__landing',
      `project__landing--${data.slug}`,
      { 'project__landing--animation': animation },
    ]">
    <div class="project__landing__info">
      <div ref="stackEl" class="project__landing__info__stack">
        <div
          class="project__landing__info__stack__content"
          @mouseenter="onMouseEnter"
          @mouseleave="onMouseLeave">
          <Accordion
            v-if="data.techStack.length"
            title="Tech Stack"
            :content="data.techStack.join(', ')"
            :first="true"
            :open="!next"
            :animation="!next" />
          <Accordion
            title="Client"
            :content="client"
            :first="!data.techStack.length"
            :open="!data.techStack.length"
            :animation="!next && !!data.techStack.length" />
          <Accordion
            v-for="info in data.info"
            :title="info.title"
            :content="info.label"
            :animation="true" />
        </div>
      </div>

      <div ref="contentEl" class="project__landing__info__content">
        <div class="project__landing__info__content__services">
          <p
            v-for="service in data.services"
            class="project__landing__info__content__services__label">
            #{{ slugify(service) }}
          </p>
        </div>

        <div class="project__landing__info__content__description" v-html="data.description" />
      </div>

      <div
        v-if="data.link && !next"
        ref="linkEl"
        class="project__landing__info__link"
        @mouseenter="onMouseEnter"
        @mouseleave="onMouseLeave">
        <a
          :href="data.link"
          :aria-label="`Open ${data.link} in another tab`"
          target="_blank"
          rel="noopener noreferral"
          class="project__landing__info__link__label"
          @mouseenter="onLaunchProjectMouseEnter">
          <span>Launch Project</span>
          <SvgLinkArrow />
        </a>
      </div>

      <transition :css="false" @leave="transitionFadeOut">
        <div
          v-if="inProjectScroll && !isMobileLayout"
          ref="scrollEl"
          class="project__landing__info__scroll">
          <p>Scroll</p>
          <div class="project__landing__info__scroll__bar">
            <div ref="scrollLineEl" class="project__landing__info__scroll__bar__line" />
          </div>
        </div>
      </transition>
    </div>

    <div v-if="ready" class="project__landing__title">
      <!-- <SvgProjectWallpapers v-if="data.slug === 'pixel-wallpapers'" :animation="animation" /> -->
      <h2 v-transition:in="{ callback: animation ? shuffleIn : () => {} }">
        <span v-for="letter in data.title">{{ letter }}</span>
      </h2>
    </div>

    <ClientOnly>
      <div v-if="gridType === 'golden-ratio'" class="project__landing__grid">
        <GridGoldenRatio />
      </div>
    </ClientOnly>
  </div>
</template>

<script lang="ts" setup>
import { gsap } from 'gsap'
import { storeToRefs } from 'pinia'
import useStore from '~/store/useStore'
import { type Project } from '~/types/wordpress/project'
import { fadeIn, shuffleIn } from '~/utils/animations'
import { slugify } from '~/utils'

const store = useStore()
const { updateCursor } = store
const { gridType, inProjectScroll } = storeToRefs(store)

const { isMobileLayout } = useDevice()

const props = defineProps<{
  data: Project
  ready: boolean
  animation: boolean
  next?: boolean
}>()

const stackEl = ref<HTMLElement>()
const contentEl = ref<HTMLElement>()
const linkEl = ref<HTMLElement>()
const scrollEl = ref<HTMLElement>()
const scrollLineEl = ref<HTMLElement>()

const client = ref<string>(
  `${props.data.client.name}
  ${props.data.collaborator.name ? (props.data.freelance ? ' w/ ' : ' at ') : ''}
  ${props.data.collaborator.name}`
)

watch(
  () => props.ready,
  () => {
    fadeIn({ el: stackEl.value })
    fadeIn({ el: contentEl.value, delay: 0.2 })
    linkEl.value && shuffleIn({ el: linkEl.value })
    fadeIn({ el: scrollEl.value, delay: 0.4 })
    scrollLineEl.value && gsap.to(scrollLineEl.value, { x: toPercentage(0), delay: 0.6 })
  }
)

onMounted(() => {
  props.ready && linkEl.value && shuffleIn({ el: linkEl.value })
})

function onMouseEnter() {
  updateCursor('default')
}

function onMouseLeave() {
  updateCursor(props.next ? 'arrow-right' : 'close')
}

function onLaunchProjectMouseEnter(e: MouseEvent) {
  e.preventDefault()
  const label = (e.target as HTMLElement)?.querySelector('span')
  label && gsap.set(label, { opacity: 0 })
  shuffleIn({ el: e.target as HTMLElement })
}
</script>

<style lang="scss">
.project__landing {
  position: relative;

  @include from__tablet--landscape {
    height: var(--vh);
  }

  @include from__desktop--x-large {
    padding-left: calc((100vw - var(--layout-max-width)) * 0.5);
  }

  &--animation {
    .project__landing__title {
      h2 {
        span {
          @include will-fade;
        }
      }
      svg {
        > path,
        > g {
          @include will-fade;
        }
      }
    }
    .project__landing__info {
      .project__landing__info__stack,
      .project__landing__info__content,
      .project__landing__info__link,
      .project__landing__info__scroll {
        @include will-fade;
      }
    }
  }

  &--nike-trail-challenge {
    .project__landing__title {
      svg {
        &:nth-child(1) {
          margin-bottom: 1.2rem;
        }
      }
    }
  }

  &__info {
    position: relative;
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-start;
    padding: 19.2rem var(--layout-margin) 0;

    @include from__tablet--landscape {
      flex-wrap: nowrap;
      width: 75vw;
      height: var(--vh);
      padding: 0;
    }

    &__stack,
    &__content {
      display: flex;
      flex-wrap: wrap;
      height: max-content;
      align-items: flex-end;
      width: 100%;
      @include from__tablet--landscape {
        flex-wrap: nowrap;
        height: calc(var(--vh) * 0.33);
      }
    }

    &__stack {
      width: 100%;
      @include from__tablet--landscape {
        margin-left: 3vw;
        width: 22vw;
      }
      &__content {
        width: 100%;
      }
    }

    &__content {
      align-content: space-between;
      flex-wrap: wrap;

      @include t-b3;

      @include from__tablet--landscape {
        margin-left: 15vw;
        width: 20vw;
      }

      &__services,
      &__description {
        width: 100%;
      }

      &__services {
        display: flex;
        flex-wrap: wrap;
        column-gap: 0.4rem;
        padding-top: var(--layout-margin);
        padding-bottom: 2rem;
      }

      &__description {
        transform: translateY(0.4rem);
      }
    }

    &__link {
      padding: 2rem 0 2rem;
      @include will-fade;

      @include from__tablet--landscape {
        position: absolute;
        top: 50%;
        z-index: 9;
        left: calc(40vw - toScale(3rem));
        transform: translateY(-60%);
        padding: toScale(3rem);
      }

      &__label {
        display: flex;
        align-items: center;
        column-gap: toScale(0.7rem);
        @include t-black;
        @include t-b3;
        .svg__link-arrow {
          width: toScale(1.2rem);
          transform: translateY(0.2rem);
        }
      }
    }

    &__scroll {
      position: absolute;
      left: 62.5vw;
      width: 14vw;
      will-change: opacity;
      padding-top: var(--layout-margin);
      @include t-b3;

      &__bar {
        position: absolute;
        bottom: 0.4rem;
        left: 4.8rem;
        width: calc(100% - 4.8rem);
        height: 0.2rem;
        overflow: var(--overflow--hidden);
        &__line {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: black;
          transform: translateX(-100%);
          will-change: transform;
        }
      }
    }
  }

  &__title {
    position: absolute;
    top: 7rem;
    left: var(--layout-margin);
    @include from__tablet--landscape {
      bottom: var(--layout-margin);
      top: auto;
    }
    @include from__desktop--x-large {
      left: calc((100vw - var(--layout-max-width)) * 0.5 + var(--layout-margin));
    }
    svg {
      &:nth-child(1) {
        margin-bottom: 1.2rem;
      }
    }
    h2 {
      text-transform: uppercase;
      @include t-project;
    }
  }

  &__grid {
    position: absolute;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100%;
    pointer-events: none;
    @include from__desktop--x-large {
      left: calc((100vw - var(--layout-max-width)) * 0.5);
    }
  }
}
</style>
