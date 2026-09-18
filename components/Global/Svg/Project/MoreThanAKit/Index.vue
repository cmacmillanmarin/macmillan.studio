<template>
  <div
    :class="[
      'svg__project__more-than-a-kit',
      { 'svg__project__more-than-a-kit--animation': animation },
    ]">
    <template v-if="isMobileLayout">
      <SvgProjectMoreThanAKitFirstLine
        v-transition:in="{ callback: animation ? shuffleIn : () => {} }" />
      <Ticker
        ref="tickerEl"
        :drag-on-target="true"
        :ignore-update-scroll="true"
        :ticker="!next ? nextProjectTicker : undefined"
        class="svg__project__more-than-a-kit__ticker"
        @update="emit('update-scroll')">
        <div v-for="i in 2" :key="i">
          <SvgProjectMoreThanAKitSecondLine
            v-transition:in="{ callback: animation ? shuffleIn : () => {} }" />
        </div>
      </Ticker>
    </template>
    <template v-else>
      <SvgProjectMoreThanAKitFirstLine
        v-transition:in="{ callback: animation ? shuffleIn : () => {} }" />
      <SvgProjectMoreThanAKitSecondLine
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

const id = 'project-ticker-more-than-a-kit'

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
.svg__project__more-than-a-kit {
  &--animation {
    svg {
      > path,
      > g {
        @include will-fade;
      }
    }
  }

  &__first-line {
    margin: 0 auto;
    @include from__tablet--landscape {
      margin: 0;
    }
  }

  &__second-line {
    @include from__tablet--landscape {
      margin-top: toScale(1.2rem);
      margin-left: 11.7vw;
    }
  }

  &__ticker {
    min-height: toScale(7.7rem, 37.5rem);
    margin-top: var(--layout-gutter);
    > div {
      padding-right: toScale(3.2rem, 37.5rem);
    }
  }

  svg path {
    fill: v-bind(fill);
  }
}
</style>
