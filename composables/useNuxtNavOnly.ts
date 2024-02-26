export default function useNuxtNavOnly() {
  const router = useRouter()

  let links: Array<HTMLAnchorElement> = []

  function navigate(e: MouseEvent): void {
    const href = (e.target as HTMLAnchorElement).getAttribute('href')
    const target = (e.target as HTMLAnchorElement).getAttribute('target')
    const internal = href?.charAt(0) === '/'
    if (href && internal && target !== '_blank') {
      e.preventDefault()
      e.stopPropagation()
      console.log(`useNuxtNavOnly :: to ${href}`)
      router.push(href)
    }
  }

  function addLinks(el: HTMLElement): void {
    const query = el.querySelectorAll('a')
    for (const link of query) {
      if (link.dataset.customAnchor !== undefined) {
        links.push(link)
        link.addEventListener('click', navigate, false)
      }
    }
  }

  function removeLinks(): void {
    for (const link of links) {
      link.removeEventListener('click', navigate)
    }
    links = []
  }

  return { addLinks, removeLinks }
}
