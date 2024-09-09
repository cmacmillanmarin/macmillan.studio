import glsl from 'vite-plugin-glsl'

const {
  OFFLINE,
  PRODUCTION,
  FE_PROTOCOL,
  FE_BASE_URL,
  BE_PROTOCOL,
  BE_BASE_URL,
  BE_BASE_API_URL,
  VITE_CJS_IGNORE_WARNING,
} = process.env

const IS_DEV: boolean = PRODUCTION != '1'
const IS_OFFLINE: boolean = OFFLINE == '1'
const IS_PRODUCTION: boolean = PRODUCTION == '1'
const DEPLOY_DATE: string = Date.now().toString()

// const robotsRules: Array<any> = [
//   { UserAgent: '*' },
//   { Disallow: '/' },
//   { BlankLine: true },
//   { Sitemap: `${FE_PROTOCOL}${FE_BASE_URL}/sitemap.xml` },
// ]

// https://v3.nuxtjs.org/api/configuration/nuxt.config
export default defineNuxtConfig({
  ssr: true,
  runtimeConfig: {
    VITE_CJS_IGNORE_WARNING,
    public: {
      IS_DEV,
      IS_OFFLINE,
      IS_PRODUCTION,
      DEPLOY_DATE,
      FE_BASE_URL: `${FE_PROTOCOL}${FE_BASE_URL}`,
      BE_BASE_URL: `${BE_PROTOCOL}${BE_BASE_URL}`,
      BE_API_URL: `${BE_PROTOCOL}${BE_BASE_URL}${BE_BASE_API_URL}`,
    },
  },
  app: {
    head: {
      htmlAttrs: {
        lang: 'en',
      },
      meta: [{ name: 'theme-color', content: '#FFF' }],
      link: [{ rel: 'icon', type: 'image/x-icon', href: '/assets/img/favicon.ico' }],
      script: [
        {
          src: `/assets/js/es-module-shims.js`,
          defer: true,
        },
        {
          children: `{
            "imports":{
              "three": "./assets/js/three/three.module.min.js",
              "three/addons/": "./jsm/"
            }
          }`,
          type: 'importmap',
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

  // robots: {
  //   rules: robotsRules,
  // },

  sitemap: {
    defaults: {
      lastmod: new Date(),
    },
    // @ts-expect-error
    hostname: `${FE_PROTOCOL}${FE_BASE_URL}`,
    gzip: true,
  },

  css: ['@/assets/css/main.scss'],

  features: {
    inlineStyles: false,
  },

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
            @import "@/assets/css/mixins/_fonts.scss";
          `,
        },
      },
    },
  },

  nitro: {
    prerender: {
      crawlLinks: true,
    },
  },

  devtools: { enabled: false },

  compatibilityDate: '2024-09-06',
})
