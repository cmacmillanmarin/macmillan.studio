<template>
  <SvgProjectWallpapersGoogle v-transition:in="{ callback: shuffleIn }" />
  <SvgProjectWallpapersPixels v-transition:in="{ callback: shuffleIn }" />
</template>

<script lang="ts" setup>
import { shuffleIn } from '~/utils/animations'
</script>
