<template>
  <div class="footer__tetris__layout">
    <transition
      mode="out-in"
      :css="false"
      :appear="true"
      @enter="transitionShuffleIn"
      @leave="transitionDone">
      <div v-if="isMobileLayout" class="footer__tetris__layout__mobile-button">
        <button @click="$emit(over ? 'play' : 'close')">
          <transition
            mode="out-in"
            :css="false"
            :appear="true"
            @enter="transitionShuffleIn"
            @leave="transitionDone">
            <SvgClose v-if="!over" />
            <SvgPlay v-else />
          </transition>
        </button>
      </div>
    </transition>

    <div class="footer__tetris__layout__info">
      <transition
        mode="out-in"
        :css="false"
        :appear="true"
        @enter="transitionShuffleIn"
        @leave="transitionDone">
        <div v-if="nextPiece && !over" class="footer__tetris__layout__info__piece">
          <p>Next Piece:</p>
          <transition
            mode="out-in"
            :css="false"
            :appear="true"
            @enter="transitionShuffleIn"
            @leave="transitionDone">
            <FooterTetrisPiece :key="nextPiece.name" :piece="nextPiece" />
          </transition>
        </div>
        <div v-else class="footer__tetris__layout__info__message">
          <template v-if="over">
            <p>{{ getMessage() }}</p>
          </template>
        </div>
      </transition>

      <div class="footer__tetris__layout__info__score">
        <div class="footer__tetris__layout__info__score__points">
          <div class="footer__tetris__layout__info__score__points__label">
            <transition
              mode="out-in"
              :css="false"
              @enter="transitionShuffleIn"
              @leave="transitionDone">
              <SvgSquare :key="score" />
            </transition>
            <p>Score:</p>
          </div>
          <p class="footer__tetris__layout__info__score__points__value">
            {{ startWithZero(score) }}
          </p>
        </div>
        <div class="footer__tetris__layout__info__score__level">
          <div class="footer__tetris__layout__info__score__level__label">
            <transition
              mode="out-in"
              :css="false"
              :appear="true"
              @enter="transitionShuffleIn"
              @leave="transitionDone">
              <SvgSquare :key="level" />
            </transition>
            <p>Level:</p>
          </div>
          <p class="footer__tetris__layout__info__score__level__value">
            {{ startWithZero(level) }}
          </p>
        </div>
      </div>
    </div>
    <SvgGameOver v-if="over" />
  </div>
</template>

<script lang="ts" setup>
import { startWithZero } from '~/utils'
import type { Piece } from '~/types/front/tetris'
import { transitionDone, transitionShuffleIn } from '~/utils/animations'

const props = defineProps<{
  over: boolean
  score: number
  level: number
  nextPiece?: Piece
}>()

const { isMobileLayout } = useDevice()

const lowScoreMessages: Array<string> = [
  'Every expert was once a beginner!',
  "You're on your way! Keep going!",
  'Great start! Keep practicing!',
  'Well played! Improvement awaits!',
]
const midScoreMessages: Array<string> = [
  'Nice work! Keep pushing!',
  "Impressive! You're getting it!",
  'Stacking up points like a pro!',
  'Awesome game! Aim higher next time!',
  'Look at you go! Keep leveling up!',
]
const highScoreMessages: Array<string> = [
  "You're a Tetris master in the making!",
  'Fantastic game! Unstoppable!',
  'Serious skill! Keep it up!',
  'Yeah! Stacking like a pro!',
  'Amazing! Serious Tetris talent!',
]
const veryHighScoreMessages: Array<string> = [
  "Unbelievable game! You're a champ!",
  'You crushed it! Epic performance!',
  'Incredible! Top-tier skill!',
  'Bruh! Stacking with the best!',
  'You conquered Tetris! Unreal game!',
]

const messages = computed<Array<string>>(() => {
  if (props.score < 100) return lowScoreMessages
  if (props.score < 1000) return midScoreMessages
  if (props.score < 10000) return highScoreMessages
  return veryHighScoreMessages
})

let previousMessageIndex: number = 0

function getMessage(): string {
  let index = Math.floor(Math.random() * messages.value.length)
  while (index === previousMessageIndex) {
    index = Math.floor(Math.random() * messages.value.length)
  }
  previousMessageIndex = index
  return messages.value[index]
}
</script>

<style lang="scss">
.footer__tetris__layout {
  pointer-events: none;
  position: relative;
  max-width: var(--layout-max-width);
  margin: auto;
  @include will-fade;

  p {
    @include t-b1;
  }

  &__mobile-button {
    position: absolute;
    top: var(--layout-margin);
    right: var(--layout-margin);
    @include will-fade;

    button {
      pointer-events: auto;
      display: flex;
      align-items: center;
      justify-content: center;
      width: toScale(4.4rem, 37.5rem);
      height: toScale(4.4rem, 37.5rem);
      background: var(--lime);
      border: 0;
      padding: 0;
      border-radius: 50%;

      .svg__close {
        width: toScale(3rem, 37.5rem);
      }

      .svg__play {
        width: toScale(1.6rem, 37.5rem);
        transform: translateX(15%);
      }

      svg {
        height: auto;
        @include will-fade;
        path {
          fill: var(--black);
        }
      }
    }
  }

  &__info {
    display: flex;
    justify-content: space-between;
    margin: calc(var(--vh) * 0.5) var(--layout-margin) 0;
    transform: translateY(-50%);

    @include from__tablet--landscape {
      margin: 0;
      transform: none;
      padding: toScale(3rem) toScale(4.6rem) 0;
    }

    &__piece {
      display: flex;
      align-items: center;
      @include will-fade;
    }

    &__message {
      min-width: 2rem;
      max-width: 40.5%;
      padding-top: 0.2rem;
      @include will-fade;
      @include from__tablet--landscape {
        padding-top: 1.6rem;
      }
    }

    &__score {
      &__points,
      &__level {
        display: flex;
        justify-content: space-between;
        &__label {
          display: flex;
          align-items: center;
          .svg__square {
            margin-right: 1rem;
            @include will-fade;
          }
        }
        &__value {
          margin-left: 1rem;
          @include t-number;
        }
      }

      &__points {
        margin-bottom: 0.4rem;
      }
    }
  }

  .svg__game-over {
    position: absolute;
    bottom: var(--layout-margin);
    left: var(--layout-margin);
    width: calc(100% - var(--layout-margin) * 2);
    @include from__tablet--landscape {
      width: toScale(94.1rem);
      left: toScale(4.6rem);
      bottom: toScale(3rem);
    }
  }
}
</style>
