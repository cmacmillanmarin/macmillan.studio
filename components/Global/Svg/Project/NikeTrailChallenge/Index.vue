<template>
  <div
    :class="[
      'svg__project__nike-trail-challenge',
      { 'svg__project__nike-trail-challenge--animation': animation },
    ]">
    <template v-if="isMobileLayout">
      <Ticker
        ref="tickerEl"
        :drag-on-target="true"
        :ignore-update-scroll="true"
        :ticker="!next ? inProjectNextProjectTicker : undefined"
        class="svg__project__nike-trail-challenge__ticker"
        @update="emit('update-scroll')">
        <div v-for="i in 2" :key="i">
          <SvgProjectNikeTrailChallengeFirstLine
            v-transition:in="{ callback: animation ? shuffleIn : () => {} }" />
        </div>
      </Ticker>
      <Ticker
        ref="tickerEl"
        :drag-on-target="true"
        :ignore-update-scroll="true"
        :ticker="!next ? inProjectNextProjectTicker : undefined"
        :starting-direction="1"
        class="svg__project__nike-trail-challenge__ticker"
        @update="emit('update-scroll')">
        <div v-for="i in 2" :key="i">
          <SvgProjectNikeTrailChallengeSecondLine
            v-transition:in="{ callback: animation ? shuffleIn : () => {} }" />
        </div>
      </Ticker>
    </template>
    <template v-else>
      <SvgProjectNikeTrailChallengeFirstLine
        v-transition:in="{ callback: animation ? shuffleIn : () => {} }" />
      <SvgProjectNikeTrailChallengeSecondLine
        v-transition:in="{ callback: animation ? shuffleIn : () => {} }" />
    </template>
  </div>
</template>

<script lang="ts" setup>
import useStore from '~/store/useStore'
import { shuffleIn } from '~/utils/animations'
import Ticker from '~/components/Global/Ticker.vue'
import { storeToRefs } from 'pinia'

const props = defineProps<{
  next: boolean
  animation: boolean
  color?: string
}>()

const store = useStore()
const { updateInProjectNextProjectTicker } = store
const { inProjectNextProjectTicker } = storeToRefs(store)

const { isMobileLayout } = useDevice()

const tickerEl = ref<typeof Ticker>()

const fill = computed(() => props.color || 'var(--black)')

onBeforeUnmount(() => {
  if (props.next && tickerEl.value) {
    tickerEl.value.pause()
    updateInProjectNextProjectTicker(tickerEl.value.getNextProjectTicker())
  }
})

const emit = defineEmits(['update-scroll'])
</script>

<style lang="scss">
.svg__project__nike-trail-challenge {
  &--animation {
    svg {
      > path,
      > g {
        @include will-fade;
      }
    }
  }

  &__ticker {
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
