<template>
  <div
    :class="[
      'project__landing',
      `project__landing--${data.slug}`,
      { 'project__landing--next': next },
      { 'project__landing--animation': animation },
    ]">
    <div class="project__landing__title" @click="onTitleClick">
      <h2 v-if="!next" v-html="data.title" />
      <ClientOnly>
        <button
          v-if="next"
          class="project__landing__title__button"
          :aria-label="`Go to ${data.title} project`">
          <SvgProject :project="data.slug" :animation="animation" :next="true" />
        </button>
        <SvgProject v-else :project="data.slug" :animation="animation" :next="false" />
      </ClientOnly>
    </div>

    <div class="project__landing__info">
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
            :open="!next && !isMobileLayout"
            :animation="!next && !isMobileLayout"
            @toggle="onAccordionToggle" />
          <Accordion
            title="Client"
            :content="client"
            :first="!data.techStack.length"
            :open="!data.techStack.length"
            :animation="!next && !!data.techStack.length"
            @toggle="onAccordionToggle" />
          <Accordion
            v-for="info in data.info"
            :title="info.title"
            :content="info.label"
            :animation="true"
            @toggle="onAccordionToggle" />
        </div>
      </div>

      <div ref="contentEl" class="project__landing__info__content">
        <div v-show="!isMobileLayout" class="project__landing__info__content__services">
          <p
            v-for="service in data.services"
            class="project__landing__info__content__services__label">
            #{{ slugify(service) }}
          </p>
        </div>

        <div class="project__landing__info__content__description" v-html="data.description" />
      </div>

      <ClientOnly>
        <transition :css="false" @leave="transitionFadeOut">
          <div
            v-if="!next && !isMobileLayout && ready && scrollOnTop"
            ref="scrollEl"
            class="project__landing__info__scroll"
            v-transition:in="{ callback: enterScroll }">
            <p>Scroll</p>
            <div class="project__landing__info__scroll__bar">
              <div ref="scrollLineEl" class="project__landing__info__scroll__bar__line" />
            </div>
          </div>
        </transition>
      </ClientOnly>
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

const props = defineProps<{
  data: Project
  ready: boolean
  animation: boolean
  scrollOnTop?: boolean
  next?: boolean
}>()

const store = useStore()
const { updateCursor } = store
const { gridType, inProjectScroll } = storeToRefs(store)

const { isMobileLayout } = useDevice()

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
  async () => {
    await nextTick()
    fadeIn({ el: stackEl.value })
    fadeIn({ el: contentEl.value, delay: 0.2 })
    linkEl.value && shuffleIn({ el: linkEl.value })
    fadeIn({ el: scrollEl.value, delay: 0.4 })
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

function enterScroll(params: { el: HTMLElement }) {
  fadeIn({ el: params.el, delay: 0.2 })
  scrollLineEl.value && gsap.to(scrollLineEl.value, { x: toPercentage(0), delay: 0.6 })
}

function onLaunchProjectMouseEnter(e: MouseEvent) {
  e.preventDefault()
  const label = (e.target as HTMLElement)?.querySelector('span')
  label && gsap.set(label, { opacity: 0 })
  shuffleIn({ el: e.target as HTMLElement })
}

function onTitleClick() {
  emit('next-project')
}

function onAccordionToggle() {
  emit('update-scroll')
}

const emit = defineEmits(['update-scroll', 'next-project'])
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

  &--next {
    // .project__landing__title {
    //   padding-top: toScale(4rem, 37.5rem);
    //   @include from__tablet--landscape {
    //     padding-top: 0;
    //   }
    // }
    .project__landing__info__stack {
      padding-bottom: toScale(10rem, 37.5rem);
      @include from__tablet--landscape {
        padding-bottom: 0;
      }
    }
  }

  &--animation {
    .project__landing__title {
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

  // &--nike-trail-challenge {
  //   .project__landing__title {
  //     svg {
  //       &:nth-child(1) {
  //         margin-bottom: 1.2rem;
  //       }
  //     }
  //   }
  // }

  &__title {
    text-align: center;
    padding-top: var(--layout-margin);

    @include from__tablet--landscape {
      text-align: left;
      position: absolute;
      left: var(--layout-margin);
      bottom: var(--layout-margin);
      padding-top: 0;
    }

    @include from__desktop--x-large {
      left: calc((100vw - var(--layout-max-width)) * 0.5 + var(--layout-margin));
    }

    h2 {
      @include t-seo;
    }

    &__button {
      display: block;
      padding: 0;
      border: none;
    }

    svg {
      @include from__tablet--landscape {
        margin-bottom: 1.2rem;
      }
      &:last-child {
        margin-bottom: 0;
      }
    }
  }

  &__info {
    position: relative;
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-start;
    flex-direction: column-reverse;
    padding: toScale(4rem, 37.5rem) var(--layout-margin) 0;

    @include from__tablet--landscape {
      flex-wrap: nowrap;
      flex-direction: row;
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
      padding-bottom: toScale(4rem, 37.5rem);
      @include from__tablet--landscape {
        margin-left: 3vw;
        width: 22vw;
        padding-bottom: 0;
      }

      &__content {
        width: 100%;
      }
    }

    &__content {
      align-content: space-between;
      flex-wrap: wrap;
      padding: 0 toScale(2.8rem, 37.5rem) toScale(4rem, 37.5rem);

      @include t-b3;

      @include from__tablet--landscape {
        margin-left: 15vw;
        width: 20vw;
        padding: 0;
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
      padding: 0 0 toScale(4rem, 37.5rem);
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
        justify-content: center;
        align-items: center;
        column-gap: toScale(0.6rem, 37.5rem);
        width: max-content;
        margin: auto;
        @include t-black;
        @include t-b3;
        @include from__tablet--landscape {
          margin: 0;
          justify-content: flex-start;
          column-gap: toScale(0.6rem);
        }
        .svg__link-arrow {
          width: toScale(1rem, 37.5rem);
          transform: translateY(10%);
          @include from__tablet--landscape {
            width: toScale(1rem);
            transform: translateY(5%);
          }
        }
      }
    }

    &__scroll {
      position: absolute;
      left: 62.5vw;
      width: 14vw;
      padding-top: var(--layout-margin);
      @include will-fade;
      @include t-black;
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
