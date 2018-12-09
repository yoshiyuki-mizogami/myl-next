interface MylConfig{
  lang:string
  aot:boolean
  theme:string
}
const DEF = {
  lang:'en',
  aot:false,
  theme:'Basic'
} as MylConfig
export default class Config{
  id?:number
  config:MylConfig = DEF
  constructor(def:MylConfig = DEF){
    Object.assign(this.config, def)
  }
}