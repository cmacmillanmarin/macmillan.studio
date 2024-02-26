<template>
  <footer v-if="footer" class="footer">
    <ClientOnly>
      <div v-if="isDesktop" class="footer__golden-grid">
        <div class="footer__golden-grid__content grid--golden">
          <div class="footer__golden-grid__content__logo">
            <ClientOnly>
              <LogoBig />
            </ClientOnly>
          </div>
          <div class="footer__golden-grid__content__newsletter">
            <p class="t-hint t-footer-hint t-white">{{ get('newsletterHint') }}</p>
            <InputNewsletter :placeholder="`${get('newsletterPlaceholder')}`" />
          </div>
        </div>
        <HelperGridGoldenRatio v-if="gridType === 'golden'" />
      </div>
    </ClientOnly>

    <div class="footer__grid grid">
      <div v-for="i in 4" class="footer__grid__bottom-links grid__col-6--desktop">
        <p class="t-b1 t-white">Link</p>
      </div>
    </div>
  </footer>
</template>

<script lang="ts" setup>
import useStore from '~/store/useStore'
import useDictionaryStore from '~/store/useDictionaryStore'
import type { Footer } from '~/types/wordpress/navigation'
import { storeToRefs } from 'pinia'

const { data: footer } = await useFetch<Footer>('/api/wordpress/footer')

const { get, socialNetworks } = useDictionaryStore()
const { gridType } = storeToRefs(useStore())
const { isDesktop } = useDevice()
</script>

<style lang="scss">
.footer {
  position: relative;
  aspect-ratio: 16/9;

  background-color: var(--burgundy--dark);

  overflow: var(--overflow--hidden);
  @include from__desktop {
    overflow: auto;
  }

  &__golden-grid {
    pointer-events: none;

    position: absolute;
    top: 0;
    left: 50%;
    transform: translate(-50%, 0);
    width: 100%;
    max-width: var(--layout-max-width);
    height: 100%;

    &__content {
      position: relative;
      height: 100%;

      align-content: flex-start;

      &__logo {
        pointer-events: auto;

        margin-left: calc(var(--col-s));
        margin-right: calc(var(--col-xs) * 2 + var(--col-m) * 2 + var(--col-l) * 2);
        width: calc(var(--col-l) * 2);
        height: 24%;
        margin-top: 6.1%;
      }

      &__newsletter {
        margin-top: 8%;
        height: 11%;
        margin-left: calc(var(--col-s));
        width: calc(var(--col-l) * 2);
      }
    }
  }

  &__grid {
    padding-top: 2.4rem;
    @include from__desktop {
      padding-top: 3.75%;
    }

    &__logo {
      width: 16rem;
      margin: 0 auto 2.4rem;
    }

    &__address {
      margin-bottom: 2.4rem;
      @include from__desktop {
        margin-bottom: 3.2%;
      }
    }

    &__contact {
      margin-bottom: 2.4rem;
      @include from__desktop {
        margin-bottom: 6.9%;
      }
      &__label {
        @include from__desktop {
          margin-bottom: var(--s);
        }
      }
    }

    &__newsletter {
      margin-bottom: 3.8rem;
    }

    &__disclaimer {
      margin-bottom: 3.8rem;
      @include from__desktop {
        margin-bottom: 2.8%;
      }
    }

    &__social-network {
      @include from__desktop {
        margin-bottom: 1.52%;
      }
    }

    &__social-networks {
      margin-bottom: 3.8rem;
      display: flex;
      justify-content: center;
      align-items: center;
      a {
        display: block;
        margin: 0 1rem;
        height: max-content;
        svg {
          display: block;
        }
      }
    }

    &__bottom-links {
      margin-bottom: 0.6rem;
      text-align: center;

      .t-footer-hint {
        letter-spacing: 0;
      }

      @include from__desktop {
        margin-bottom: 1.111%;
        text-align: left;

        .t-footer-hint {
          letter-spacing: 0.1rem;
        }
      }
    }
  }

  &__bottom-links {
    overflow: var(--overflow--hidden);
    white-space: nowrap;
    text-align: center;
    padding-bottom: 1.2rem;

    .t-footer-hint {
      letter-spacing: 0;
    }
  }

  .t-hint {
    margin-bottom: 1rem;
    @include from__desktop {
      margin-bottom: var(--m);
    }
    .icon {
      display: inline-block;
      margin-right: var(--xs);
      vertical-align: bottom;
      transform: translateY(0.2rem);
      @include from__desktop {
        transform: none;
      }
      svg {
        display: block;
      }
    }
  }

  .c-logo-instagram {
    width: 2.5rem;
    &__fill {
      fill: var(--red);
    }
    &__stroke {
      stroke: var(--red);
    }
  }

  .c-logo-tik-tok {
    width: 2.2rem;
    path {
      fill: var(--red);
    }
  }

  .c-logo-youtube {
    path {
      fill: var(--red);
    }
  }

  .c-logo-linked-in {
    path {
      fill: var(--red);
    }
  }
}
</style>
