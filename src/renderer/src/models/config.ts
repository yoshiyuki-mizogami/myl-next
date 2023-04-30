type Langs = 'en'|'ja'
interface MylConfig{
  lang:Langs
  aot:boolean
  theme:string
}
const DEF = {
  lang:'en',
  aot:false,
  theme:'Basic'
} as MylConfig

export default class Config implements MylConfig{
  id?:number
  lang!:Langs
  aot!:boolean
  theme!:string
  constructor(def:MylConfig = DEF){
    Object.assign(this, def)
  }
}