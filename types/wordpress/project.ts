import {
  parseText,
  parseFile,
  type File,
  type WP_File,
  type Head,
  type WP_Head,
  parseHead,
} from '~/types/wordpress'
import {
  type WP_Client_Object,
  type Client,
  type WP_Clients,
  type WP_Client,
  parseClient,
} from '~/types/wordpress/client'
import { orderArrayWithKeywords } from '~/utils'

export type WP_Projects = Array<WP_Project>

export interface WP_Recognition {
  recognition: string
}
export interface WP_Project {
  slug: string
  title: {
    rendered: string
  }
  tech_stack_tag?: Array<number>
  acf: {
    seo: WP_Head
    selected_project?: boolean
    link: string
    primary_color: string
    secondary_color: string
    tertiary_color: string
    thumbnail: WP_File
    info?: Array<{ title: string; label: string }>
    description: string
    assets?: Array<WP_Project_Asset>
    recognitions?: Array<WP_Recognition>
    freelance: boolean
    client?: Array<WP_Client_Object>
    services?: Array<number>
  }
  _embedded?: {
    'acf:post'?: Array<{
      id: number
      type: 'service' | 'client'
      title: { rendered: string }
    }>
    'wp:term'?: Array<
      Array<{
        id: number
        taxonomy: 'category' | 'tech_stack_tag'
        name: string
      }>
    >
  }
}

export type WP_Project_Objects = Array<WP_Project_Object>
export interface WP_Project_Object {
  post_name: string
}

export type ProjectAssetLayoutType = 'full' | 'top' | 'bottom' | 'center' | 'scroll' | 'vimeo'

export interface WP_Project_Asset {
  layout: ProjectAssetLayoutType
  gap: 'l' | 'm' | 's'
  transparent: boolean
  mobile: boolean
  file: WP_File
  vimeo_url?: string
}

export interface ProjectAsset {
  layout: ProjectAssetLayoutType
  gap: 'l' | 'm' | 's'
  transparent: boolean
  mobile: boolean
  file: File
  vimeoURL: string
}

export type Projects = Array<Project>

export interface Project {
  slug: string
  head: Head
  title: string
  selected: boolean
  link: string
  color: string
  secondaryColor: string
  tertiaryColor: string
  thumbnail: File
  description: string
  info: Array<{ title: string; label: string }>
  assets: Array<ProjectAsset>
  recognitions: Array<string>
  client: Client
  collaborator: Client
  freelance: boolean
  services: Array<string>
  techStack: Array<string>
}

export function parseProjects(params: { projects?: WP_Projects; clients?: WP_Clients }): Projects {
  const projects: Projects = []
  for (const project of params.projects || []) {
    const client_slug: string =
      Array.isArray(project.acf.client) && project.acf.client.length
        ? project.acf.client[0].post_name
        : ''
    const collaborator__slug: string =
      Array.isArray(project.acf.client) && project.acf.client.length > 1
        ? project.acf.client[1].post_name
        : ''

    const client: WP_Client | undefined = params.clients?.find(
      (client: WP_Client) => client.slug === client_slug
    )
    const collaborator: WP_Client | undefined = params.clients?.find(
      (client: WP_Client) => client.slug === collaborator__slug
    )
    projects.push(parseProject({ project, client, collaborator }))
  }
  return projects
}

export function parseProject(params: {
  project?: WP_Project
  client?: WP_Client
  collaborator?: WP_Client
}): Project {
  const { project, client, collaborator } = params
  const assets: Array<WP_Project_Asset> = project?.acf.assets
    ? project?.acf.assets.filter(
        asset =>
          (asset.layout === 'vimeo' && asset.vimeo_url) ||
          (asset.file.type === 'img' && asset.file.image?.url) ||
          (asset.file.type === 'vid' && asset.file.videos.mp4?.url && asset.file.videos.webm?.url)
      )
    : []

  const services: Array<string> = []
  for (const serviceId of project?.acf.services || []) {
    const service = project?._embedded?.['acf:post']?.find(post => post.id === serviceId)
    service && services.push(service.title.rendered)
  }

  let techStack: Array<string> = []
  for (const tag of project?._embedded?.['wp:term'] || []) {
    for (const t of tag) {
      if (t.taxonomy === 'tech_stack_tag') {
        techStack.push(t.name)
      }
    }
  }

  techStack = orderArrayWithKeywords({
    array: techStack,
    keywordsStart: ['Nuxt', 'Vue', 'React', 'Three.js', 'Gsap'],
    keywordsEnd: ['Vercel'],
  })

  return {
    slug: parseText(project?.slug),
    head: parseHead(project?.acf.seo),
    link: parseText(project?.acf.link),
    title: parseText(project?.title.rendered),
    selected: !!project?.acf.selected_project,
    color: parseText(project?.acf.primary_color),
    secondaryColor: parseText(project?.acf.secondary_color),
    tertiaryColor: parseText(project?.acf.tertiary_color),
    thumbnail: parseFile(project?.acf.thumbnail),
    description: parseText(project?.acf.description),
    info: project?.acf.info
      ? project?.acf.info.map(i => {
          return {
            title: parseText(i.title),
            label: parseText(i.label),
          }
        })
      : [],
    assets: assets.map(asset => {
      return {
        layout: asset.layout,
        gap: asset.gap,
        transparent: !!asset.transparent,
        mobile: !!asset.mobile,
        file: parseFile(asset.file),
        vimeoURL: asset.vimeo_url || '',
      }
    }),
    recognitions: project?.acf.recognitions?.length
      ? project?.acf.recognitions?.map(r => r.recognition)
      : [],
    client: parseClient({ client }),
    collaborator: parseClient({ client: collaborator }),
    freelance: !!project?.acf.freelance,
    services,
    techStack,
  }
}
