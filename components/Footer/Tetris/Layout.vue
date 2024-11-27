<template>
  <div class="footer__tetris__layout">
    <transition
      mode="out-in"
      :css="false"
      :appear="true"
      @enter="transitionShuffleIn"
      @leave="transitionDone">
      <div
        v-if="isMobileLayout"
        :key="`${over}`"
        :class="[
          'footer__tetris__layout__mobile-button',
          { 'footer__tetris__layout__mobile-button--over': over },
        ]">
        <button @click="$emit(over ? 'play' : 'close')">
          <transition
            mode="out-in"
            :css="false"
            :appear="true"
            @enter="transitionShuffleIn"
            @leave="transitionDone">
            <SvgAspa v-if="!over" />
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
        <div v-if="!over" class="footer__tetris__layout__info__left">
          <div v-if="nextPiece" class="footer__tetris__layout__info__left__piece">
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
          <button
            :class="[
              'footer__tetris__layout__info__left__instructions',
              { 'footer__tetris__layout__info__left__instructions--active': instructions },
            ]"
            @click="$emit('open-instructions')"
            @mouseenter="onInstructionsEnter"
            @mouseleave="onInstructionsLeave">
            <transition
              mode="out-in"
              :css="false"
              :appear="true"
              @enter="transitionShuffleIn"
              @leave="transitionDone">
              <SvgSquare v-if="!instructions" />
              <div v-else class="footer__tetris__layout__info__left__instructions__square" />
            </transition>
            <span>Info</span>
          </button>
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
              @before-enter="prepareFadeIn"
              @enter="transitionShuffleIn"
              @leave="transitionDone">
              <SvgSquare :key="startWithZero(score)" />
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

    <FooterTetrisInstructions v-if="instructions" @close="$emit('close-instructions')" />

    <SvgGameOver v-if="over && !isMobileLayout" />
    <SvgGameOverMobile v-else-if="over" />
  </div>
</template>

<script lang="ts" setup>
import { gsap } from 'gsap/gsap-core'
import useStore from '~/store/useStore'
import { startWithZero } from '~/utils'
import type { Piece } from '~/types/front/tetris'
import { prepareFadeIn, transitionDone, transitionShuffleIn, shuffleIn } from '~/utils/animations'

const props = defineProps<{
  over: boolean
  score: number
  level: number
  instructions: boolean
  nextPiece?: Piece
}>()

const store = useStore()
const { updateCursor, updateCursorPosition } = store

const { toScale } = useCss()
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

function onInstructionsEnter(e: MouseEvent): void {
  if (isMobileLayout.value) return
  const spanEl = (e.target as HTMLElement).querySelector('span')
  if (spanEl) {
    const { left, top } = spanEl.getBoundingClientRect()
    updateCursorPosition({ x: left - toScale(20), y: top + toScale(8) })
    gsap.set(spanEl, { opacity: 0 })
    shuffleIn({ el: spanEl })
  }
  updateCursor('default')
}

function onInstructionsLeave(e: MouseEvent): void {
  updateCursorPosition({ x: -1, y: -1 })
  if (isMobileLayout.value || props.instructions) return
  updateCursor('close')
}
</script>

<style lang="scss">
.footer__tetris__layout {
  pointer-events: none;
  position: relative;
  max-width: var(--layout-max-width);
  margin: auto;
  @include will-fade;

  &__mobile-button {
    position: absolute;
    top: var(--layout-margin);
    left: 50%;
    transform: translateX(-50%);
    @include will-fade;

    &--over {
      top: 45%;
      transform: translate(-50%, -50%);
      button {
        background-color: var(--lime) !important;
        svg path {
          fill: var(--black);
        }
      }
    }

    button {
      pointer-events: auto;
      display: flex;
      align-items: center;
      justify-content: center;
      width: toScale(5.6rem, 37.5rem);
      height: toScale(5.6rem, 37.5rem);
      background: rgba(0, 0, 0, 0.5);
      border: 0;
      padding: 0;
      border-radius: 50%;

      .svg__play {
        transform: translateX(15%);
      }

      svg {
        height: auto;
        @include will-fade;
      }
    }
  }

  &__info {
    display: flex;
    justify-content: space-between;
    // margin: calc(var(--vh) * 0.5) var(--layout-margin) 0;
    // transform: translateY(-50%);
    padding: toScale(2.4rem, 37.5rem) var(--layout-margin) 0;

    @include from__tablet--landscape {
      // margin: 0;
      // transform: none;
      padding: toScale(3rem) toScale(4.6rem) 0;
    }

    &__left {
      pointer-events: auto;
      transform: translateY(-12%);
      @include will-fade;

      &__piece {
        display: flex;
        align-items: center;
        transform: translateY(-0.1rem);
        @include t-b1;
      }

      &__instructions {
        position: relative;
        color: var(--lime);
        display: flex;
        align-items: center;
        justify-content: flex-start;
        column-gap: toScale(0.8rem, 37.5rem);
        padding: 0;
        transform: translateY(-15%);
        border: none;
        @include t-b1;

        // &--active {
        //   padding-left: toScale(1.6rem, 37.5rem);
        //   @include from__tablet--landscape {
        //     padding-left: toScale(2rem);
        //   }
        // }

        @include from__tablet--landscape {
          column-gap: toScale(0.8rem);
        }

        &__square,
        .svg__square {
          @include will-fade;
        }

        &__square {
          width: toScale(0.8rem, 37.5rem);
          height: toScale(0.8rem, 37.5rem);
          border: 1px solid var(--lime);
          @include from__tablet--landscape {
            width: toScale(1.2rem);
            height: toScale(1.2rem);
          }
        }
      }
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

    p {
      @include t-b1;
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
            will-change: opacity;
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

  .svg__game-over,
  .svg__game-over--mobile {
    position: absolute;
    bottom: var(--layout-margin);
    left: var(--layout-margin);
    @include from__tablet--landscape {
      width: toScale(94.1rem);
      left: toScale(4.6rem);
      bottom: toScale(3rem);
    }
  }
}
</style>
