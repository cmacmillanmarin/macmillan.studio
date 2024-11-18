<template>
  <SvgProjectWallpapers
    :animation="animation"
    :next="next"
    @update-scroll="emit('update-scroll')" />
</template>

<script lang="ts" setup>
defineProps<{
  project: string
  next: boolean
  animation: boolean
}>()

const emit = defineEmits(['update-scroll'])
</script>
