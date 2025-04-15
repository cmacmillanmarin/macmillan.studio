type SoundType = 'click' | 'hover' | 'decode'
type SoundFile = '1' | '2' | '3' | '4' | 'decode'
type Decode = 'decode'
const clicks: Array<SoundFile> = ['4']
const hovers: Array<SoundFile> = ['3']
const decodes: Array<SoundFile> = ['decode']

import { loadScript } from '~/utils'

class Sound {
  private static instance: Sound
  private players: { [key: string]: { [key: string]: any } } = {}

  private _onClick: () => void = this.onClick.bind(this)
  private _previous: SoundFile | null = null

  private constructor() {}

  public async init() {
    await loadScript({ src: 'http://unpkg.com/tone', name: 'Tone' })
    for (const click of clicks) {
      this.players.click = {}
      const player = new Tone.Player({
        url: `/assets/audio/${click}.mp3`,
        autostart: false,
        loop: false,
        onload: () => {
          this.players.click[click] = player
        },
      }).toDestination()
    }
    for (const hover of hovers) {
      this.players.hover = {}
      const player = new Tone.Player({
        url: `/assets/audio/${hover}.mp3`,
        autostart: false,
        loop: false,
        onload: () => {
          this.players.hover[hover] = player
        },
      }).toDestination()
    }
    document.addEventListener('click', this._onClick)
  }

  public static get(): Sound {
    if (!Sound.instance) {
      Sound.instance = new Sound()
    }
    return Sound.instance
  }

  private onClick() {
    this.emit('click')
  }

  private getSource(type: SoundType): string {
    if (type === 'click') {
      return this.random(clicks)
    }
    if (type === 'hover') {
      return this.random(hovers)
    }
    return this.random(decodes)
  }

  private random(options: Array<SoundFile>): SoundFile {
    if (options.length === 1) return options[0]
    let index = Math.floor(Math.random() * options.length)
    while (options[index] === this._previous) {
      index = Math.floor(Math.random() * options.length)
    }
    this._previous = options[index]
    return options[index]
  }

  public emit(type: SoundType) {
    this.players[type][this.getSource(type)].start()
  }

  public destroy() {
    document.removeEventListener('click', this._onClick)
    this.players = {}
  }
}

export const sound = Sound.get()
