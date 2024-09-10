import {
  parseText,
  parseHead,
  type Head,
  type WP_Image,
  type Image,
  parseImage,
} from '~/types/wordpress'
import {
  type WP_Projects,
  type WP_Project_Objects,
  type Projects,
  parseProjects,
} from '~/types/wordpress/project'
import {
  type WP_Services,
  type Services,
  parseServices,
  type WP_Service_Objects,
} from '~/types/wordpress/service'
import {
  type Testimonials,
  type WP_Testimonial_Objects,
  type WP_Testimonials,
  parseTestimonials,
} from '~/types/wordpress/testimonial'
import {
  parseClients,
  type Clients,
  type WP_Client_Objects,
  type WP_Clients,
} from '~/types/wordpress/client'

export interface WP_Homepage {
  acf: {
    seo: Head
    hero: {
      title: string
      hint: string
      video_poster?: WP_Image
      video_youtube_id: string
    }
    projects: {
      title: string
      list: WP_Project_Objects
    }
    services: {
      title: string
      hint: string
      list: WP_Service_Objects
    }
    about: {
      title: string
      hint: string
      image?: WP_Image
      credit: string
      detail: string
      clients: {
        title: string
        hint: string
        list: WP_Client_Objects
      }
      collaborator: {
        title: string
        description: string
        image?: WP_Image
        credit: string
      }
      testimonials: WP_Testimonial_Objects
    }
  }
}

export interface HomepageHero {
  title: string
  hint: string
}

export interface HomepageProjects {
  title: string
  list: Projects
}

export interface HomepageServices {
  title: string
  hint: string
  list: Services
}

export interface HomepageAboutClients {
  title: string
  hint: string
  list: Clients
}

export interface HomepageAbout {
  title: string
  hint: string
  thumbnail: Image
  credit: string
  detail: string
  clients: HomepageAboutClients
  collaborator: {
    title: string
    description: string
    thumbnail: Image
    credit: string
  }
  testimonials: Testimonials
}

export interface Homepage {
  head: Head
  hero: HomepageHero
  projects: HomepageProjects
  services: HomepageServices
  about: HomepageAbout
}

export function parseHomepage(params: {
  homepage?: WP_Homepage
  projects?: WP_Projects
  services?: WP_Services
  clients?: WP_Clients
  testimonials?: WP_Testimonials
}): Homepage {
  const { homepage, projects, services, clients, testimonials } = params

  const listedClients = clients?.filter(
    client => !!homepage?.acf.about.clients.list.find(c => c.post_name === client.slug)
  )

  return {
    head: parseHead(homepage?.acf.seo),
    hero: {
      title: parseText(homepage?.acf.hero.title),
      hint: parseText(homepage?.acf.hero.hint),
    },
    projects: {
      title: parseText(homepage?.acf.projects.title),
      list: parseProjects({ projects, clients }),
    },
    services: {
      title: parseText(homepage?.acf.services.title),
      hint: parseText(homepage?.acf.services.hint),
      list: parseServices({ services }),
    },
    about: {
      title: parseText(homepage?.acf.about.title),
      hint: parseText(homepage?.acf.about.hint),
      thumbnail: parseImage(homepage?.acf.about.image),
      credit: parseText(homepage?.acf.about.credit),
      detail: parseText(homepage?.acf.about.detail),
      clients: {
        title: parseText(homepage?.acf.about.clients.title),
        hint: parseText(homepage?.acf.about.clients.hint),
        list: parseClients({ clients: listedClients }),
      },
      collaborator: {
        title: parseText(homepage?.acf.about.collaborator.title),
        description: parseText(homepage?.acf.about.collaborator.description),
        thumbnail: parseImage(homepage?.acf.about.collaborator.image),
        credit: parseText(homepage?.acf.about.collaborator.credit),
      },
      testimonials: parseTestimonials({ testimonials }),
    },
  }
}
