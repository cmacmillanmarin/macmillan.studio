type SoundType = 'click' | 'hover' | 'decode'
type Click = '1'
type Hover = '2' | '3' | '4'
type Decode = 'decode'
const clicks: Array<Click> = ['1']
const hovers: Array<Hover> = ['2', '3', '4']
const decodes: Array<Decode> = ['decode']

class Sound {
  private static instance: Sound
  private audio: HTMLAudioElement | null = null
  private _onClick: () => void = this.onClick.bind(this)
  private _previous: Click | Hover | Decode | null = null

  private constructor() {}

  public init() {
    document.addEventListener('click', this._onClick)
  }

  public static get(): Sound {
    if (!Sound.instance) {
      Sound.instance = new Sound()
    }
    return Sound.instance
  }

  private onClick() {
    this.audio = new Audio()
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

  private random(options: Array<Click | Hover | Decode>): Click | Hover | Decode {
    if (options.length === 1) return options[0]
    let index = Math.floor(Math.random() * options.length)
    while (options[index] === this._previous) {
      index = Math.floor(Math.random() * options.length)
    }
    this._previous = options[index]
    return options[index]
  }

  public emit(type: SoundType, params?: { loop?: boolean }) {
    if (this.audio && this.audio.paused) {
      this.audio.src = '/assets/audio/' + this.getSource(type) + '.mp3'
      this.audio.loop = !!params?.loop
      this.audio.play()
    }
  }

  public stop() {
    if (this.audio && !this.audio.paused) {
      this.audio.pause()
    }
  }

  public destroy() {
    document.removeEventListener('click', this._onClick)
    this.audio = null
  }
}

export const sound = Sound.get()
