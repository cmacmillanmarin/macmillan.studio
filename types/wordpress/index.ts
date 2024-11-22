import he from 'he'
import { numberToMonth, numberToShortMonth } from '~/utils'

export const Query: string = `_embed=true&acf_format=standard`

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
  caption: string
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
    alt: data?.caption || '',
  }
}

export type MediaType = 'img' | 'vid'

export interface WP_File {
  type: MediaType
  image?: WP_Image
  videos: {
    webm?: WP_Video
    mp4?: WP_Video
  }
}

export interface FileVideo {
  mp4: string
  webm: string
  alt: string
  width: number
  height: number
}

export interface File {
  type: MediaType
  image?: Image
  video?: FileVideo
}

export function parseFile(data?: WP_File): File {
  const type = data?.type || 'img'
  const image = type === 'img' ? parseImage(data?.image) : undefined
  const mp4 = parseVideo(data?.videos.mp4)
  const webm = parseVideo(data?.videos.webm)
  const video =
    data?.type === 'vid'
      ? {
          mp4: mp4.src,
          webm: webm.src,
          alt: webm.alt,
          width: webm.width,
          height: webm.height,
        }
      : undefined
  return {
    type,
    image,
    video,
  }
}

export type WP_Taxonomies = Array<WP_Taxonomy>

export interface WP_Taxonomy {
  id: number
  slug: string
  name: string
  taxonomy: string
}

export type Taxonomies = Array<Taxonomy>

export interface Taxonomy {
  id: number
  slug: string
  label: string
}

export function getTaxonomy(data?: { id: string; taxonomy: WP_Taxonomies }): Taxonomy | undefined {
  const object = data?.taxonomy.find(({ taxonomy }) => taxonomy === data?.id)
  if (object) {
    return {
      id: object.id,
      slug: object.slug,
      label: object.name,
    }
  }
  return object
}

export function parseTaxonomy(data?: WP_Taxonomy): Taxonomy {
  return {
    id: data?.id || 0,
    slug: data?.slug || '',
    label: data?.name || '',
  }
}

export function parseTaxonomies(data?: { id: string; taxonomy: WP_Taxonomies }): Taxonomies {
  const taxonomies: Taxonomies = []
  const wp_taxonomies: WP_Taxonomies =
    data?.taxonomy.filter(({ taxonomy }) => taxonomy === data?.id) || []
  for (const wp_taxonomy of wp_taxonomies) {
    taxonomies.push(parseTaxonomy(wp_taxonomy))
  }
  return taxonomies
}

export type LinkType = 'internal' | 'external' | 'referral' | 'video' | 'action'
export type ButtonStyle = 'primary' | 'secondary' | 'tertiary' | 'label'

export interface WP_Link {
  label: string
  type: LinkType
  internal_link?: string
  external_link?: string
  youtube_id?: string
}

export interface Link {
  label: string
  type: LinkType
  to: string
}

export function parseLink(data?: WP_Link): Link {
  let to: string = ''
  const label: string = parseText(data?.label)
  const type: LinkType = data?.type || 'external'

  if (type === 'external' || type === 'referral') to = data?.external_link || ''
  else if (type === 'internal') to = parseInternalLink(data?.internal_link)
  else to = data?.youtube_id || ''

  return {
    label,
    type,
    to,
  }
}

export function parseLinks(data?: Array<WP_Link>): Array<Link> {
  const links: Array<Link> = []
  for (const link of data || []) links.push(parseLink(link))
  return links
}

export interface WP_Button {
  type: ButtonStyle
  label: string
  hint: string
  link_type: LinkType
  internal_link: string
  external_link: string
}
export interface Button {
  style: ButtonStyle
  label: string
  hint?: string
  type: LinkType
  to?: string
}

export function parseButtons(data?: Array<WP_Button>): Array<Button> {
  const links: Array<Button> = []
  for (const wp_link of data || []) links.push(parseButton(wp_link))
  return links
}

export function parseButton(data?: WP_Button): Button {
  return {
    style: data?.type || 'primary',
    label: parseText(data?.label),
    hint: parseText(data?.hint),
    type: data?.link_type || 'external',
    to:
      data?.link_type === 'internal'
        ? parseInternalLink(data?.internal_link)
        : parseText(data?.external_link),
  }
}

export function parseInternalLink(url?: string): string {
  const config = useRuntimeConfig()
  const { BE_BASE_URL } = config.public
  if (url) {
    const chunks = url.replace(BE_BASE_URL, '').split('/')
    const type = chunks[chunks.length - 3] || 'single-page'
    const slug = chunks[chunks.length - 2]
    // console.log(type, slug)
    switch (type) {
      case 'single-page':
        if (slug === 'homepage') return '/'
        if (slug === 'blog') return '/resources'
        if (slug === 'contact' || slug === 'lead') return '/book-a-call'
        if (slug === 'txt-tool') return '/tool/txt'
        return `/${slug}`
      case 'article':
        return `/learn/${slug}`
      case 'resources':
        return `/resources/${slug}`
      case 'guide':
        return `/guide/${slug}`
      case 'service':
        return `/service/${slug}`
      case 'text-page':
        return `/page/${slug}`
      case 'use-case':
        return `/use-case/${slug}`
      case 'calculator':
      case 'statistic':
        return `/tool/${type}/${slug}`
      default:
        return '/'
    }
  }
  return ''
}

export const Styles: Array<{ wp: string; front: string; inverted?: boolean }> = [
  { wp: 'blue', front: 'blue', inverted: true },
  { wp: 'yellow', front: 'yellow' },
  { wp: 'green', front: 'green' },
  { wp: 'pink', front: 'pink', inverted: true },
  { wp: 'purple', front: 'purple' },
  { wp: 'black', front: 'black', inverted: true },
  { wp: 'padding', front: 'padding' },
  { wp: 'underline', front: 'underline' },
  { wp: 'bibliography', front: 'bibliography' },
]

export function parseText(text?: string): string {
  let parsedText: string = he.decode(he.decode(text || ''))

  parsedText = parsedText.replaceAll('<link to="', '<a data-custom-anchor href="')
  parsedText = parsedText.replaceAll('</link>', '</a>')
  for (const { wp, front, inverted } of Styles) {
    if (front !== 'underline' && front !== 'bibliography' && front !== 'padding')
      parsedText = parsedText.replaceAll(
        `<${wp}>`,
        `<span class='t-highlighted' data-scroll-set-position data-highlighted-color="${front}"${
          inverted ? ' data-highlighted-inverted' : ''
        }>`
      )
    else if (front === 'bibliography') {
      const entries = extractBibliographyEntries(parsedText)
      for (const entry of entries) {
        const id = entry.split('-')[1]
        parsedText = parsedText.replaceAll(
          `/${entry}/`,
          `<button class='bibliography' data-bibliography-id="${id}" aria-label="bilbiography item ${id}">${id}</button>`
        )
      }
    } else if (front === 'padding')
      parsedText = parsedText.replaceAll(`<${wp}>`, `<span class='t-${front}'>`)
    else
      parsedText = parsedText.replaceAll(
        `<${wp}>`,
        `<span class='t-underline' data-scroll-set-position>`
      )
    parsedText = parsedText.replaceAll(`</${wp}>`, '</span>')
  }

  return parsedText
}

export function extractBibliographyEntries(text: string): string[] {
  const regex = /bibliography-\d+/g
  const matches = text.match(regex)
  return matches ? matches : []
}

export function clean(text?: string): string {
  let parsedText: string = text || ''
  for (const { front } of Styles) {
    parsedText = parsedText.replaceAll(`<span class='t-${front}'>`, '')
    parsedText = parsedText.replaceAll('</span>', '')
  }

  return parsedText
}

export function parseHTML(input?: string, avoidClasses?: boolean): string {
  const config = useRuntimeConfig()
  const { BE_BASE_URL } = config.public

  let output: string = parseText(input)

  output = output.replace(/(\r\n|\n|\r)/gm, '')
  output = output.trim().replace(/\s\s+/g, ' ')
  output = output.replaceAll(BE_BASE_URL, '')
  output = output.replaceAll('<br />', '</p><p>')
  if (!avoidClasses) {
    output = output.replaceAll('<a', '<a data-custom-anchor ')
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

export function parseDate(entry?: string, custom?: boolean): string {
  if (!entry) return ''
  if (custom) return parseCustomDate(entry)
  const chunks = entry.split('T')
  const date = chunks[0].split('-')

  let day = date[date.length - 1]
  let month = date[date.length - 2]
  let year = date[date.length - 3]

  return `${numberToMonth(month)} ${parseDay(day)}, ${year}`
}

export function parseShortDate(entry?: string, custom?: boolean): string {
  if (!entry) return ''
  if (custom) return parseCustomDate(entry, true)
  const chunks = entry.split('T')
  const date = chunks[0].split('-')

  let day = date[date.length - 1]
  let month = date[date.length - 2]
  let year = date[date.length - 3]

  return `${numberToShortMonth(month)} ${parseDay(day)}, ${year}`
}

export function parseDay(day: string): string {
  let _day = day
  if (_day.charAt(0) === '0') _day = _day.replace('0', '')
  if (_day === '1') _day = `${_day}st`
  else if (_day === '2') _day = `${_day}nd`
  else if (_day === '3') _day = `${_day}rd`
  else _day = `${_day}th`
  return _day
}

export function parseCustomDate(date?: string, short?: boolean): string {
  if (!date) return ''
  const dateChunks = date.split('/')

  return `${short ? numberToShortMonth(dateChunks[1]) : numberToMonth(dateChunks[1])} ${parseDay(
    dateChunks[0]
  )}, ${dateChunks[2]}`
}

export interface BreadCrumbLink {
  label: string
  link: string
}

export type BreadCrumb = Array<BreadCrumbLink>

export function getPostNamesFrom(source?: Array<{ post_name: string }>): string {
  if (Array.isArray(source)) {
    return source.map(({ post_name }) => post_name).join()
  }
  return ''
}

export interface Head {
  title: string
  description: string
  og_image: string
  tw_image: string
}

export function parseHead(data?: Head): Head {
  return {
    title: data?.title || '',
    description: data?.description || '',
    og_image: data?.og_image || '',
    tw_image: data?.tw_image || '',
  }
}
