import {
  type Link,
  type WP_Link,
  type Button,
  type WP_Button,
  parseButtons,
  parseText,
  parseLink,
  parseLinks,
  parseHTML,
  type Image,
  type WP_Image,
  parseImage,
} from '~/types/wordpress'

export type WP_HeaderNavigation = Array<{
  link: WP_Link
  subnavigation?: Array<{ link: WP_Link }>
}>

export type HeaderNavigation = Array<{
  link: Link
  subnavigation: Array<Link>
}>

export interface WP_Header {
  acf: {
    navigation: WP_HeaderNavigation
    buttons: Array<{
      button: WP_Button
    }>
    image: WP_Image
    mobile_image_image: WP_Image
    primary_links: Array<{ link: WP_Link }>
    secondary_links: Array<{ link: WP_Link }>
    tertiary_links: Array<{ link: WP_Link }>
  }
}

export interface HeaderOverlay {
  image: Image
  mobileImage: Image
  navigation: {
    primary: Array<Link>
    secondary: Array<Link>
    tertiary: Array<Link>
  }
}
export interface Header {
  navigation: HeaderNavigation
  buttons: Array<Button>
  overlay: HeaderOverlay
}

export function parseHeader(data?: WP_Header): Header {
  const navigation: HeaderNavigation = []
  for (const item of data?.acf.navigation || []) {
    const subnavigation: Array<Link> = []
    for (const { link } of item.subnavigation || []) {
      subnavigation.push(parseLink(link))
    }
    navigation.push({ link: parseLink(item.link), subnavigation })
  }
  const buttons: Array<Button> = parseButtons(data?.acf.buttons.map(({ button }) => button))
  return {
    navigation,
    buttons,
    overlay: {
      image: parseImage(data?.acf.image),
      mobileImage: parseImage(data?.acf.mobile_image_image),
      navigation: {
        primary: parseLinks(data?.acf.primary_links.map(({ link }) => link)),
        secondary: parseLinks(data?.acf.secondary_links.map(({ link }) => link)),
        tertiary: parseLinks(data?.acf.tertiary_links.map(({ link }) => link)),
      },
    },
  }
}

export interface WP_Footer {
  acf: {
    disclaimer: {
      title: string
      content: string
    }
    bottom_links: Array<{ link: WP_Link }>
  }
}

export interface Footer {
  disclaimer: {
    title: string
    content: string
  }
  bottomLinks: Array<Link>
}

export function parseFooter(data?: WP_Footer): Footer {
  const bottomLinks: Array<Link> = []
  for (const { link } of data?.acf.bottom_links || []) {
    bottomLinks.push(parseLink(link))
  }
  return {
    disclaimer: {
      title: parseText(data?.acf.disclaimer.title),
      content: parseHTML(data?.acf.disclaimer.content, true),
    },
    bottomLinks,
  }
}
