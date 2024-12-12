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
          :appear="true"
          @before-enter="prepareFadeIn"
          @enter="transitionShuffleIn"
          @leave="transitionShuffleOut">
          <p v-if="indicators" ref="indexEl" class="home__projects__index">
            <SvgSquare />
            <span
              class="home__projects__index__label--active"
              v-text="`{${startWithZero(active)}—${startWithZero(activeOf)}}`" />
          </p>
        </transition>
      </Teleport>

      <Teleport to="#top-layer-blend">
        <HomeProjectsButtons
          v-if="!isInProject"
          ref="buttonsEl"
          :indicators="indicators"
          :projects="data.list.length"
          :selected-projects="selectedProjectsList.length"
          :active-list="activeList"
          @update-list="updateActiveList"
          @button-hover="onButtonHoverUpdate" />
      </Teleport>
    </ClientOnly>

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
          :active="!onButton"
          @update-active="updateActive"
          @request-video="addVideo" />
      </div>
    </div>

    <template v-if="activeList === 'all'">
      <NuxtLink
        v-for="(project, i) in activeListProjects"
        :to="`${project.slug}`"
        :id="targetify(`all-${project.slug}-anchor`)"
        :class="[
          'home__projects__anchor',
          { 'home__projects__anchor--selected': project.selected },
        ]"
        :style="`top: ${getAnchorTop(i)}`"
        :tabindex="landingTabIndex"
        data-scroll-target-top
        :data-scroll-target-offset="getOffset()" />
    </template>

    <ClientOnly>
      <div class="home__projects__videos" data-scroll-sticky>
        <template v-for="{ id, video } in instancedVideos">
          <video
            v-if="video && video.mp4 && video.webm"
            :id="id"
            :alt="video.alt"
            :width="video.width"
            :height="video.height"
            preload="true"
            muted
            loop
            playsinline
            crossorigin="anonymous">
            <source :src="video.webm" type="video/webm" />
            <source :src="video.mp4" type="video/mp4" />
          </video>
        </template>
      </div>
    </ClientOnly>
  </div>
</template>

<script lang="ts" setup>
import { gsap } from 'gsap/gsap-core'
import useStore from '~/store/useStore'
import useScrollStore from '~/store/useScrollStore'
import { transitionShuffleIn, transitionShuffleOut, prepareFadeIn } from '~/utils/animations'
import { type HomepageProjects } from '~/types/wordpress/homepage'
import { storeToRefs } from 'pinia'
import type { FileVideo } from '~/types/wordpress'
import type { Projects } from '~/types/wordpress/project'
import { toPx } from '~/utils'
import HomeProjectsProject from '~/components/Home/Projects/Project.vue'
import HomeProjectsButtons from '~/components/Home/Projects/Buttons.vue'

const props = defineProps<{
  data: HomepageProjects
}>()

const route = useRoute()
const firstRouteIsProject = ref<boolean>(!!route.params.slug)

const store = useStore()
const { updateSection, updateActiveProjectList } = store
const { section, isInReel, isInProject, landingTabIndex } = storeToRefs(store)

const scrollStore = useScrollStore()
const { updateScroll, updateScrollTargetId, updateScrollFixedTargetId } = scrollStore
const { current, scrollUpdated, direction } = storeToRefs(scrollStore)

const { vh } = useResize()
const { isMobileLayout } = useDevice()
const { getColumnWidth, layoutGutter } = useCss()

const { getBounding } = useVirtualScrollAndThreeTools()

const top = ref<number>(0)
const bottom = ref<number>(0)
const bounding = ref<number>(0)
const minHeight = ref<string>('auto')
const onButton = ref<boolean>(false)

const el = ref<HTMLElement>()
const listEl = ref<HTMLElement>()
const listContainerEl = ref<HTMLElement>()
const projectEls = ref<Array<typeof HomeProjectsProject>>([])
const buttonsEl = ref<typeof HomeProjectsButtons>()
const indexEl = ref<HTMLElement>()

const indicators = computed<boolean>(
  () =>
    section.value === 'projects' && !(isInProject.value && isMobileLayout.value) && !isInReel.value
)

let _to: any
const selectedProjectsList = ref<Projects>(props.data.list.filter(project => project.selected))
const activeListProjects = ref<Projects>(selectedProjectsList.value)
const temporaryProjectList = ref<Projects>([])
const activeList = ref<'selected' | 'all'>('selected')

const active = ref<number>(0)
const activeOf = ref<number>(activeListProjects.value.length)

const instancedVideos = ref<Array<{ id: string; video: FileVideo }>>([])

watch(
  () => route.params.slug,
  (to, from) => {
    if (from && !to) {
      const inActiveList = !!activeListProjects.value.find(p => p.slug === from)
      if (!inActiveList) active.value = 1
      activeOf.value = activeListProjects.value.length
    }
    indexEl.value && !isMobileLayout.value && gsap.set(indexEl.value, { y: 0 })
  }
)

watch(temporaryProjectList, () => {
  emit('update-temporary-project-list', temporaryProjectList.value)
})

watch(indicators, () => {
  activeOf.value = activeListProjects.value.length
})

watch(scrollUpdated, () => {
  updateBounding()
})

watch(activeList, () => {
  updateActiveProjectList(activeList.value)
  emit('update-list', activeList.value)
  updateActiveListProjects()
})

watch(activeListProjects, async () => {
  active.value = 1
  activeOf.value = activeListProjects.value.length
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

watchEffect(() => {
  if (route.params.slug) {
    const inActiveList = !!activeListProjects.value.find(p => p.slug === route.params.slug)
    if (!inActiveList && firstRouteIsProject.value && !temporaryProjectList.value.length) {
      temporaryProjectList.value = props.data.list
    }
    const list = temporaryProjectList.value.length
      ? temporaryProjectList.value
      : inActiveList
      ? activeListProjects.value
      : props.data.list

    const index = list.findIndex(p => p.slug === route.params.slug)
    active.value = index + 1
    activeOf.value = list.length
  } else {
    firstRouteIsProject.value = false
    temporaryProjectList.value = []
  }
})

watch(current, () => {
  if (el.value && buttonsEl.value?.el) {
    const height: number = bounding.value > 0 ? bounding.value : el.value.offsetHeight - vh.value
    const projectScroll: number = current.value - vh.value * 2
    const offsetTop: number = Math.max(0, vh.value * 2 - current.value)
    const offsetBottom: number = Math.min(0, height - projectScroll)
    const y: number = offsetTop + offsetBottom
    gsap.set(buttonsEl.value.el, { y })
    indexEl.value && gsap.set(indexEl.value, { y })
  }
})

function updateActiveListProjects() {
  activeListProjects.value =
    activeList.value === 'selected' ? selectedProjectsList.value : props.data.list
}

function updateActive(value: number) {
  if (route.params.slug) return
  active.value = value + 1
}

function onIntersect(el: HTMLElement, visible: boolean) {
  visible && updateSection('projects')
}

function onIntersectBg(el: HTMLElement, visible: boolean) {
  visible &&
    direction.value === 'down' &&
    section.value !== 'projects' &&
    updateSection('projects-bg')
}

function updateActiveList(value: 'selected' | 'all') {
  activeList.value === value && updateScrollTargetId('projects')
  activeList.value = value
}

function getAnchorTop(position: number): string {
  let top = getOffset()
  for (let i = 0; i < position; i++) {
    const { selected } = activeListProjects.value[i]
    const columns = isMobileLayout.value ? (selected ? 6 : 5) : selected ? 3.5 : 3
    top += getColumnWidth(columns) + layoutGutter.value
  }
  return toPx(top)
}

function getOffset(): number {
  const columns = isMobileLayout.value ? 6 : 3.5
  return (vh.value - (getColumnWidth(columns) * 7) / 5) * 0.5
}

async function updateBounding() {
  const bounding = getBounding(el.value as HTMLElement)
  top.value = bounding.top
  bottom.value = bounding.bottom - vh.value
}

function addVideo(params: { id: string; video?: FileVideo }) {
  const isVideoInstanced = !!instancedVideos.value.find(v => v.id === params.id)
  !isVideoInstanced &&
    params.video &&
    instancedVideos.value.push({ id: params.id, video: params.video })
}

function onButtonHoverUpdate(state: boolean) {
  onButton.value = state
}

onBeforeUnmount(() => {
  _to && clearTimeout(_to)
})

const emit = defineEmits(['update-list', 'update-active', 'update-temporary-project-list'])
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
        padding-left: calc(50vw - #{toColumns(6)} * 0.5);
        padding-right: calc(50vw - #{toColumns(5)} * 0.5);
        height: max-content;
        @include from__tablet--landscape {
          padding-left: calc(50vw - #{toColumns(3.5)} * 0.5);
          padding-right: calc(50vw - #{toColumns(3)} * 0.5);
        }
        .home__projects__project {
          display: inline-block;
          vertical-align: top;
          // border: 1px solid lime;
        }
      }
    }

    .home__projects__anchor {
      position: absolute;
      display: block;
      aspect-ratio: 5/7;
      width: toColumns(5);
      left: calc(50vw - #{toColumns(6)} * 0.5);
      border-radius: toScale(0.8rem);
      pointer-events: none;

      @include from__tablet--landscape {
        width: toColumns(3);
        left: calc(50vw - #{toColumns(3.5)} * 0.5);
        border-radius: toScale(1.6rem);
      }

      &--selected {
        width: toColumns(6);
        @include from__tablet--landscape {
          width: toColumns(3.5);
        }
      }
    }
  }

  &__index,
  &__date {
    display: flex;
    align-items: center;
    column-gap: toScale(0.6rem, 37.5rem);
    @include will-fade;
    @include t-number;
    @include from__tablet--landscape {
      column-gap: toScale(0.6rem);
    }
  }

  &__index {
    position: absolute;
    width: max-content;
    height: toScale(1.2rem, 37.5rem);
    @include from__tablet--landscape {
      height: toScale(2.4rem);
    }
    &__label {
      &--active {
        @include t-b3--number;
        @include from__tablet--landscape {
          transform: translateY(5%);
        }
      }
    }
    .svg__square {
      transform: translateY(20%);
      @include from__tablet--landscape {
        transform: translateY(10%);
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
    display: none;
    pointer-events: none;
    video {
      display: block;
      width: toColumns(2);
      height: max-content;
      border: 1px solid yellow;
    }
  }
}
</style>
