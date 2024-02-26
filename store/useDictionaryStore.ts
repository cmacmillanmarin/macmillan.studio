import { defineStore } from 'pinia'
import { type Thumbnail, parseThumbnail } from '~/types/wordpress'
import { type Dictionary, type SocialNetwork } from '~/types/wordpress/dictionary'

export default defineStore('use-dictionary-store', {
  state: (): Dictionary => ({
    sn: [],
    copy: {},
    thumbnail: {},
  }),
  getters: {
    get(): Function {
      return (id: string): string => {
        return this.copy[id] || id
      }
    },
    getImage() {
      return (id: string): Thumbnail => {
        return this.thumbnail[id] || parseThumbnail()
      }
    },
    socialNetworks(): Array<SocialNetwork> {
      return this.sn
    },
  },
  actions: {
    add(data?: Dictionary): void {
      this.sn = data?.sn || []
      this.copy = data?.copy || {}
      this.thumbnail = data?.thumbnail || {}
    },
  },
})
