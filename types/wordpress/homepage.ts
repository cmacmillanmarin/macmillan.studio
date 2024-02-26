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
  const { homepage } = data
  return {
    seo: parseSEO({ seo: homepage.acf.seo, modified: homepage.modified }),
  }
}
