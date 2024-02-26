require('dotenv').config({ path: `./config/env/.env.${process.env.ENV}` })

import glsl from 'vite-plugin-glsl'

const {
  DEV,
  PREVIEW,
  PRODUCTION,
  PASSWORD_PROTECTED,
  FE_PUBLIC,
  FE_PROTOCOL,
  FE_BASE_URL,
  BE_PROTOCOL,
  BE_BASE_URL,
  BE_BASE_API_URL,
  BE_BASE_AUTH_URL,
  ZAP_BASE_URL,
  ZAP_NEWSLETTER,
  ZAP_QUOTE,
  GTM_ID,
} = process.env

const IS_DEV: boolean = DEV == '1'
const IS_PREVIEW: boolean = PREVIEW == '1'
const IS_PUBLIC: boolean = FE_PUBLIC == '1'
const IS_PRODUCTION: boolean = PRODUCTION == '1'
const IS_PASSWORD_PROTECTED: boolean = PASSWORD_PROTECTED == '1'
const DEPLOY_DATE: string = Date.now().toString()

const genericRouteRules =
  IS_DEV || IS_PREVIEW || IS_PASSWORD_PROTECTED
    ? { ssr: IS_DEV ? true : false }
    : { prerender: true }
function productionRedirect(to: string): any {
  return IS_PRODUCTION ? { redirect: to } : { ssr: true }
}

let routes = {
  '/': genericRouteRules,
  '/sign-in': productionRedirect('/'),
  '/user': productionRedirect('/'),
  '/api/**': { cors: true },
}

console.log(routes)

const robotsRules: Array<any> = [{ UserAgent: '*' }]
if (!IS_PUBLIC) {
  robotsRules.push({ Disallow: '/' })
} else {
  robotsRules.push({ Disallow: '/api/*' }, { Disallow: '/sign-in' }, { Disallow: '/user' })
}
robotsRules.push({ BlankLine: true }, { Sitemap: `${FE_PROTOCOL}${FE_BASE_URL}/sitemap.xml` })

// https://v3.nuxtjs.org/api/configuration/nuxt.config
export default defineNuxtConfig({
  ssr: true,
  runtimeConfig: {
    public: {
      IS_DEV,
      IS_PREVIEW,
      IS_PRODUCTION,
      IS_PASSWORD_PROTECTED,
      DEPLOY_DATE,
      FE_BASE_URL: `${FE_PROTOCOL}${FE_BASE_URL}`,
      BE_BASE_URL: `${BE_PROTOCOL}${BE_BASE_URL}`,
      BE_API_URL: `${BE_PROTOCOL}${BE_BASE_URL}${BE_BASE_API_URL}`,
      BE_AUTH_URL: `${BE_PROTOCOL}${BE_BASE_URL}${BE_BASE_AUTH_URL}`,
      ZAP_BASE_URL,
      ZAP_NEWSLETTER,
      ZAP_QUOTE,
      GTM_ID,
    },
  },
  app: {
    head: {
      htmlAttrs: {
        lang: 'en',
      },
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
      meta: [
        { name: 'theme-color', content: '#000' },
        { name: 'robots', content: IS_PRODUCTION && IS_PUBLIC ? 'index, follow' : 'noindex' },
        {
          name: 'googlebot',
          content:
            IS_PRODUCTION && IS_PUBLIC
              ? 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1'
              : 'noindex',
        },
        {
          name: 'bingbot',
          content:
            IS_PRODUCTION && IS_PUBLIC
              ? 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1'
              : 'noindex',
        },
      ],
      link: [{ rel: 'icon', type: 'image/x-icon', href: '/assets/img/favicon.ico' }],
      script: [
        {
          src: `/assets/js/gsap/gsap.min.js`,
          defer: true,
        },
        {
          src: `/assets/js/gsap/CustomEase.min.js`,
          defer: true,
        },
        {
          src: `/assets/js/gsap/ScrollToPlugin.min.js`,
          defer: true,
        },
        {
          src: `/assets/js/gsap/SplitText.min.js`,
          defer: true,
        },
      ],
    },
  },

  components: {
    dirs: [
      {
        path: '~/components/Global',
        global: true,
      },
      '~/components',
    ],
  },

  modules: ['@pinia/nuxt', '@nuxtjs/robots', '@nuxtjs/sitemap'],

  robots: {
    rules: robotsRules,
  },

  sitemap: {
    defaults: {
      lastmod: new Date(),
    },
    // @ts-expect-error
    hostname: `${FE_PROTOCOL}${FE_BASE_URL}`,
    gzip: true,
  },

  css: ['@/assets/css/main.scss'],

  vite: {
    plugins: [glsl()],
    build: {
      rollupOptions: {
        external: ['three'],
      },
    },
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `
            @import "@/assets/css/mixins/_index.scss";
            @import "@/assets/css/mixins/_breakpoints.scss";
            @import "@/assets/css/mixins/_grid.scss";
            @import "@/assets/css/mixins/_typography.scss";
          `,
        },
      },
    },
  },

  nitro: {
    prerender: {
      crawlLinks: true,
    },
    routeRules: routes,
  },
})
