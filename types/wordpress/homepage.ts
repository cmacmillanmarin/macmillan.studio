import { type SEO, parseSEO } from '~/types/wordpress'

export interface WP_Homepage {
  modified: string
  acf: {
    seo: SEO
  }
}

export interface Homepage {
  seo: SEO
}

export function parseHomepage(data?: { homepage: WP_Homepage }): Homepage {
  return {
    seo: parseSEO({ seo: data?.homepage.acf.seo, modified: data?.homepage.modified }),
  }
}
