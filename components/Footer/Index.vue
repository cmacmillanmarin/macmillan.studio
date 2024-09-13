<template>
  <footer class="footer" id="contact-target">
    <div class="footer__intersect" v-intersect="{ callback: onIntersect }" />
    <div v-show="!tetris" class="footer__email" v-transition:in="{ callback: fadeIn }">
      <GridGoldenRatio v-if="gridType === 'golden-ratio'" />
      <GridRuleOfThirds v-else-if="gridType === 'rule-of-thirds'" />
      <div class="footer__email__christian">
        <a
          href="mailto:christian@macmillan.studio"
          rel="noopener"
          aria-label="christian@macmillan.studio">
          <SvgChristian />
        </a>
      </div>
      <div class="footer__email__domain">
        <a
          href="mailto:christian@macmillan.studio"
          rel="noopener"
          aria-label="christian@macmillan.studio">
          <SvgDomain />
        </a>
      </div>
      <div class="footer__email__extension">
        <a
          href="mailto:christian@macmillan.studio"
          rel="noopener"
          aria-label="christian@macmillan.studio">
          <SvgExtension />
        </a>
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
          <button class="footer__nav__credits__link__btn" @click="playTetris">Play Tetris</button>
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
import { storeToRefs } from 'pinia'
import useStore from '~/store/useStore'
import useScrollStore from '~/store/useScrollStore'
import { fadeIn } from '~/utils/animations'

const store = useStore()
const { updateSection } = store
const { gridType } = storeToRefs(store)
const { direction } = storeToRefs(useScrollStore())

const rrss = ref([
  {
    label: 'Twitter',
    to: 'https://www.twitter.com/cmacmillanmarin',
    type: 'external',
  },
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
    label: 'Instagram',
    to: 'https://www.instagram.com/cmacmillanmarin',
    type: 'external',
  },
  {
    label: 'Unsplash',
    to: 'https://unsplash.com/@cmacmillanmarin',
    type: 'external',
  },
])

const tetris = ref<boolean>(false)

function playTetris() {
  tetris.value = true
}

function onIntersect(el: HTMLElement, visible: boolean) {
  if (visible) updateSection('contact')
  else if (direction.value === 'up') updateSection('about-awards')
}
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

    @include grid('golden-ratio');

    &__christian,
    &__domain,
    &__extension {
      width: 100%;
      margin-bottom: 1.2rem;
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
