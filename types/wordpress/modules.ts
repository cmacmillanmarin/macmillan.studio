import { parseImage, parseText, type WP_Image, type Image, parseHTML } from '~/types/wordpress'

export type ArticleModules = Array<ArticleModule>
export type WP_Modules = Array<WP_Module>

export type ModuleType = 'title' | 'text' | 'image' | 'quote' | 'gallery' | 'empty'

export interface TitleModule {
  label: string
  tableOfContent: string
}

export interface QuoteModule {
  label: string
}

export interface ImageModule {
  image: Image
  description: string
}

export interface TextModule {
  html: string
}

export interface GalleryModule {
  images: Array<Image>
}

export type ModuleData = TitleModule | QuoteModule | ImageModule | TextModule | GalleryModule | {}

export interface ArticleModule {
  type: ModuleType
  data: ModuleData
}

export interface WP_Module {
  type: ModuleType
  label: string
  table_of_contents: string
  content_html: string
  image: {
    image?: WP_Image
    description: string
  }
  gallery?: Array<{ gallery_image: { image: WP_Image } }>
}

export function parseModules(data?: WP_Modules): ArticleModules {
  const modules: ArticleModules = []
  for (const module of data || []) modules.push(parseModule(module))
  return modules
}

export function parseModule(data?: WP_Module): ArticleModule {
  return {
    type: data?.type || 'title',
    data: getData(data),
  }
}

export function getData(data?: WP_Module): ModuleData {
  switch (data?.type) {
    case 'title':
      return { label: parseText(data.label), tableOfContent: parseText(data.table_of_contents) }
    case 'quote':
      return { label: parseText(data.label) }
    case 'image':
      return {
        image: parseImage(data?.image.image),
        description: parseText(data?.image.description),
      }
    case 'text':
      return {
        html: parseHTML(data.content_html),
      }
    case 'gallery':
      const images: Array<Image> = []
      for (const { gallery_image } of data?.gallery || [])
        images.push(parseImage(gallery_image.image))
      return {
        images,
      }
    default:
      return { label: '' }
  }
}
