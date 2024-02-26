export interface IntersectObserverParams {
  el: Element
  observerEl: Element
  onIntersect: (params: { el: Element }) => void
}

export type Observers = Array<{
  el: HTMLElement
  observerEl: HTMLElement
  observer: IntersectionObserver
}>
