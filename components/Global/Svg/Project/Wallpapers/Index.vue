<template>
  <SvgProjectWallpapersGoogle v-transition:in="{ callback: animation ? shuffleIn : () => {} }" />
  <SvgProjectWallpapersPixels v-transition:in="{ callback: animation ? shuffleIn : () => {} }" />
</template>

<script lang="ts" setup>
import { shuffleIn } from '~/utils/animations'

defineProps<{
  animation: boolean
}>()
</script>
