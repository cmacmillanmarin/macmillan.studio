export interface IntersectObserverParams {
  el: Element
  onIntersect: IntersectCallback
}

export type IntersectCallback = (el: Element, visible: boolean) => void

export type Observers = Array<{
  el: HTMLElement
  observer: IntersectionObserver
}>
