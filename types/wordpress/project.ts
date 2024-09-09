import { parseText } from '~/types/wordpress'
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
    client?: Array<WP_Client_Object>
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
}

export function parseProjects(params: { projects?: WP_Projects; clients?: WP_Clients }): Projects {
  const projects: Projects = []
  for (const project of params.projects || []) {
    const post_name: string =
      Array.isArray(project.acf.client) && project.acf.client.length
        ? project.acf.client[0].post_name
        : ''
    const client: WP_Client | undefined = params.clients?.find(
      (client: WP_Client) => client.slug === post_name
    )
    projects.push(parseProject({ project, client }))
  }
  return projects
}

export function parseProject(params: { project?: WP_Project; client?: WP_Client }): Project {
  const { project, client } = params
  return {
    slug: parseText(project?.slug),
    title: parseText(project?.title.rendered),
    color: parseText(project?.acf.primary_color),
    client: parseClient({ client }),
  }
}
