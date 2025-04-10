<template>
  <div
    :class="['svg__project__intorno-labs', { 'svg__project__intorno-labs--animation': animation }]">
    <template v-if="isMobileLayout">
      <Ticker
        ref="tickerEl"
        :drag-on-target="true"
        :ignore-update-scroll="true"
        :ticker="!next ? nextProjectTicker : undefined"
        class="svg__project__intorno-labs__ticker"
        @update="emit('update-scroll')">
        <div v-for="i in 2" :key="i">
          <SvgProjectIntornoLabsFirstLine
            v-transition:in="{ callback: animation ? shuffleIn : () => {} }" />
        </div>
      </Ticker>
      <SvgProjectIntornoLabsSecondLine
        v-transition:in="{ callback: animation ? shuffleIn : () => {} }" />
    </template>
    <template v-else>
      <SvgProjectIntornoLabsFirstLine
        v-transition:in="{ callback: animation ? shuffleIn : () => {} }" />
      <SvgProjectIntornoLabsSecondLine
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

const id = 'project-ticker-intorno-labs'

const nextProjectTicker = ref<NextProjectTicker | undefined>(
  window.localStorage.getItem(id)
    ? JSON.parse(window.localStorage.getItem(id) as string)
    : undefined
)

const { isMobileLayout } = useDevice()

const tickerEl = ref<typeof Ticker>()

const fill = computed(() => props.color || 'var(--black)')

onBeforeUnmount(() => {
  if (props.next && tickerEl.value) {
    tickerEl.value.pause()
    window.localStorage.setItem(id, JSON.stringify(tickerEl.value.getTicker()))
  }
})

const emit = defineEmits(['update-scroll'])
</script>

<style lang="scss">
.svg__project__intorno-labs {
  &--animation {
    svg {
      > path,
      > g {
        @include will-fade;
      }
    }
  }

  &__first-line {
    margin: auto;
    @include from__tablet--landscape {
      margin: 0;
      margin-bottom: toScale(1.2rem);
    }
  }

  &__second-line {
    margin: auto;
    @include from__tablet--landscape {
      margin: 0;
      margin-left: 38.9vw;
    }
  }

  &__ticker {
    min-height: toScale(7.7rem, 37.5rem);
    margin-bottom: var(--layout-gutter);
    > div {
      padding-right: toScale(3.2rem, 37.5rem);
    }
  }

  svg path {
    fill: v-bind(fill);
  }
}
</style>
