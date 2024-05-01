<template>
  <footer class="footer" id="contact-target">
    <div class="footer__email" v-transition:in="{ callback: fadeIn }">
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
    <nav class="footer__nav" v-transition:in="{ callback: fadeIn }">
      <ul class="footer__nav__social">
        <li v-for="{ to, type, label } in rrss" class="footer__nav__social__link">
          <DecorativeLink :label="label" :to="to" :type="type" />
        </li>
      </ul>
      <ul class="footer__nav__credits">
        <li class="footer__nav__credits__link">
          <DecorativeLink
            label="Design—Xavier Cussó"
            to="https://xaviercusso.com"
            type="extenral" />
        </li>
      </ul>
    </nav>
    <div class="footer__location" v-transition:in="{ callback: fadeIn }">
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
import { fadeIn } from '~/utils/animations'

const { gridType } = storeToRefs(useStore())

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
    @include will-fade;

    max-width: var(--layout-max-width);

    left: 50%;
    transform: translateX(-50%);
  }

  &__email {
    @include grid('golden-ratio');
    left: 50%;
    height: 100%;

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
    pointer-events: none;
    @include will-fade;

    position: absolute;
    bottom: 0;
    width: 100%;
    max-width: var(--layout-max-width);
    padding: var(--layout-indent);

    left: 50%;
    transform: translateX(-50%);

    a,
    p {
      @include t-b1;
    }
  }

  &__nav {
    @include grid('golden-ratio');
    top: auto;
    left: 50%;

    padding-bottom: 1.6rem;

    align-items: flex-end;

    &__social,
    &__credits {
      pointer-events: auto;
      &__link {
        .svg__arrow line {
          stroke: var(--lime);
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

  .footer__tetris {
    @include absolute-center;
  }
}
</style>
