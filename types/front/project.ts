export interface Plane {
  fixed: { from: number; to: number }
  position: { x: number; y: number }
  size: { x: number; y: number; z: number }
  rotate: { x: number; y: number; z: number }
  border: number
  zoom: number
  order: number
  forcePixelated?: boolean
}

export interface ClientAndCollaborator {
  client: { x: number; y: number }
  collaborator: { x: number; y: number }
}
