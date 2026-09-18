<template>
  <div
    :class="[
      'svg__project__memory-project',
      { 'svg__project__memory-project--animation': animation },
    ]">
    <template v-if="isMobileLayout">
      <Ticker
        ref="firstLineTickerEl"
        :drag-on-target="true"
        :ignore-update-scroll="true"
        :ticker="!next ? nextProjectTickerFirstLine : undefined"
        class="svg__project__memory-project__ticker"
        @update="emit('update-scroll')">
        <div v-for="i in 2" :key="i">
          <SvgProjectMemoryProjectFirstLine
            v-transition:in="{ callback: animation ? shuffleIn : () => {} }" />
        </div>
      </Ticker>
      <Ticker
        ref="secondLineTickerEl"
        :drag-on-target="true"
        :ignore-update-scroll="true"
        :ticker="!next ? nextProjectTickerSecondLine : undefined"
        :starting-direction="1"
        class="svg__project__memory-project__ticker"
        @update="emit('update-scroll')">
        <div v-for="i in 2" :key="i">
          <SvgProjectMemoryProjectSecondLine
            v-transition:in="{ callback: animation ? shuffleIn : () => {} }" />
        </div>
      </Ticker>
    </template>
    <template v-else>
      <SvgProjectMemoryProjectFirstLine
        v-transition:in="{ callback: animation ? shuffleIn : () => {} }" />
      <SvgProjectMemoryProjectSecondLine
        v-transition:in="{ callback: animation ? shuffleIn : () => {} }" />
    </template>
  </div>
</template>

<script lang="ts" setup>
import { shuffleIn } from '~/utils/animations'
import Ticker from '~/components/Global/Ticker.vue'
import { type NextProjectTicker } from '~/types/front/store'

const props = defineProps<{
  next: boolean
  animation: boolean
  color?: string
}>()

const id = 'project-ticker-memory-project'

const nextProjectTickerFirstLine = ref<NextProjectTicker | undefined>(
  window.localStorage.getItem(`${id}-first-line`)
    ? JSON.parse(window.localStorage.getItem(`${id}-first-line`) as string)
    : undefined
)
const nextProjectTickerSecondLine = ref<NextProjectTicker | undefined>(
  window.localStorage.getItem(`${id}-second-line`)
    ? JSON.parse(window.localStorage.getItem(`${id}-second-line`) as string)
    : undefined
)

const { isMobileLayout } = useDevice()

const firstLineTickerEl = ref<typeof Ticker>()
const secondLineTickerEl = ref<typeof Ticker>()

const fill = computed(() => props.color || 'var(--black)')

onBeforeUnmount(() => {
  if (props.next && firstLineTickerEl.value && secondLineTickerEl.value) {
    firstLineTickerEl.value.pause()
    secondLineTickerEl.value.pause()
    window.localStorage.setItem(
      `${id}-first-line`,
      JSON.stringify(firstLineTickerEl.value.getTicker())
    )
    window.localStorage.setItem(
      `${id}-second-line`,
      JSON.stringify(secondLineTickerEl.value.getTicker())
    )
  }
})

const emit = defineEmits(['update-scroll'])
</script>

<style lang="scss">
.svg__project__memory-project {
  &--animation {
    svg {
      > path,
      > g {
        @include will-fade;
      }
    }
  }

  &__ticker {
    min-height: toScale(7.7rem, 37.5rem);
    margin-bottom: var(--layout-gutter);
    > div {
      padding-right: toScale(3.2rem, 37.5rem);
    }
    &:last-child {
      margin-bottom: 0;
    }
  }

  &__second-line {
    @include from__tablet--landscape {
      margin-top: toScale(1.2rem);
      margin-left: 24vw;
    }
  }

  svg path {
    fill: v-bind(fill);
  }
}
</style>
