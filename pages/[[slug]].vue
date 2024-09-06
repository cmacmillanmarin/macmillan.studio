<template>
  <div v-if="data" class="home">
    <CustomHead :head="data.head" />

    <transition
      mode="out-in"
      :css="false"
      @leave="transitionFadeOut"
      @before-leave="onBeforeProjectLeave">
      <Project
        v-if="project"
        :key="projectSlug"
        :data="project"
        @mounted="onProjectMounted"
        @entered="onProjectEntered" />
    </transition>

    <HomeHero data-scroll data-scroll-continuous :data="data.hero" />

    <HomeProjects data-scroll :data="data.projects" />

    <HomeServices data-scroll :data="data.services" />

    <HomeAbout data-scroll :data="data.about" />

    <Footer data-scroll />
  </div>
</template>

<script lang="ts" setup>
import { type Data } from '~/types/data'
import { type Project } from '~/types/data'
import { transitionFadeOut } from '~/utils/animations'
import useStore from '~/store/useStore'

const route = useRoute()
const { data } = await useFetch<Data>('/api/data')

const { updateInProject, updateInProjectEntered } = useStore()

const inProject = ref<boolean>(false)
const inProjectEntered = ref<boolean>(false)
const projectSlug = computed<string>(() => `${route.params.slug}`)
const project = computed<Project | undefined>(() =>
  projectSlug.value ? data.value?.projects[projectSlug.value] : undefined
)

watch(inProject, () => {
  updateInProject(inProject.value)
})

watch(inProjectEntered, () => {
  updateInProjectEntered(inProjectEntered.value)
})

function onProjectMounted() {
  inProject.value = true
}

function onProjectEntered() {
  inProjectEntered.value = true
}

function onBeforeProjectLeave() {
  inProject.value = false
  inProjectEntered.value = false
}

definePageMeta({
  key: 'home',
})
</script>

<style lang="scss">
.home {
  @include page;
  .project {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 99;
  }
}
</style>
