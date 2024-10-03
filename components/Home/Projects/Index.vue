<template>
  <div
    ref="el"
    id="projects-target"
    :class="['home__projects', { 'home__projects--all': activeList === 'all' }]"
    data-scroll-target-top
    data-scroll-set-position>
    <ClientOnly>
      <Teleport to=".header__top">
        <transition
          mode="out-in"
          :css="false"
          @before-enter="prepareFadeIn"
          @enter="transitionShuffleIn"
          @leave="transitionShuffleOut">
          <p v-if="indicators" class="home__projects__index">
            <SvgSquare />
            <span
              v-text="`{${startWithZero(active)}—${startWithZero(activeListProjects.length)}}`" />
          </p>
        </transition>
      </Teleport>
      <Teleport to=".header__bottom">
        <transition
          mode="out-in"
          :css="false"
          @before-enter="prepareFadeIn"
          @enter="transitionShuffleIn"
          @leave="transitionShuffleOut">
          <p v-if="indicators" class="home__projects__date">
            <span v-text="`{${year}—2013}`" />
          </p>
        </transition>
      </Teleport>
    </ClientOnly>

    <div class="home__projects__buttons" data-scroll-sticky>
      <transition
        mode="out-in"
        :css="false"
        @before-enter="prepareFadeIn"
        @enter="transitionShuffleIn"
        @leave="transitionShuffleOut">
        <button
          v-if="indicators"
          :class="[
            'home__projects__buttons__button',
            { 'home__projects__buttons__button--active': activeList === 'selected' },
          ]"
          @mouseenter="onButtonMouseEnter"
          @click="updateActiveListToSelected">
          <span class="home__projects__buttons__button__label">
            <transition
              mode="out-in"
              :css="false"
              @before-enter="prepareFadeIn"
              @enter="transitionShuffleIn"
              @leave="transitionShuffleOut">
              <SvgSquare v-if="activeList === 'selected'" />
            </transition>
            <span class="home__projects__buttons__button__label__el">Selected projects</span>
            <span
              class="home__projects__buttons__button__label__count"
              v-html="`{${startWithZero(selectedProjectsList.length)}}`" />
          </span>
        </button>
      </transition>
      <div class="home__projects__buttons__separator" />
      <transition
        mode="out-in"
        :css="false"
        @enter="transitionShuffleIn"
        @leave="transitionShuffleOut">
        <button
          v-if="indicators"
          :class="[
            'home__projects__buttons__button',
            { 'home__projects__buttons__button--active': activeList === 'all' },
          ]"
          @mouseenter="onButtonMouseEnter"
          @click="updateActiveListToAll">
          <span class="home__projects__buttons__button__label">
            <transition
              mode="out-in"
              :css="false"
              @before-enter="prepareFadeIn"
              @enter="transitionShuffleIn"
              @leave="transitionShuffleOut">
              <SvgSquare v-if="activeList === 'all'" />
            </transition>
            <span class="home__projects__buttons__button__label__el">All projects</span>
            <span
              class="home__projects__buttons__button__label__count"
              v-html="`{${startWithZero(data.list.length)}}`" />
          </span>
        </button>
      </transition>
    </div>

    <div class="home__projects__intersect--bg" v-intersect="{ callback: onIntersectBg }" />
    <div class="home__projects__intersect" v-intersect="{ callback: onIntersect }" />

    <div ref="listEl" class="home__projects__list">
      <div ref="listContainerEl" class="home__projects__list__container">
        <HomeProjectsProject
          v-for="(project, i) in activeListProjects"
          ref="projectEls"
          :key="project.slug"
          :list="activeList"
          :i="i"
          :of="activeListProjects.length - 1"
          :data="project"
          :top="top"
          :bottom="bottom"
          :side-x="i % 2 === 0 ? -1 : 1"
          :side-y="-1"
          @update-active="updateActive" />
      </div>
    </div>

    <template v-if="activeList === 'all'">
      <NuxtLink
        v-for="(project, i) in activeListProjects"
        :to="`${project.slug}`"
        :class="[
          'home__projects__anchor',
          { 'home__projects__anchor--selected': project.selected },
        ]"
        :style="`top: ${getAnchorTop(i)}`"
        data-scroll-target-top
        :data-scroll-target-offset="getOffset()" />
    </template>

    <div class="home__projects__videos" data-scroll-sticky>
      <video
        v-for="(video, i) in instancedVideos"
        :id="slugify(video.src)"
        :alt="video.alt"
        :width="video.width"
        :height="video.height"
        muted
        loop
        crossorigin="anonymous">
        <source :src="video.src" :type="video.mime" />
      </video>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { gsap } from 'gsap'
import useStore from '~/store/useStore'
import useScrollStore from '~/store/useScrollStore'
import { transitionShuffleIn, transitionShuffleOut, prepareFadeIn } from '~/utils/animations'
import { type HomepageProjects } from '~/types/wordpress/homepage'
import { storeToRefs } from 'pinia'
import type { Projects } from '~/types/wordpress/project'
import type { Video } from '~/types/wordpress'
import { toPx, slugify } from '~/utils'
import HomeProjectsProject from '~/components/Home/Projects/Project.vue'

const props = defineProps<{
  data: HomepageProjects
}>()

const store = useStore()
const { updateSection } = store
const { section } = storeToRefs(store)

const scrollStore = useScrollStore()
const { updateScroll, updateScrollFixedTargetId } = scrollStore
const { scrollUpdated, direction } = storeToRefs(scrollStore)
const { vh } = useResize()

const { getColumnWidth, layoutGutter } = useCss()

const { getBounding } = useVirtualScrollAndThreeTools()

const top = ref<number>(0)
const bottom = ref<number>(0)
const bounding = ref<number>(0)
const minHeight = ref<string>('auto')

const el = ref<HTMLElement>()
const listEl = ref<HTMLElement>()
const listContainerEl = ref<HTMLElement>()
const projectEls = ref<Array<typeof HomeProjectsProject>>([])

const active = ref<number>(0)
const indicators = computed<boolean>(() => section.value === 'projects')

const year = ref<string>(new Date().getFullYear().toString())

let _to: any

const activeList = ref<'selected' | 'all'>('selected')
const selectedProjectsList = ref<Projects>(props.data.list.filter(project => project.selected))
const activeListProjects = ref<Projects>(selectedProjectsList.value)

const instancedVideos = ref<Array<Video>>([])

watchEffect(() => {
  activeListProjects.value.forEach(item => {
    const isVideoProject = item.thumbnail.type === 'vid' && item.thumbnail.video.src
    if (isVideoProject && instancedVideos.value.indexOf(item.thumbnail.video) === -1) {
      instancedVideos.value.push(item.thumbnail.video)
    }
  })
})

watch(scrollUpdated, () => {
  updateBounding()
})

watch(activeList, () => {
  updateActiveListProjects()
})

watch(activeListProjects, async () => {
  active.value = 1
  await nextTick()
  const listWidth = listEl.value?.offsetWidth || 0
  const listContainerWidth = listContainerEl.value?.offsetWidth || 0
  bounding.value = listContainerWidth - listWidth
  minHeight.value = activeList.value === 'selected' ? 'auto' : toPx(bounding.value + vh.value)
  el.value && gsap.set(el.value, { minHeight: minHeight.value })
  await nextTick()
  updateScroll()
  await nextTick()
  updateBounding()
  updateScrollFixedTargetId('projects')
  await nextTick()
  await nextTick()
  for (const project of projectEls.value) {
    project.transition()
  }
})

function updateActiveListProjects() {
  activeListProjects.value =
    activeList.value === 'selected' ? selectedProjectsList.value : props.data.list
}

function updateActive(value: number) {
  active.value = value + 1
}

function onIntersect(el: HTMLElement, visible: boolean) {
  visible && updateSection('projects')
}

function onIntersectBg(el: HTMLElement, visible: boolean) {
  visible && direction.value === 'down' && updateSection('projects-bg')
}

function updateActiveListToSelected(e: MouseEvent) {
  e.preventDefault()
  e.stopPropagation()
  updateActiveList('selected')
}

function updateActiveListToAll(e: MouseEvent) {
  e.preventDefault()
  e.stopPropagation()
  updateActiveList('all')
}

function updateActiveList(value: 'selected' | 'all') {
  activeList.value = value
}

function getAnchorTop(position: number): string {
  let top = getOffset()
  // console.log(`position ${position}`)
  for (let i = 0; i < position; i++) {
    const { selected } = activeListProjects.value[i]
    // console.log(`Scrolls half${selected ? ' selected' : ''} plus gutter `)
    top += getColumnWidth(selected ? 3.5 : 3) + layoutGutter.value
  }
  if (position > 0) {
    const { selected } = activeListProjects.value[position]
    // if (!selected) top -= getColumnWidth(0.333333)
  }
  return toPx(top)
}

function getOffset(): number {
  return (vh.value - (getColumnWidth(3.5) * 7) / 5) * 0.5
}

function onButtonMouseEnter(e: MouseEvent) {
  const el = e.target as HTMLElement
  if (!el || el.classList.contains('clicked')) return
  const labelEl = el.querySelector('.home__projects__buttons__button__label__el')
  if (labelEl) {
    gsap.set(labelEl, { opacity: 0 })
    shuffleElsIn({ els: [labelEl] })
  }
}

async function updateBounding() {
  const bounding = getBounding(el.value as HTMLElement)
  top.value = bounding.top
  bottom.value = bounding.bottom - vh.value
}

onBeforeUnmount(() => {
  _to && clearTimeout(_to)
})

defineEmits(['update-active'])
</script>

<style lang="scss">
.home__projects {
  position: relative;
  padding-bottom: calc(var(--vh) * 0.25);

  &--all {
    display: block;
    padding-bottom: 0;

    .home__projects__list {
      position: sticky;
      top: 0;
      height: var(--vh);
      display: flex;
      align-items: center;
      overflow: var(--overflow--hidden);
      // border: 1px solid red;
      &__container {
        display: inline-block;
        white-space: nowrap;
        // border: 1px solid blue;
        padding-left: calc(50vw - #{toColumns(3.5)} * 0.5);
        padding-right: calc(50vw - #{toColumns(3)} * 0.5);
        height: max-content;
        .home__projects__project {
          display: inline-block;
          vertical-align: top;
          // border: 1px solid lime;
        }
      }
    }
    .home__projects__anchor {
      position: absolute;
      // top: 0;
      left: calc(50vw - #{toColumns(3.5)} * 0.5);
      display: block;
      width: toColumns(3);
      aspect-ratio: 5/7;
      // border: 2px solid red;
      border-radius: toScale(1.6rem);
      pointer-events: none;

      &--selected {
        width: toColumns(3.5);
      }
    }
  }

  &__index,
  &__date {
    display: flex;
    align-items: center;
    column-gap: 0.8rem;
    @include will-fade;
    @include t-number;
  }

  &__index {
    position: absolute;
    width: max-content;
  }

  &__buttons {
    z-index: 9;
    position: absolute;
    top: 0;
    left: 50%;
    width: 100vw;
    max-width: var(--layout-max-width);
    transform: translate(-50%, 0);
    height: var(--vh);
    display: flex;
    justify-content: space-around;
    align-items: center;
    pointer-events: none;

    &__button {
      width: max-content;
      width: toScale(40rem);
      border: none;
      @include will-fade;
      pointer-events: auto;

      &--active {
        pointer-events: none;
      }

      &__label {
        position: relative;
        @include t-black;
        @include t-b1;

        &__el {
          will-change: opacity;
        }

        .svg__square {
          position: absolute;
          top: 50%;
          left: 0;
          transform: translate(calc(-100% - 0.4rem), -50%);
        }

        &__count {
          position: absolute;
          transform: translate(0.8rem, -0.4rem);
          font-family: 'HelveticaNowDisplayBold' !important;
          @include t-b3;
        }
      }
    }
  }

  &__intersect {
    position: absolute;
    top: calc(var(--vh));
    left: 0;
    width: 100%;
    // height: 0.1rem;
    // border: 1px solid red;
    &--bg {
      @extend .home__projects__intersect;
      top: 0.2rem;
    }
  }

  &__videos {
    position: absolute;
    z-index: 9;
    top: 0;
    left: 0;
    display: flex;
    flex-wrap: wrap;
    width: 100%;
    height: max-content;
    opacity: 0;
    pointer-events: none;
    video {
      display: block;
      width: toColumns(1);
      height: max-content;
    }
  }
}
</style>
