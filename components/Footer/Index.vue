<template>
  <footer ref="el" class="footer" id="contact-target">
    <div class="footer__intersect" v-intersect="{ callback: onIntersect }" />
    <div class="footer__hour">
      <SvgSquare />
      <p v-html="`${hour}h {CET}`" />
    </div>
    <div class="footer__squares">
      <SvgSquare />
      <SvgSquare />
      <SvgSquare />
      <SvgSquare />
    </div>
    <div
      v-show="!tetris"
      class="footer__email"
      v-transition:in="{ callback: fadeIn }"
      @mouseenter="onEmailMouseEnter"
      @mouseleave="onEmailMouseLeave"
      @click="copyEmail">
      <GridGoldenRatio v-if="gridType === 'golden-ratio'" />
      <GridRuleOfThirds v-else-if="gridType === 'rule-of-thirds'" />
      <div class="footer__email__christian">
        <button>
          <SvgChristian />
        </button>
      </div>
      <div class="footer__email__domain">
        <button>
          <SvgDomain />
        </button>
      </div>
      <div class="footer__email__extension">
        <button>
          <SvgExtension />
        </button>
      </div>
    </div>
    <nav v-show="!tetris" class="footer__nav" v-transition:in="{ callback: fadeIn }">
      <ul class="footer__nav__social">
        <li v-for="{ to, type, label } in rrss" class="footer__nav__social__link">
          <DecorativeLink :label="label" :to="to" :type="type" />
        </li>
      </ul>
      <ul class="footer__nav__credits">
        <li class="footer__nav__credits__link">
          <button class="footer__nav__credits__link__btn--tetris" @click="playTetris">
            Play Tetris
            <SvgPlaySmall />
          </button>
        </li>
      </ul>
    </nav>
    <div v-show="!tetris" class="footer__location" v-transition:in="{ callback: fadeIn }">
      <div class="footer__location__coordinates">
        <a href="https://maps.app.goo.gl/osjpdZpbnTjgLg7h7" target="__blank" rel="noopener"
          >Cádiz—36.5282º N, 6.18892º W</a
        >
      </div>
      <div class="footer__location__year">
        <p>©2023</p>
      </div>
    </div>
    <FooterTetris />
  </footer>
</template>

<script lang="ts" setup>
import { gsap } from 'gsap'
import { storeToRefs } from 'pinia'
import useStore from '~/store/useStore'
import useScrollStore from '~/store/useScrollStore'
import { fadeIn } from '~/utils/animations'

const store = useStore()
const { updateSection, updateCursor } = store
const { cursor, gridType } = storeToRefs(store)
const { direction } = storeToRefs(useScrollStore())

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

onMounted(() => {
  updateHour()
})

function playTetris() {
  tetris.value = true
}

function onIntersect(el: HTMLElement, visible: boolean) {
  if (visible) updateSection('contact')
  else if (direction.value === 'up') updateSection('about-awards')
}

function onEmailMouseEnter() {
  updateCursor('copy')
}

function updateHour() {
  if (!el.value) return
  const square = el.value.querySelector('.footer__hour .svg__square')
  gsap.fromTo(square, { opacity: 0 }, { opacity: 1 })
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

function onEmailMouseLeave() {
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

onBeforeUnmount(() => {
  clearTimeout(_to)
  clearTimeout(_to2)
})
</script>

<style lang="scss">
.footer {
  position: relative;

  height: var(--vh);

  background-color: black;

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
    bottom: 20%;
    left: 3.1%;
    height: 47%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    @include from__desktop--x-large {
      left: calc((100vw - var(--layout-max-width)) * 0.5 + var(--layout-max-width) * 0.031);
    }
  }

  &__hour {
    position: absolute;
    top: var(--layout-margin);
    right: var(--layout-margin);
    z-index: 9;
    display: flex;
    align-items: center;
    column-gap: 0.6rem;

    p {
      @include t-number;
    }
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
        .svg__arrow line {
          stroke: var(--lime);
        }
        &__btn {
          color: var(--lime);
          padding: 0;
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
