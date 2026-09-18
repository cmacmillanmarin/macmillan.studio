import type { RouterConfig } from '@nuxt/schema'

// Scrolling (including hash targets) is handled by useScroll on its own container,
// never on window. Nuxt's default scrollBehavior would return `{ el: to.hash }` and
// warn because ids are suffixed by targetify() (`#projects` → `#projects-target`).
export default <RouterConfig>{
  scrollBehavior: () => false,
}
