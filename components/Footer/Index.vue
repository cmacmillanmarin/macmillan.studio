<template>
  <footer
    ref="el"
    :class="['footer', { 'footer--game-over': tetris && over }]"
    id="contact-target"
    @click="playClick && resetTetris()">
    <div class="footer__intersect" v-intersect="{ callback: onIntersect }" />

    <transition
      mode="out-in"
      :css="false"
      @enter="transitionShuffleIn"
      @leave="transitionShuffleOut">
      <div v-if="section === 'contact' && !tetris" class="footer__hour">
        <SvgSquare />
        <p v-html="`${hour}h {CET}`" />
      </div>
    </transition>

    <transition
      mode="out-in"
      :css="false"
      @enter="transitionShuffleIn"
      @leave="transitionShuffleOut">
      <div v-if="!tetris" class="footer__squares">
        <SvgSquare v-intersect="{ callback: squareIn }" />
        <SvgSquare v-intersect="{ callback: squareIn }" />
        <SvgSquare v-intersect="{ callback: squareIn }" />
        <SvgSquare v-intersect="{ callback: squareIn }" />
      </div>
    </transition>

    <transition mode="out-in" :css="false" @leave="transitionShuffleOut">
      <div
        v-if="!tetris"
        class="footer__email"
        v-transition:in="{ callback: fadeIn }"
        @mouseenter="onEmailMouseEnter"
        @mouseleave="onEmailMouseLeave"
        @click="copyEmail">
        <GridGoldenRatio v-if="gridType === 'golden-ratio'" />
        <GridRuleOfThirds v-else-if="gridType === 'rule-of-thirds'" />
        <div class="footer__email__christian">
          <button aria-label="Copy email">
            <SvgChristian />
          </button>
        </div>
        <div class="footer__email__domain">
          <button aria-label="Copy email">
            <SvgDomain />
          </button>
        </div>
        <div class="footer__email__extension">
          <button aria-label="Copy email">
            <SvgExtension />
          </button>
        </div>
      </div>
    </transition>

    <transition mode="out-in" :css="false" @leave="transitionShuffleOut">
      <nav v-if="!tetris" class="footer__nav" v-transition:in="{ callback: fadeIn }">
        <ul class="footer__nav__social">
          <li v-for="{ to, type, label } in rrss" class="footer__nav__social__link">
            <DecorativeLink :label="label" :to="to" :type="type" />
          </li>
        </ul>
        <ul class="footer__nav__credits">
          <li class="footer__nav__credits__link">
            <button
              class="footer__nav__credits__link__btn--tetris"
              @mouseenter="shuffle"
              @click="playTetris">
              <span>Play Tetris</span>
              <SvgPlaySmall />
            </button>
          </li>
        </ul>
      </nav>
    </transition>

    <transition mode="out-in" :css="false" @leave="transitionShuffleOut">
      <div v-if="!tetris" class="footer__location" v-transition:in="{ callback: fadeIn }">
        <div class="footer__location__coordinates">
          <a
            href="https://maps.app.goo.gl/osjpdZpbnTjgLg7h7"
            target="__blank"
            rel="noopener"
            @mouseenter="shuffle">
            Cádiz—36.5282º N, 6.18892º W
          </a>
        </div>
        <div class="footer__location__year">
          <p>©2023</p>
        </div>
      </div>
    </transition>

    <transition
      mode="out-in"
      :css="false"
      @enter="transitionShuffleIn"
      @leave="transitionShuffleOut">
      <div
        v-if="tetris"
        class="footer__close"
        @mouseenter="onCloseMouseEnter"
        @mouseleave="onCloseMouseLeave">
        <button @click="closeTetris">CLOSE</button>
      </div>
    </transition>

    <transition
      mode="out-in"
      :css="false"
      @enter="transitionShuffleIn"
      @leave="transitionShuffleOut">
      <div v-if="tetris && !over" class="footer__score">
        <p>score: {{ score }}</p>
        <p>level: {{ level }}</p>
        <p>next Piece: {{ nextPiece?.name }}</p>
      </div>
    </transition>

    <transition
      mode="out-in"
      :css="false"
      @enter="transitionShuffleIn"
      @leave="transitionShuffleOut"
      @after-enter="waitPlayClick"
      @after-leave="ignorePlayClick">
      <div v-if="tetris && over" class="footer__game-over">
        <p>GAME OVERRRRR! {{ score }}</p>
      </div>
    </transition>

    <Tetris ref="tetrisEl" :active="tetris" />
  </footer>
</template>

<script lang="ts" setup>
import { gsap } from 'gsap'
import { storeToRefs } from 'pinia'
import useStore from '~/store/useStore'
import useScrollStore from '~/store/useScrollStore'
import { shuffleElsIn, fadeIn, fadeOut } from '~/utils/animations'
import Tetris from '~/components/Footer/Tetris.vue'
import type { Piece } from '~/types/front/tetris'

const store = useStore()
const { updateSection, updateCursor } = store
const { cursor, section, gridType } = storeToRefs(store)
const scrollStore = useScrollStore()
const { disableScroll } = scrollStore
const { direction } = storeToRefs(scrollStore)

const rrss = ref([
  {
    label: 'GitHub',
    to: 'https://www.github.com/cmacmillanmarin',
    type: 'external',
  },
  {
    label: 'LinkedIn',
    to: 'https://www.linkedin.com/in/cmacmillanmarin/',
    type: 'external',
  },

  {
    label: 'Twitter',
    to: 'https://www.twitter.com/cmacmillanmarin',
    type: 'external',
  },
  {
    label: 'Unsplash',
    to: 'https://unsplash.com/@cmacmillanmarin',
    type: 'external',
  },
  {
    label: 'Strava',
    to: 'https://www.strava.com/cmacmillanmarin',
    type: 'external',
  },
  {
    label: 'Instagram',
    to: 'https://www.instagram.com/cmacmillanmarin',
    type: 'external',
  },
])

const el = ref<HTMLElement>()
const hour = ref<string>('')
let _to: any
let _to2: any

const tetris = ref<boolean>(false)
const tetrisEl = ref<typeof Tetris>()
const score = computed<number>(() => tetrisEl.value?.score || 0)
const level = computed<number>(() => tetrisEl.value?.level || 0)
const nextPiece = computed<Piece | null>(() => tetrisEl.value?.nextPiece || null)
const over = computed<boolean>(() => tetrisEl.value?.over || false)
const playClick = ref<boolean>(false)

watch(tetris, () => {
  disableScroll(tetris.value)
  tetris.value && over.value && updateCursor('play')
})

watch(over, () => {
  updateCursor(over.value ? 'play' : 'default')
})

onMounted(() => {
  updateHour()
})

function playTetris() {
  tetris.value = true
}

function closeTetris() {
  tetris.value = false
}

function shuffle(e: MouseEvent) {
  const { target } = e
  const span = target instanceof HTMLElement ? target.querySelector('span') : null
  const shuffleEl = (span ? span : target) as HTMLElement
  if (shuffleEl) {
    gsap.set(shuffleEl, { opacity: 0 })
    shuffleElsIn({ els: [shuffleEl] })
  }
}

function onIntersect(el: HTMLElement, visible: boolean) {
  if (visible) updateSection('contact')
  else if (direction.value === 'up') updateSection('about-awards')
}

function onEmailMouseEnter() {
  !tetris.value && updateCursor('copy')
}

function onEmailMouseLeave() {
  if (tetris.value) return
  updateCursor('default')
  _to2 && clearTimeout(_to2)
}

function copyEmail() {
  navigator.clipboard
    .writeText('christian@macmillan.studio')
    .then(() => {
      updateCursor('copied')
      _to2 && clearTimeout(_to2)
      _to2 = setTimeout(() => {
        cursor.value === 'copied' && updateCursor('copy')
      }, 2000)
    })
    .catch(err => {
      console.error('Failed to copy text: ', err)
    })
}

function updateHour() {
  const square = el.value?.querySelector('.footer__hour .svg__square')
  if (square) {
    gsap.set(square, { opacity: 0 })
    shuffleElsIn({ els: [square] })
  }
  hour.value = getCurrentHourInCET()
  _to = setTimeout(updateHour, 1000)
}

function getCurrentHourInCET() {
  const now = new Date()

  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Europe/Berlin',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
  const formattedTime = formatter.format(now)

  return formattedTime
}

function squareIn(el: HTMLElement, visible: boolean) {
  visible ? shuffleElsIn({ els: [el] }) : fadeOut({ el })
}

function waitPlayClick() {
  playClick.value = true
}

function ignorePlayClick() {
  playClick.value = false
}

function resetTetris() {
  tetrisEl.value?.reset()
}

function onCloseMouseEnter() {
  playClick.value = false
  updateCursor('default')
}

function onCloseMouseLeave() {
  playClick.value = over.value
  over.value ? updateCursor('play') : updateCursor('default')
}

onBeforeUnmount(() => {
  clearTimeout(_to)
  clearTimeout(_to2)
})
</script>

<style lang="scss">
.footer {
  position: relative;

  height: calc(var(--vh) + 0.1rem);

  background-color: black;

  &--game-over {
    cursor: pointer;
  }

  a,
  p {
    color: var(--lime);
  }
  .svg__square {
    rect {
      fill: var(--lime);
    }
  }

  &__squares {
    position: absolute;
    z-index: 9;
    bottom: 20%;
    left: 3.1%;
    height: 47%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    @include from__desktop--x-large {
      left: calc((100vw - var(--layout-max-width)) * 0.5 + var(--layout-max-width) * 0.031);
    }
    .svg__square {
      @include will-fade;
    }
  }

  &__hour,
  &__score {
    position: absolute;
    top: var(--layout-margin);
    right: var(--layout-margin);
    z-index: 9;
    display: flex;
    align-items: center;
    column-gap: 0.6rem;
    @include will-fade;

    svg {
      will-change: opacity;
    }
    p {
      @include t-number;
    }

    @include from__desktop--x-large {
      right: calc((100vw - var(--layout-max-width)) * 0.5 + var(--layout-margin));
    }
  }

  &__close {
    position: absolute;
    z-index: 9;
    top: var(--layout-margin);
    left: var(--layout-margin);
    width: 14rem;
    height: 7rem;
    border: 1px solid var(--lime);
    // display: flex;
    // justify-content: center;
    // align-items: center;
    button {
      color: var(--lime);
      padding: 0;
      width: max-content;
    }
  }

  &__game-over {
    z-index: 9;
    @include absolute-center;
  }

  &__email,
  &__credits {
    z-index: 2;

    max-width: var(--layout-max-width);

    left: 50%;
    transform: translateX(-50%);

    @include will-fade;
  }

  &__email {
    left: 50% !important;
    height: 100% !important;
    pointer-events: none;

    @include grid('golden-ratio');

    &__christian,
    &__domain,
    &__extension {
      width: max-content;
      padding-bottom: toScale(1rem);
      pointer-events: auto;
      button {
        padding: 0;
        margin: 0;
        border: none;
      }
    }

    &__christian {
      margin-top: toScale(3rem);
      .svg__christian {
        width: toScale(84.8rem);
      }
    }
    &__domain {
      margin-left: calc(var(--col-s));
      .svg__domain {
        width: toScale(110.4rem);
      }
    }
    &__extension {
      margin-left: calc(var(--col-s) + var(--col-l) * 2 + var(--col-xs) + var(--col-m));
      .svg__extension {
        width: toScale(62.5rem);
      }
    }
  }

  &__nav,
  &__location {
    z-index: 2;
    pointer-events: none;

    position: absolute;
    bottom: 0;
    width: 100%;
    max-width: var(--layout-max-width);
    padding: var(--layout-margin);

    left: 50%;
    transform: translateX(-50%);

    @include will-fade;

    a,
    p {
      color: var(--lime);
      @include t-b1;
    }
  }

  &__nav {
    top: auto !important;
    left: 50% !important;
    align-items: flex-end !important;

    padding-bottom: 1.6rem;

    @include grid('golden-ratio');

    &__social,
    &__credits {
      pointer-events: auto;
      &__link {
        span {
          will-change: opacity;
        }
        .svg__arrow line {
          stroke: var(--lime);
        }
        &__btn {
          color: var(--lime);
          padding: 0;
          border: none;
          will-change: opacity;
          @include t-b1;
          &--tetris {
            display: flex;
            align-items: center;
            column-gap: 0.8rem;
            line-height: 1 !important;
            @extend .footer__nav__credits__link__btn;
            .svg__play--small {
              width: toScale(1.1rem);
              transform: translateY(0.15rem);
            }
          }
        }
      }
    }

    &__social {
      width: var(--col-m);
      margin-left: calc(var(--col-s) + var(--col-l) * 2 + var(--col-xs) + var(--col-m));
    }

    &__credits {
      height: max-content;
      margin-left: calc(var(--col-xs));
    }
  }

  &__location {
    display: flex;
    justify-content: space-between;
    &__coordinates,
    &__year {
      pointer-events: auto;
    }
    &__coordinates {
      a {
        will-change: opacity;
      }
    }
  }

  &__tetris {
    z-index: 1;
    @include absolute-center;
  }

  &__intersect {
    position: absolute;
    top: calc(var(--vh) * 0.5);
    left: 0;
    width: 100%;
    height: 1px;
  }
}
</style>
