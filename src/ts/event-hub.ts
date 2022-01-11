import mitt from 'mitt'
const emitter = mitt()
export default emitter
const layers: any[] = []
export function pushLayer(l:any){
  layers.push(l)
}
export function popLayer(){
  layers.pop()
}
export function keydown(ev:any){
  const topLayer = layers.at(-1)
  if(topLayer === undefined){
    return
  }
  topLayer.$emit('keydown', ev)
}