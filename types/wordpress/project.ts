import {
  parseText,
  type Image,
  type WP_Image,
  parseImage,
  type Video,
  type WP_Video,
  parseVideo,
} from '~/types/wordpress'
import {
  type WP_Client_Object,
  type Client,
  type WP_Clients,
  type WP_Client,
  parseClient,
} from '~/types/wordpress/client'

export type WP_Projects = Array<WP_Project>
export interface WP_Project {
  slug: string
  title: {
    rendered: string
  }
  acf: {
    freelance: boolean
    client?: Array<WP_Client_Object>
    thumbnail: {
      type: 'img' | 'vid'
      image?: WP_Image
      video?: WP_Video
    }
    primary_color: string
    secondary_color: string
  }
}

export type WP_Project_Objects = Array<WP_Project_Object>
export interface WP_Project_Object {
  post_name: string
}

export type Projects = Array<Project>
export interface Project {
  slug: string
  title: string
  color: string
  client: Client
  collaborator: Client
  freelance: boolean
  thumbnail: {
    type: 'img' | 'vid'
    image: Image
    video: Video
  }
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
  return {
    slug: parseText(project?.slug),
    title: parseText(project?.title.rendered),
    color: parseText(project?.acf.primary_color),
    client: parseClient({ client }),
    collaborator: parseClient({ client: collaborator }),
    freelance: !!project?.acf.freelance,
    thumbnail: {
      type: project?.acf.thumbnail.type || 'img',
      image: parseImage(project?.acf.thumbnail.image),
      video: parseVideo(project?.acf.thumbnail.video),
    },
  }
}
