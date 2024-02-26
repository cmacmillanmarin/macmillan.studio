<template>
  <div
    class="c-module-title"
    :id="`${slugify(data.tableOfContent)}-target`"
    data-scroll-target-top
    data-scroll-target-offset="62"
    v-intersect="{ callback: intersect }">
    <h3
      v-if="data.tableOfContent !== data.label"
      class="c-module-title__headline t-b3 t-b3--bold t-b3--uppercase t-burgundy"
      :class="{ 'c-module-title__headline--no-title': !data.label }">
      {{ data.tableOfContent }}
    </h3>
    <h2 v-if="data.label" class="t-h3 t-burgundy">{{ data.label }}</h2>
  </div>
</template>

<script lang="ts" setup>
import { slugify } from '~/utils'
import type { TitleModule } from '~/types/wordpress/modules'

const props = defineProps<{
  data: TitleModule
}>()

function intersect(el: HTMLElement, visible: boolean): void {
  emit('update-active-content', { key: slugify(props.data.tableOfContent), visible })
}

const emit = defineEmits<{
  (e: 'update-active-content', params: { key: string; visible: boolean }): void
}>()
</script>

<style lang="scss">
.c-module-title {
  &__headline {
    margin-bottom: 0.8rem;
    @include from__desktop {
      margin-bottom: 1.6rem;
    }
    &--no-title {
      margin-bottom: 0;
    }
  }
}
</style>
