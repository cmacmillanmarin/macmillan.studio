<template>
  <div class="footer__tetris__instructions">
    <div
      class="footer__tetris__instructions__content"
      @mouseenter="onMouseEnter"
      @mouseleave="onMouseLeave"
      v-transition:in="{ callback: shuffleIn }">
      <button
        class="footer__tetris__instructions__content__close"
        @mouseenter="onCloseButtonMouseEnter"
        @mouseleave="onCloseButtonMouseLeave"
        @click="close">
        <SvgAspa />
      </button>
      <p class="footer__tetris__instructions__content__title">How to play</p>
      <div class="footer__tetris__instructions__content__keys">
        <div class="footer__tetris__instructions__content__keys__key">
          <div class="footer__tetris__instructions__content__keys__key__icon">
            <SvgArrowTetris />
          </div>
          <div class="footer__tetris__instructions__content__keys__key__label">
            <p class="footer__tetris__instructions__content__keys__key__label__title">Move left</p>
            <p class="footer__tetris__instructions__content__keys__key__label__arrow">
              {{ isMobileLayout ? 'Tap left side of screen' : 'Left arrow' }}
            </p>
          </div>
        </div>
        <div class="footer__tetris__instructions__content__keys__key">
          <div class="footer__tetris__instructions__content__keys__key__icon--right">
            <SvgArrowTetris />
          </div>
          <div class="footer__tetris__instructions__content__keys__key__label">
            <p class="footer__tetris__instructions__content__keys__key__label__title">Move Right</p>
            <p class="footer__tetris__instructions__content__keys__key__label__arrow">
              {{ isMobileLayout ? 'Tap right side of screen' : 'Right arrow' }}
            </p>
          </div>
        </div>
        <div class="footer__tetris__instructions__content__keys__key">
          <div class="footer__tetris__instructions__content__keys__key__icon">
            <SvgSpaceBar />
          </div>
          <div class="footer__tetris__instructions__content__keys__key__label">
            <p class="footer__tetris__instructions__content__keys__key__label__title">Rotate</p>
            <p class="footer__tetris__instructions__content__keys__key__label__arrow">
              {{ isMobileLayout ? 'Tap above the piece' : 'Space Bar' }}
            </p>
          </div>
        </div>
        <div class="footer__tetris__instructions__content__keys__key">
          <div class="footer__tetris__instructions__content__keys__key__icon--down">
            <SvgArrowTetris />
          </div>
          <div class="footer__tetris__instructions__content__keys__key__label">
            <p class="footer__tetris__instructions__content__keys__key__label__title">Accelerate</p>
            <p class="footer__tetris__instructions__content__keys__key__label__arrow">
              {{ isMobileLayout ? 'Long tap' : 'Down arrow' }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import useStore from '~/store/useStore'

const store = useStore()
const { updateCursor, updateCursorColor } = store

const { isMobileLayout } = useDevice()

onMounted(() => {
  updateCursor('default')
})

function close(e: MouseEvent) {
  e.preventDefault()
  e.stopPropagation()
  emit('close')
}

function onMouseEnter() {
  updateCursorColor('black')
}

function onMouseLeave() {
  updateCursorColor('lime')
}

function onCloseButtonMouseEnter() {
  updateCursor('none')
}

function onCloseButtonMouseLeave() {
  updateCursor('default')
}

onBeforeUnmount(() => {
  updateCursor('close')
})

const emit = defineEmits(['close'])
</script>

<style lang="scss">
.footer__tetris__instructions {
  //   background-color: rgba(0, 0, 0, 0.5);

  p {
    color: var(--black) !important;
  }

  &__content {
    pointer-events: auto;
    width: calc(100% - var(--layout-margin) * 2);
    padding: toScale(4rem, 37.5rem);
    background-color: var(--lime);
    @include will-fade;
    @include absolute-center;

    @include from__tablet--landscape {
      width: toScale(48rem);
      padding: toScale(4rem);
    }

    &__close {
      position: absolute;
      padding: 0;
      border: none;
      width: max-content;
      top: var(--layout-margin);
      right: var(--layout-margin);

      @include from__tablet--landscape {
        top: toScale(2.4rem);
        right: toScale(2.4rem);
      }

      &:focus-visible {
        outline: 2px solid var(--black);
      }

      .svg__aspa {
        width: toScale(1.8rem, 37.5rem);
        height: auto;
        @include from__tablet--landscape {
          width: toScale(2.4rem);
          height: auto;
        }
        path {
          fill: black;
        }
      }
    }

    &__title {
      margin-bottom: toScale(4rem, 37.5rem);
      @include t-h3;
      @include from__tablet--landscape {
        margin-bottom: toScale(4rem);
      }
    }

    &__keys {
      display: flex;
      flex-wrap: wrap;
      row-gap: toScale(1.6rem, 37.5rem);
      padding-left: toScale(2.4rem, 37.5rem);
      padding-bottom: toScale(2rem, 37.5rem);
      @include from__tablet--landscape {
        padding-bottom: toScale(2rem);
        row-gap: toScale(4rem);
        padding-left: 0;
      }

      &__key {
        width: 100%;
        display: flex;
        column-gap: toScale(1.2rem, 37.5rem);
        align-items: center;

        @include from__tablet--landscape {
          width: 50%;
          column-gap: toScale(1rem);
        }

        &__icon {
          width: toScale(4.8rem, 37.5rem);
          height: toScale(4.8rem, 37.5rem);
          background-color: var(--black);
          border-radius: 100%;
          @include from__tablet--landscape {
            width: toScale(5.6rem);
            height: toScale(5.6rem);
          }
          &--right {
            @extend .footer__tetris__instructions__content__keys__key__icon;
            transform: rotate(180deg);
          }
          &--down {
            @extend .footer__tetris__instructions__content__keys__key__icon;
            transform: rotate(-90deg);
          }
        }

        &__label {
          &__title {
            margin-bottom: 0.1rem;
            @include t-b3;
          }
          &__arrow {
            @include t-b1;
          }
        }
      }
    }
  }
}
</style>
