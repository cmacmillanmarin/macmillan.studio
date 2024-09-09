import { parseText } from '~/types/wordpress'

export type WP_Projects = Array<WP_Project>
export interface WP_Project {
  slug: string
  title: {
    rendered: string
  }
  acf: {
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
}

export function parseProjects(params: { projects?: WP_Projects }): Projects {
  const projects: Projects = []
  for (const project of params.projects || []) {
    projects.push(parseProject({ project }))
  }
  return projects
}

export function parseProject(params: { project?: WP_Project }): Project {
  const { project } = params
  return {
    slug: parseText(project?.slug),
    title: parseText(project?.title.rendered),
    color: parseText(project?.acf.primary_color),
  }
}
