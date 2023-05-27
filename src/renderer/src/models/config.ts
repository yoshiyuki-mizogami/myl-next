import { ThemeName } from '@renderer/lib/switch-theme'
import { LangUI } from "@renderer/lib/lang-swicher"

type Langs = 'en' | 'ja'
interface MylConfig {
  lang: Langs
  aot: boolean
  theme: ThemeName
}
const DEF = {
  lang: 'en',
  aot: false,
  theme: 'BASIC'
} as MylConfig

export default class Config implements MylConfig {
  id?: number
  lang!: Langs
  aot!: boolean
  theme!: ThemeName
  constructor(def: MylConfig = DEF) {
    Object.assign(this, def)
  }
}
