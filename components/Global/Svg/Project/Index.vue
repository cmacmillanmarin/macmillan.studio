<template>
  <component
    :is="type"
    v-if="type"
    :animation="animation"
    :next="next"
    :color="color"
    @update-scroll="emit('update-scroll')" />
</template>

<script lang="ts" setup>
import type { Component } from 'vue'
import { hyphensToCamelcase } from '~/utils'

const props = defineProps<{
  project: string
  next: boolean
  animation: boolean
  color?: string
}>()

// Keyed by folder name so the lookup stays `hyphensToCamelcase(slug)`, as before.
// Static keys let Vite emit one chunk per project; resolving `:is` from a runtime
// string instead would need every one of these registered globally.
const loaders: Record<string, () => Promise<Component>> = {
  AQuestionOverGaza: () => import('./AQuestionOverGaza/Index.vue'),
  AlreadyHome: () => import('./AlreadyHome/Index.vue'),
  Ambia: () => import('./Ambia/Index.vue'),
  Buff: () => import('./Buff/Index.vue'),
  CarolinaHerrera: () => import('./CarolinaHerrera/Index.vue'),
  ChaosFashion: () => import('./ChaosFashion/Index.vue'),
  ChaosXMagic: () => import('./ChaosXMagic/Index.vue'),
  DomesticDataStreamers: () => import('./DomesticDataStreamers/Index.vue'),
  EmoryUniversity: () => import('./EmoryUniversity/Index.vue'),
  Evagher: () => import('./Evagher/Index.vue'),
  Fenty: () => import('./Fenty/Index.vue'),
  ForeverFrequencies: () => import('./ForeverFrequencies/Index.vue'),
  GoldVi: () => import('./GoldVi/Index.vue'),
  GoogleCloudTeamUsa: () => import('./GoogleCloudTeamUsa/Index.vue'),
  Gorillaz: () => import('./Gorillaz/Index.vue'),
  H2o: () => import('./H2o/Index.vue'),
  HublotDigitalBoutique: () => import('./HublotDigitalBoutique/Index.vue'),
  Inkollectors: () => import('./Inkollectors/Index.vue'),
  IntornoLabs: () => import('./IntornoLabs/Index.vue'),
  LoroPiana: () => import('./LoroPiana/Index.vue'),
  Melt: () => import('./Melt/Index.vue'),
  MemoryProject: () => import('./MemoryProject/Index.vue'),
  MoreThanAKit: () => import('./MoreThanAKit/Index.vue'),
  NikeHouseOfInnovation: () => import('./NikeHouseOfInnovation/Index.vue'),
  NikeTrailChallenge: () => import('./NikeTrailChallenge/Index.vue'),
  OrbitViewer: () => import('./OrbitViewer/Index.vue'),
  OurPlanet: () => import('./OurPlanet/Index.vue'),
  PangeaPropulsion: () => import('./PangeaPropulsion/Index.vue'),
  PixelWallpapers: () => import('./PixelWallpapers/Index.vue'),
  PlasticDesign: () => import('./PlasticDesign/Index.vue'),
  RomaLevin: () => import('./RomaLevin/Index.vue'),
  TateEsq: () => import('./TateEsq/Index.vue'),
  TheHelldivers2: () => import('./TheHelldivers2/Index.vue'),
  TheMortgageExpert: () => import('./TheMortgageExpert/Index.vue'),
  XavierCusso: () => import('./XavierCusso/Index.vue'),
}

const loader = loaders[hyphensToCamelcase(props.project)]

// A project published in WordPress without a matching component used to render an
// empty element with no height, silently.
if (!loader) {
  console.warn(`[SvgProject] no component for project "${props.project}"`)
}

// Resolved once, matching the previous `ref()`: a changing `project` prop never
// re-resolved the component either.
const type = ref<Component | undefined>(loader ? defineAsyncComponent(loader) : undefined)

const emit = defineEmits(['update-scroll'])
</script>
