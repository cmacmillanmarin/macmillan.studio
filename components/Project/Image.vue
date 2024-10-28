<template>
  <div class="project__image">
    <CustomImage :data="data" :size="{ d: 1, t: 1, m: 1 }" :lazy="true" />
  </div>
</template>

<script lang="ts" setup>
import type { Image } from '~/types/wordpress'

defineProps<{
  data: Image
}>()
</script>
