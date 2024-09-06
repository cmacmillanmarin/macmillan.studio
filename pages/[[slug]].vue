<template>
  <div v-if="data" class="home">
    <CustomHead :head="data.head" />

    <transition
      mode="out-in"
      :css="false"
      @leave="transitionFadeOut"
      @before-leave="onBeforeProjectLeave">
      <Project v-if="project" :key="projectSlug" :data="project" @entered="onProjectEntered" />
    </transition>

    <HomeHero data-scroll data-scroll-continuous :data="data.hero" :in-project="inProject" />

    <HomeProjects data-scroll :data="data.projects" :in-project="inProject" />

    <HomeServices data-scroll :data="data.services" :in-project="inProject" />

    <HomeAbout data-scroll :data="data.about" :in-project="inProject" />

    <Footer data-scroll :in-project="inProject" />
  </div>
</template>

<script lang="ts" setup>
import { type Data } from '~/types/data'
import { type Project } from '~/types/data'
import { transitionFadeOut } from '~/utils/animations'

const route = useRoute()
const { data } = await useFetch<Data>('/api/data')

const inProject = ref<boolean>(false)
const projectSlug = computed<string>(() => `${route.params.slug}`)
const project = computed<Project | undefined>(() =>
  projectSlug.value ? data.value?.projects[projectSlug.value] : undefined
)

function onProjectEntered() {
  inProject.value = true
}

function onBeforeProjectLeave() {
  inProject.value = false
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
