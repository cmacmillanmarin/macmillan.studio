export const Query: string = `_embed=true&acf_format=standard`

export type WP_Gallery = Array<{ image: WP_Image }>
export type Gallery = Array<Image>

export function parseGallery(data?: WP_Gallery): Gallery {
  const gallery: Array<Image> = []
  for (let { image } of data || []) gallery.push(parseImage(image))
  return gallery
}

export interface WP_Image {
  url: string
  alt: string
  name: string
  width: number
  height: number
  type: MediaType
  sizes: {
    thumbnail: string
    'thumbnail-width': number
    medium: string
    'medium-width': number
    large: string
    'large-width': number
  }
}

export interface Image {
  src: string
  alt: string
  width: number
  height: number
  sizes: {
    small: {
      src: string
      width: number
    }
    medium: {
      src: string
      width: number
    }
    large: {
      src: string
      width: number
    }
  }
}

export interface Thumbnail {
  src: string
  alt: string
  width: number
  height: number
}

export function parseImage(data?: WP_Image): Image {
  return {
    src: (data && data.url) || '',
    alt: (data && data.alt) || '',
    width: (data && data.width) || 0,
    height: (data && data.height) || 0,
    sizes: {
      small: {
        src: (data && data.sizes.thumbnail) || '',
        width: (data && data.sizes['thumbnail-width']) || 0,
      },
      medium: {
        src: (data && data.sizes.medium) || '',
        width: (data && data.sizes['medium-width']) || 0,
      },
      large: {
        src: (data && data.sizes.large) || '',
        width: (data && data.sizes['large-width']) || 0,
      },
    },
  }
}

export function parseThumbnail(data?: WP_Image): Thumbnail {
  return {
    src: data?.sizes?.thumbnail || '',
    alt: data?.alt || '',
    width: data?.width || 0,
    height: data?.height || 0,
  }
}

export interface WP_Video {
  type: MediaType
  title: string
  url: string
  width: number
  height: number
  mime_type: string
}
export interface Video {
  src: string
  alt: string
  width: number
  height: number
  mime: string
}

export function parseVideo(data?: WP_Video): Video {
  return {
    src: data?.url || '',
    width: data?.width || 0,
    height: data?.height || 0,
    mime: data?.mime_type || '',
    alt: data?.title || '',
  }
}

export type WP_Media = WP_Image | WP_Video

export type MediaType = 'image' | 'video'

export interface Media {
  type: MediaType
  image?: Image
  video?: Video
}

export function parseMedia(data?: WP_Image | WP_Video): Media {
  return {
    type: data?.type || 'image',
    image: data?.type === 'image' ? parseImage(data as WP_Image) : undefined,
    video: data?.type === 'video' ? parseVideo(data as WP_Video) : undefined,
  }
}

export interface WP_Taxonomy {
  slug: string
  name: string
  taxonomy: string
}

export interface Taxonomy {
  slug: string
  label: string
}

export function parseTaxonomy(data?: {
  id: string
  taxonomy: Array<WP_Taxonomy>
}): Taxonomy | undefined {
  const object = data?.taxonomy.find(({ taxonomy }) => taxonomy === data?.id)
  if (object) {
    return {
      slug: object.slug,
      label: object.name,
    }
  }
  return object
}

export function parseTaxonomies(data?: {
  id: string
  taxonomy: Array<WP_Taxonomy>
}): Array<Taxonomy> {
  const taxonomies: Array<Taxonomy> = []
  const wp_taxonomies: Array<WP_Taxonomy> =
    data?.taxonomy.filter(({ taxonomy }) => taxonomy === data?.id) || []
  for (const { slug, name } of wp_taxonomies) {
    taxonomies.push({
      slug,
      label: name,
    })
  }
  return taxonomies
}

export interface WP_SEO {
  title: string
  description: string
  og_image: string
  tw_image: string
}

export interface SEO {
  title: string
  description: string
  modified: string
  og_image: string
  tw_image: string
}

export function parseSEO(data: { seo?: WP_SEO; modified?: string }): SEO {
  return {
    title: data.seo?.title || 'SEO Title',
    description: data.seo?.description || 'SEO Description',
    og_image: data.seo?.og_image || '',
    tw_image: data.seo?.tw_image || '',
    modified: data.modified || new Date().toString(),
  }
}

export type LinkType = 'internal' | 'external' | 'referral' | 'action'
export type ButtonType = 'primary' | 'secondary' | 'tertiary' | 'label'

export interface WP_Link {
  label: string
  type: LinkType
  internal_link?: string
  external_link?: string
}

export interface Link {
  label: string
  type: LinkType
  to: string
}

export function parseLink(data?: WP_Link): Link {
  return {
    label: parseText(data?.label),
    type: data?.type || 'external',
    to:
      (data?.type === 'internal' ? parseInternalLink(data?.internal_link) : data?.external_link) ||
      '',
  }
}

export function parseLinks(data?: Array<WP_Link>): Array<Link> {
  const links: Array<Link> = []
  for (const link of data || []) links.push(parseLink(link))
  return links
}

export interface WP_Button {
  type: ButtonType
  label: string
  hint: string
  link_type: LinkType
  internal_link: string
  external_link: string
}
export interface Button {
  type: ButtonType
  label: string
  hint?: string
  linkType: LinkType
  to?: string
}

export function parseButtons(data?: Array<WP_Button>): Array<Button> {
  const links: Array<Button> = []
  for (const wp_link of data || []) links.push(parseButton(wp_link))
  return links
}

export function parseButton(data?: WP_Button): Button {
  return {
    type: data?.type || 'primary',
    label: data?.label || '',
    hint: data?.hint || '',
    linkType: data?.link_type || 'external',
    to:
      (data?.link_type === 'internal'
        ? parseInternalLink(data?.internal_link)
        : data?.external_link) || '',
  }
}

export function parseInternalLink(url?: string): string {
  if (url) {
    const chunks = url.split('/')
    const type = chunks[chunks.length - 3]
    const slug = chunks[chunks.length - 2]
    switch (type) {
      case 'single-page':
        if (slug === 'homepage') return '/'
        if (slug === 'refinance') return '/get-your-quote/refinance'
        if (slug === 'buy-your-home') return '/get-your-quote/buy-your-home'
        if (slug === 'thank-you') return '/'
        return `/${slug}`
      case 'service':
        return `/service/${slug}`
      case 'text-page':
        return `/page/${slug}`
      default:
        break
    }
  }
  return '/'
}

export const Styles = [
  { wp: 'styled', front: 'styled' },
  { wp: 'white', front: 'white' },
  { wp: 'red', front: 'red' },
  { wp: 'red-dark', front: 'red--dark' },
  { wp: 'burgundy', front: 'burgundy' },
  { wp: 'burgundy-dark', front: 'burgundy--dark' },
  { wp: 'beige', front: 'beige' },
  { wp: 'bone', front: 'bone' },
  { wp: 'h1', front: 'h1' },
  { wp: 'h2', front: 'h2' },
  { wp: 'h3', front: 'h3' },
  { wp: 'h4', front: 'h4' },
]

export function parseText(text?: string): string {
  let parsedText: string = text || ''

  parsedText = parsedText.replaceAll('<link to="', '<a data-custom-anchor href="')
  parsedText = parsedText.replaceAll('</link>', '</a>')
  for (const { wp, front } of Styles) {
    parsedText = parsedText.replaceAll(`<${wp}>`, `<span class='t-${front}'>`)
    parsedText = parsedText.replaceAll(`</${wp}>`, '</span>')
  }

  return parsedText
}

export function clean(text?: string): string {
  let parsedText: string = text || ''
  for (const { front } of Styles) {
    parsedText = parsedText.replaceAll(`<span class='t-${front}'>`, '')
    parsedText = parsedText.replaceAll('</span>', '')
  }

  return parsedText
}

export interface WP_CTAModule {
  title: Array<{ line: string }> | boolean
  image_type: 'squared' | 'portrait'
  image: { image?: WP_Image }
  content: string
  buttons: Array<{ button: WP_Button }> | boolean
  specs: Array<{ spec: string }> | boolean
}

export interface CTAModule {
  title: Array<string>
  image_type: 'squared' | 'portrait'
  image: Image
  content: string
  buttons: Array<Button>
  specs: Array<string>
}

export function parseCTAModule(data?: WP_CTAModule): CTAModule {
  const title: Array<string> = []
  const lines: Array<{ line: string }> = Array.isArray(data?.title) ? data?.title : []
  for (const { line } of lines) {
    title.push(parseText(line))
  }
  return {
    title,
    image_type: data?.image_type || 'squared',
    image: parseImage(data?.image.image),
    content: parseText(data?.content),
    buttons: parseButtons(
      Array.isArray(data?.buttons) ? data?.buttons.map(({ button }) => button) : []
    ),
    specs: Array.isArray(data?.specs) ? data?.specs.map(({ spec }) => spec) : [],
  }
}

export function parseHTML(input?: string, avoidClasses?: boolean): string {
  const config = useRuntimeConfig()
  const { BE_BASE_URL } = config.public

  let output: string = input || ''

  output = output.replace(/(\r\n|\n|\r)/gm, '')
  output = output.trim().replace(/\s\s+/g, ' ')
  output = output.replaceAll(BE_BASE_URL, '')
  output = output.replaceAll('</p><p>', '</p><p><span class="t-indent"></span>')
  output = output.replaceAll('<br />', '</p><p><span class="t-indent"></span>')
  if (!avoidClasses) {
    output = output.replaceAll('<p>', '<p class="t-b1">')
    output = output.replaceAll('<a', '<a data-custom-anchor class="t-burgundy"')
    output = output.replaceAll('<h1>', '<h1 class="t-h1">')
    output = output.replaceAll('<h2>', '<h2 class="t-h4">')
    output = output.replaceAll('<h3>', '<h3 class="t-h4">')
    output = output.replaceAll('<h4>', '<h4 class="t-h4">')
    output = output.replaceAll('<h5>', '<h5 class="t-h4">')
  }
  output = output.replaceAll('<li>', '<li><span class="list-dot"></span>')
  output = output.replaceAll('</p><ol>', '</p><ol class="margin">')
  output = output.replaceAll('</p><ul>', '</p><ul class="margin">')

  const hrefs = Array.from(output.matchAll(/href="([^"]*)/g))
  for (const href of hrefs) {
    const url = href[1]
    const internal = url.charAt(0) === '/'
    if (internal) {
      const parsedLink = parseInternalLink(url)
      output = output.replace(url, parsedLink)
    }
  }
  return output
}

export type Category = 'both' | 'buy-your-home' | 'refinance'
export type Subcategory =
  | 'primary-home'
  | 'secondary-home'
  | 'investment'
  | 'first-time-buyers'
  | 'take-cash-out'
  | 'lower-your-payment'
  | 'shorten-the-term'
  | 'switch-to-fix-rate'
