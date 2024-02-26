import { type Service, type LocalStorageData } from '~/types/front/get-your-quote'

export interface State {
  state: {
    values: LocalStorageData
    data: Array<Service>
    started: string
    ids: {
      data: string
      active: string
      completed: string
      deploy: string
    }
    exceptions: { [key: string]: number }
  }
}
