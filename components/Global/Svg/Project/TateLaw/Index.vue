<template>
  <div :class="['svg__project__tate-law', { 'svg__project__tate-law--animation': animation }]">
    <template v-if="isMobileLayout">
      <Ticker
        ref="firstLineTickerEl"
        :drag-on-target="true"
        :ignore-update-scroll="true"
        :ticker="!next ? nextProjectTickerFirstLine : undefined"
        class="svg__project__tate-law__ticker"
        @update="emit('update-scroll')">
        <div v-for="i in 2" :key="i">
          <SvgProjectTateLawFirstLine
            v-transition:in="{ callback: animation ? shuffleIn : () => {} }" />
        </div>
      </Ticker>
    </template>
    <template v-else>
      <SvgProjectTateLawFirstLine
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

const id = 'project-ticker-tate-law'

const nextProjectTickerFirstLine = ref<NextProjectTicker | undefined>(
  window.localStorage.getItem(id)
    ? JSON.parse(window.localStorage.getItem(id) as string)
    : undefined
)

const { isMobileLayout } = useDevice()

const firstLineTickerEl = ref<typeof Ticker>()

const fill = computed(() => props.color || 'var(--black)')

onBeforeUnmount(() => {
  if (props.next && firstLineTickerEl.value) {
    firstLineTickerEl.value.pause()
    window.localStorage.setItem(id, JSON.stringify(firstLineTickerEl.value.getTicker()))
  }
})

const emit = defineEmits(['update-scroll'])
</script>

<style lang="scss">
.svg__project__tate-law {
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
