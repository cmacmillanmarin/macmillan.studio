<template>
  <svg class="footer__tetris__piece" view-box="0 0 100 100">
    <g v-if="letter === 'o'">
      <rect
        v-for="i in 4"
        :x="toPercentage(i <= 2 ? 25 : 50)"
        :y="toPercentage(i % 2 === 0 ? 25 : 50)"
        :width="toPercentage(25)"
        :height="toPercentage(25)" />
    </g>
    <g v-else-if="letter === 'j'">
      <rect
        v-for="i in 4"
        :x="toPercentage(i !== 4 ? 50 + 12.5 : 50 - 12.5)"
        :y="toPercentage(i !== 4 ? 25 * (i - 1) : 50)"
        :width="toPercentage(25)"
        :height="toPercentage(25)" />
    </g>
    <g v-else-if="letter === 'l'">
      <rect
        v-for="i in 4"
        :x="toPercentage(i !== 4 ? 50 - 12.5 : 50 + 12.5)"
        :y="toPercentage(i !== 4 ? 25 * (i - 1) : 50)"
        :width="toPercentage(25)"
        :height="toPercentage(25)" />
    </g>
    <g v-else-if="letter === 'i'">
      <rect
        v-for="i in 4"
        :x="toPercentage(50 - 12.5)"
        :y="toPercentage(25 * (i - 1))"
        :width="toPercentage(25)"
        :height="toPercentage(25)" />
    </g>
    <g v-else-if="letter === 's'">
      <rect
        v-for="i in 4"
        :x="toPercentage(i <= 2 ? 25 * i : 25 + 25 * (i - 2))"
        :y="toPercentage(i <= 2 ? 50 : 25)"
        :width="toPercentage(25)"
        :height="toPercentage(25)" />
    </g>
    <g v-else-if="letter === 'z'">
      <rect
        v-for="i in 4"
        :x="toPercentage(i <= 2 ? 25 * i : 25 + 25 * (i - 2))"
        :y="toPercentage(i <= 2 ? 25 : 50)"
        :width="toPercentage(25)"
        :height="toPercentage(25)" />
    </g>
    <g v-else-if="letter === 't'">
      <rect
        v-for="i in 4"
        :x="toPercentage(i !== 4 ? 25 + 25 * (i - 1) : 50)"
        :y="toPercentage(i !== 4 ? 25 : 50)"
        :width="toPercentage(25)"
        :height="toPercentage(25)" />
    </g>
  </svg>
</template>

<script lang="ts" setup>
import { toPercentage } from '~/utils'
import type { Piece, PieceType } from '~/types/front/tetris'

const props = defineProps<{
  piece: Piece
}>()

const letter = ref<PieceType>(props.piece.name)
</script>

<style lang="scss">
.footer__tetris__piece {
  display: block;
  width: toScale(3.2rem, 37.5rem);
  height: toScale(3.2rem, 37.5rem);
  @include will-fade;
  @include from__tablet--landscape {
    width: toScale(5rem);
    height: toScale(5rem);
  }
  rect {
    fill: var(--lime);
    stroke: var(--black);
    stroke-width: 0.5;
  }
}
</style>
