<template>
  <div
    class="c-module-text t-b1 t-burgundy will-fade"
    v-transition:in="{ callback: fadeIn }"
    v-html="data.html" />
</template>

<script lang="ts" setup>
import { fadeIn } from '~/utils/animations'
import type { TextModule } from '~/types/wordpress/modules'

defineProps<{
  data: TextModule
}>()
</script>

<style lang="scss">
.c-module-text {
  h1,
  h2,
  h3,
  h4,
  h5 {
    margin-bottom: 1.2rem;
    @include from__desktop {
      margin-bottom: 1.6rem;
    }
    &:first-child {
      padding-top: 0;
    }
  }

  p {
    margin-bottom: 0.2rem;

    &:first-child {
      .t-indent {
        width: 0;
      }
    }

    .t-indent {
      display: inline-block;
      width: 3.2rem;
      @include from__desktop {
        width: 8rem;
      }
    }
  }

  a {
    text-decoration: underline;
  }

  a,
  strong {
    font-weight: 400;
    font-family: 'b-haas-grotesk-tx-b';
  }

  ol,
  ul {
    --mobile-col-width: calc((100vw - (var(--layout-indent) * 2) - (var(--layout-gap) * 7)) / 8);
    margin-bottom: 1.6rem;
    @include from__desktop {
      margin-bottom: 2.4rem;
    }

    ul,
    ol,
    &.margin {
      padding-top: 1.6rem;
      @include from__desktop {
        padding-top: 2.4rem;
      }
    }

    ul,
    ol {
      li {
        margin-left: 0;
      }
    }

    ul {
      margin-left: 1.2rem;
      @include from__desktop {
        margin-left: calc(var(--layout-gap) + 0.6rem);
      }
    }

    ol {
      margin-left: calc(var(--layout-gap) + 1rem);
      @include from__desktop {
        margin-left: calc(var(--layout-gap) + 0.3rem);
      }
    }

    li {
      position: relative;
      display: block;
      margin-left: 1.2rem;
      margin-bottom: 1.6rem;
      @include from__desktop {
        margin-left: 0;
        margin-bottom: 1.6rem;
      }

      .list-dot {
        position: absolute;
        top: 0;
        left: 0;
        transform: translate(calc(-100% - 0.8rem), 0.7rem);
        display: block;
        width: 0.5rem;
        height: 0.5rem;
        border-radius: 100%;
        background-color: var(--burgundy--dark);
        @include from__desktop {
          transform: translate(calc(-100% - 1.6rem), 1rem);
          width: 0.6rem;
          height: 0.6rem;
        }
      }
    }
  }

  ol {
    counter-reset: number;
    > li {
      counter-increment: number;
      margin-left: calc(var(--mobile-col-width) - 0.2rem);
      @include from__desktop {
        margin-left: 0;
      }

      &::before {
        content: '0' counter(number);
        font-family: 'b-haas-grotesk-tx-b';
        position: absolute;
        transform: translateX(calc(-100% - 0.9rem));
        font-variant-numeric: tabular-nums;
        @include from__desktop {
          transform: translateX(calc(-100% - var(--layout-gap)));
        }
      }

      > .list-dot {
        display: none;
      }
    }
  }
}
</style>
